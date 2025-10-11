from rest_framework import generics, permissions
from apps.users.serializers import UserSerializer
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from django.contrib.auth import login
from rest_framework import permissions
from rest_framework.authtoken.serializers import AuthTokenSerializer
from knox.views import LoginView as KnoxLoginView


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        login(request, user)
        return super(LoginView, self).post(request, format=None)


User = get_user_model()


class ProfileView(generics.RetrieveAPIView):
    """
    🔹 Foydalanuvchi profili:
    Token orqali login bo‘lgan user haqida ma'lumot qaytaradi.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
