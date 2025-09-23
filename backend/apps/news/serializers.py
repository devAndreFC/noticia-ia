from rest_framework import serializers
from .models import News, Category


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer para o modelo Category
    """
    news_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'is_active', 'news_count', 'created_at']
        read_only_fields = ['id', 'created_at', 'news_count']
    
    def get_news_count(self, obj):
        return obj.news.filter(is_published=True).count()


class NewsListSerializer(serializers.ModelSerializer):
    """
    Serializer para listagem de notícias (campos resumidos)
    """
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = News
        fields = [
            'id', 'title', 'slug', 'summary', 'source', 'image_url',
            'category', 'category_id', 'is_featured', 'published_at'
        ]
        read_only_fields = ['id', 'slug', 'published_at']


class NewsDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para detalhes completos da notícia
    """
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = News
        fields = [
            'id', 'title', 'slug', 'summary', 'content', 'source', 'source_url',
            'image_url', 'category', 'category_id', 'is_published', 'is_featured',
            'published_at', 'created_at', 'updated_at', 'ai_summary', 'sentiment_score'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class NewsCreateSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de notícias
    """
    class Meta:
        model = News
        fields = [
            'title', 'summary', 'content', 'source', 'source_url',
            'image_url', 'category', 'is_published', 'is_featured'
        ]
    
    def validate_title(self, value):
        if len(value) < 10:
            raise serializers.ValidationError("O título deve ter pelo menos 10 caracteres.")
        return value
    
    def validate_summary(self, value):
        if len(value) < 20:
            raise serializers.ValidationError("O resumo deve ter pelo menos 20 caracteres.")
        return value