from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register/', views.register),
    path('auth/login/',    TokenObtainPairView.as_view()),
    path('auth/refresh/',  TokenRefreshView.as_view()),
    path('tts/',           views.text_to_speech),
    path('translate/',     views.translate_and_speak),
    path('stt/',           views.speech_to_text),
    path('history/',       views.history),
    path('stats/',          views.usage_stats),
    path('profile/update/', views.update_profile),
]