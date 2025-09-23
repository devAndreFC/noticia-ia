from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    
    # User Preferences
    path('preferences/', views.UserPreferenceView.as_view(), name='preferences'),
    path('categories/', views.available_categories, name='categories'),
    path('preferred-categories/', views.user_preferred_categories, name='preferred_categories'),
    path('update-categories/', views.update_preferred_categories, name='update_categories'),
    
    # User Statistics
    path('stats/', views.user_stats, name='stats'),
]