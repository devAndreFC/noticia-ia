from django.contrib import admin
from django.utils.html import format_html
from .models import News, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'is_active', 'news_count', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ['created_at', 'updated_at']
    
    def news_count(self, obj):
        return obj.news.count()
    news_count.short_description = 'Qtd. Notícias'


@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'category', 'source', 'is_published', 
        'is_featured', 'published_at', 'created_at'
    ]
    list_filter = [
        'is_published', 'is_featured', 'category', 
        'source', 'published_at', 'created_at'
    ]
    search_fields = ['title', 'summary', 'content', 'source']
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ['created_at', 'updated_at', 'slug']
    date_hierarchy = 'published_at'
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('title', 'slug', 'category', 'summary')
        }),
        ('Conteúdo', {
            'fields': ('content', 'image_url')
        }),
        ('Fonte', {
            'fields': ('source', 'source_url')
        }),
        ('Configurações', {
            'fields': ('is_published', 'is_featured', 'published_at')
        }),
        ('IA e Análise', {
            'fields': ('ai_summary', 'sentiment_score'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')
    
    actions = ['mark_as_published', 'mark_as_unpublished', 'mark_as_featured']
    
    def mark_as_published(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f'{updated} notícias foram publicadas.')
    mark_as_published.short_description = 'Marcar como publicado'
    
    def mark_as_unpublished(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(request, f'{updated} notícias foram despublicadas.')
    mark_as_unpublished.short_description = 'Marcar como não publicado'
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} notícias foram marcadas como destaque.')
    mark_as_featured.short_description = 'Marcar como destaque'