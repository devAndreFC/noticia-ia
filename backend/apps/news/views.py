from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import timedelta
from django.db.models import Q

from .models import News, Category
from .serializers import (
    NewsListSerializer, 
    NewsDetailSerializer, 
    NewsCreateSerializer,
    CategorySerializer
)
from .filters import NewsFilter


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar categorias
    """
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class NewsViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciar notícias
    """
    queryset = News.objects.filter(is_published=True).select_related('category')
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = NewsFilter
    search_fields = ['title', 'summary', 'content', 'source']
    ordering_fields = ['published_at', 'created_at', 'title']
    ordering = ['-published_at']
    
    def get_serializer_class(self):
        """
        Retorna o serializer apropriado baseado na action
        """
        if self.action == 'list':
            return NewsListSerializer
        elif self.action == 'create':
            return NewsCreateSerializer
        return NewsDetailSerializer
    
    def get_queryset(self):
        """
        Filtra queryset baseado nos parâmetros da URL
        """
        queryset = super().get_queryset()
        
        # Filtro por período
        period = self.request.query_params.get('period', None)
        if period:
            now = timezone.now()
            if period == 'day':
                start_date = now - timedelta(days=1)
            elif period == 'week':
                start_date = now - timedelta(weeks=1)
            elif period == 'month':
                start_date = now - timedelta(days=30)
            else:
                start_date = None
            
            if start_date:
                queryset = queryset.filter(published_at__gte=start_date)
        
        # Filtro por categoria
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(
                Q(category__slug=category) | Q(category__id=category)
            )
        
        # Filtro por destaque
        featured = self.request.query_params.get('featured', None)
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(is_featured=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Endpoint para notícias em destaque
        """
        featured_news = self.get_queryset().filter(is_featured=True)[:5]
        serializer = self.get_serializer(featured_news, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        Endpoint para últimas notícias
        """
        latest_news = self.get_queryset()[:10]
        serializer = self.get_serializer(latest_news, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Endpoint para notícias agrupadas por categoria
        """
        categories = Category.objects.filter(is_active=True)
        result = []
        
        for category in categories:
            news = self.get_queryset().filter(category=category)[:5]
            if news:
                result.append({
                    'category': CategorySerializer(category).data,
                    'news': NewsListSerializer(news, many=True).data
                })
        
        return Response(result)