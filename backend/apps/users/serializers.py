from rest_framework.serializers import ModelSerializer
from django.contrib.auth import get_user_model
User = get_user_model()


class UserSerializer(ModelSerializer):
    """Foydalanuvchi ma'lumotlarini qaytaruvchi serializer."""

    class Meta:
        model = User
        fields = ["id", "name", "username", "first_name", "last_name",
                  "last_name", "email", 'name']
