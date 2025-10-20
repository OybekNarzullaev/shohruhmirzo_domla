from django.urls import path
from .views import AdatationLoadStatsAPI

urlpatterns = [
    path('adatation_loads/', AdatationLoadStatsAPI.as_view())
]
