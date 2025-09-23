import django_filters
from django.utils import timezone
from datetime import timedelta
from .models import News, Category


class NewsFilter(django_filters.FilterSet):
    """
    Filtros customizados para notícias
    """
    # Filtro por categoria
    category = django_filters.ModelChoiceFilter(
        queryset=Category.objects.filter(is_active=True),
        field_name='category'
    )
    
    category_slug = django_filters.CharFilter(
        field_name='category__slug',
        lookup_expr='iexact'
    )
    
    # Filtro por período
    period = django_filters.ChoiceFilter(
        choices=[
            ('day', 'Último dia'),
            ('week', 'Última semana'),
            ('month', 'Último mês'),
        ],
        method='filter_by_period'
    )
    
    # Filtro por data
    published_after = django_filters.DateTimeFilter(
        field_name='published_at',
        lookup_expr='gte'
    )
    
    published_before = django_filters.DateTimeFilter(
        field_name='published_at',
        lookup_expr='lte'
    )
    
    # Filtro por fonte
    source = django_filters.CharFilter(
        field_name='source',
        lookup_expr='icontains'
    )
    
    # Filtro por destaque
    featured = django_filters.BooleanFilter(
        field_name='is_featured'
    )
    
    # Filtro por busca no título e conteúdo
    search = django_filters.CharFilter(
        method='filter_search'
    )
    
    class Meta:
        model = News
        fields = {
            'title': ['icontains'],
            'summary': ['icontains'],
            'published_at': ['gte', 'lte'],
            'is_featured': ['exact'],
            'category': ['exact'],
        }
    
    def filter_by_period(self, queryset, name, value):
        """
        Filtra notícias por período
        """
        if not value:
            return queryset
        
        now = timezone.now()
        
        if value == 'day':
            start_date = now - timedelta(days=1)
        elif value == 'week':
            start_date = now - timedelta(weeks=1)
        elif value == 'month':
            start_date = now - timedelta(days=30)
        else:
            return queryset
        
        return queryset.filter(published_at__gte=start_date)
    
    def filter_search(self, queryset, name, value):
        """
        Busca em múltiplos campos
        """
        if not value:
            return queryset
        
        from django.db.models import Q
        
        return queryset.filter(
            Q(title__icontains=value) |
            Q(summary__icontains=value) |
            Q(content__icontains=value) |
            Q(source__icontains=value)
        )