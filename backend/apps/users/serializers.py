from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from .models import User, UserPreference
from apps.news.models import Category


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer para registro de usuários
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("As senhas não coincidem.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        
        # Criar preferências padrão para o usuário
        UserPreference.objects.create(user=user)
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer customizado para JWT com informações do usuário
    """
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Adicionar informações do usuário ao token
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'full_name': self.user.full_name,
        }
        
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer para perfil do usuário
    """
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 
            'full_name', 'is_email_verified', 'created_at'
        ]
        read_only_fields = ['id', 'email', 'username', 'is_email_verified', 'created_at']


class CategoryPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer simples para categorias nas preferências
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']


class UserPreferenceSerializer(serializers.ModelSerializer):
    """
    Serializer para preferências do usuário
    """
    preferred_categories = CategoryPreferenceSerializer(many=True, read_only=True)
    preferred_category_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = UserPreference
        fields = [
            'preferred_categories', 'preferred_category_ids',
            'email_notifications', 'daily_digest', 'weekly_digest',
            'show_featured_only', 'max_news_per_page'
        ]
    
    def update(self, instance, validated_data):
        # Atualizar categorias preferidas se fornecidas
        preferred_category_ids = validated_data.pop('preferred_category_ids', None)
        if preferred_category_ids is not None:
            categories = Category.objects.filter(id__in=preferred_category_ids, is_active=True)
            instance.preferred_categories.set(categories)
        
        # Atualizar outros campos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer para mudança de senha
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Senha atual incorreta.")
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("As novas senhas não coincidem.")
        return attrs
    
    def save(self):
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user