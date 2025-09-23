from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NewsViewSet, CategoryViewSet

# Criar router para as ViewSets
router = DefaultRouter()
router.register(r'news', NewsViewSet, basename='news')
router.register(r'categories', CategoryViewSet, basename='categories')

app_name = 'news'

urlpatterns = [
    path('', include(router.urls)),
]