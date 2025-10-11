from django.urls import path, include
from knox import views as knox_views
from .views import LoginView, ProfileView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", knox_views.LogoutView.as_view(), name="logout"),
    path("logoutall/", knox_views.LogoutAllView.as_view(), name="logoutall"),
    path("profile/", ProfileView.as_view(), name="ProfileView"),
]
