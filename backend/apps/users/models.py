
from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    TEACHER = "teacher", "O‘qituvchi"
    ADMIN = "admin", "Administrator"
    SUPERADMIN = "superadmin", "Superadmin"


class User(AbstractUser):
    # qo‘shimcha maydonlar
    patronymic = models.CharField("Otasining ismi", max_length=50, blank=True)
    phone = models.CharField("Telefon raqam", max_length=20, blank=True)
    major = models.CharField("Telefon raqam", max_length=20, blank=True)
    avatar = models.ImageField(
        upload_to='user_avatars/', null=True, blank=True
    )
    role = models.CharField(
        "Rol", max_length=20,
        choices=Role.choices, default=Role.TEACHER
    )
    description = models.TextField("Izoh", blank=True, null=True)

    @property
    def name(self):
        """Foydalanuvchining to‘liq ismi"""
        parts = [self.last_name, self.first_name, self.patronymic]
        return " ".join(p for p in parts if p)

    def __str__(self):
        return self.name or self.username

    class Meta:
        verbose_name = "Foydalanuvchi"
        verbose_name_plural = "Foydalanuvchilar"
