from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model

from .models import UserPreference
from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    UserPreferenceSerializer,
    PasswordChangeSerializer,
    CategoryPreferenceSerializer
)
from apps.news.models import Category

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """
    View para registro de novos usuários
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'Usuário criado com sucesso!',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'full_name': user.full_name
            }
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View customizada para login com JWT
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View para visualizar e atualizar perfil do usuário
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserPreferenceView(generics.RetrieveUpdateAPIView):
    """
    View para visualizar e atualizar preferências do usuário
    """
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        preference, created = UserPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference


class PasswordChangeView(generics.GenericAPIView):
    """
    View para mudança de senha
    """
    serializer_class = PasswordChangeSerializer
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'message': 'Senha alterada com sucesso!'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def available_categories(request):
    """
    Endpoint para listar todas as categorias disponíveis
    """
    categories = Category.objects.filter(is_active=True)
    serializer = CategoryPreferenceSerializer(categories, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_preferred_categories(request):
    """
    Endpoint para listar categorias preferidas do usuário
    """
    try:
        preferences = request.user.preferences
        categories = preferences.preferred_categories.filter(is_active=True)
        serializer = CategoryPreferenceSerializer(categories, many=True)
        return Response(serializer.data)
    except UserPreference.DoesNotExist:
        return Response([], status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_preferred_categories(request):
    """
    Endpoint para atualizar categorias preferidas do usuário
    """
    try:
        preferences = request.user.preferences
    except UserPreference.DoesNotExist:
        preferences = UserPreference.objects.create(user=request.user)
    
    category_ids = request.data.get('category_ids', [])
    
    if not isinstance(category_ids, list):
        return Response({
            'error': 'category_ids deve ser uma lista'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validar se todas as categorias existem e estão ativas
    categories = Category.objects.filter(
        id__in=category_ids, 
        is_active=True
    )
    
    if len(categories) != len(category_ids):
        return Response({
            'error': 'Uma ou mais categorias são inválidas'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Atualizar preferências
    preferences.preferred_categories.set(categories)
    
    # Retornar categorias atualizadas
    serializer = CategoryPreferenceSerializer(categories, many=True)
    return Response({
        'message': 'Preferências atualizadas com sucesso!',
        'preferred_categories': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_stats(request):
    """
    Endpoint para estatísticas do usuário
    """
    user = request.user
    
    try:
        preferences = user.preferences
        preferred_count = preferences.preferred_categories.count()
    except UserPreference.DoesNotExist:
        preferred_count = 0
    
    stats = {
        'user_id': user.id,
        'email': user.email,
        'full_name': user.full_name,
        'member_since': user.created_at,
        'preferred_categories_count': preferred_count,
        'email_verified': user.is_email_verified,
    }
    
    return Response(stats)