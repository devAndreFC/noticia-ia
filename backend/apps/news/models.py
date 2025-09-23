from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Category(models.Model):
    """
    Modelo para categorias de notícias
    """
    name = models.CharField(max_length=100, unique=True, verbose_name='Nome')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='Slug')
    description = models.TextField(blank=True, verbose_name='Descrição')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'
        ordering = ['name']

    def __str__(self):
        return self.name


class News(models.Model):
    """
    Modelo para notícias
    """
    title = models.CharField(max_length=200, verbose_name='Título')
    slug = models.SlugField(max_length=200, unique=True, verbose_name='Slug')
    summary = models.TextField(max_length=500, verbose_name='Resumo')
    content = models.TextField(verbose_name='Conteúdo')
    source = models.CharField(max_length=100, verbose_name='Fonte')
    source_url = models.URLField(blank=True, verbose_name='URL da Fonte')
    image_url = models.URLField(blank=True, verbose_name='URL da Imagem')
    
    # Relacionamentos
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='news',
        verbose_name='Categoria'
    )
    
    # Campos de controle
    is_published = models.BooleanField(default=True, verbose_name='Publicado')
    is_featured = models.BooleanField(default=False, verbose_name='Destaque')
    
    # Timestamps
    published_at = models.DateTimeField(default=timezone.now, verbose_name='Publicado em')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    # Campos para IA
    ai_summary = models.TextField(blank=True, verbose_name='Resumo IA')
    sentiment_score = models.FloatField(null=True, blank=True, verbose_name='Score de Sentimento')
    
    class Meta:
        verbose_name = 'Notícia'
        verbose_name_plural = 'Notícias'
        ordering = ['-published_at']
        indexes = [
            models.Index(fields=['-published_at']),
            models.Index(fields=['category', '-published_at']),
            models.Index(fields=['is_published', '-published_at']),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            import uuid
            self.slug = f"{slugify(self.title)}-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)