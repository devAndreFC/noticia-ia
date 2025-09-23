from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Modelo customizado de usuário
    """
    email = models.EmailField(unique=True, verbose_name='Email')
    first_name = models.CharField(max_length=150, verbose_name='Nome')
    last_name = models.CharField(max_length=150, verbose_name='Sobrenome')
    is_email_verified = models.BooleanField(default=False, verbose_name='Email Verificado')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        verbose_name = 'Usuário'
        verbose_name_plural = 'Usuários'
        
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()


class UserPreference(models.Model):
    """
    Modelo para preferências do usuário
    """
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='preferences',
        verbose_name='Usuário'
    )
    
    # Preferências de categorias
    preferred_categories = models.ManyToManyField(
        'news.Category',
        blank=True,
        related_name='preferred_by_users',
        verbose_name='Categorias Preferidas'
    )
    
    # Configurações de notificação
    email_notifications = models.BooleanField(default=True, verbose_name='Notificações por Email')
    daily_digest = models.BooleanField(default=False, verbose_name='Resumo Diário')
    weekly_digest = models.BooleanField(default=True, verbose_name='Resumo Semanal')
    
    # Configurações de conteúdo
    show_featured_only = models.BooleanField(default=False, verbose_name='Apenas Destaques')
    max_news_per_page = models.PositiveIntegerField(default=20, verbose_name='Notícias por Página')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Criado em')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Atualizado em')
    
    class Meta:
        verbose_name = 'Preferência do Usuário'
        verbose_name_plural = 'Preferências dos Usuários'
        
    def __str__(self):
        return f"Preferências de {self.user.full_name}"