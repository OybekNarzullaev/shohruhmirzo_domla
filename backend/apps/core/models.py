from django.db import models


from django.db import models


class Athlete(models.Model):
    firstname = models.CharField("Ism", max_length=50)
    lastname = models.CharField("Familiya", max_length=50)
    patronymic = models.CharField("Otasining ismi", max_length=50, blank=True)
    weight = models.PositiveSmallIntegerField("Vazn (kg)")
    height = models.PositiveSmallIntegerField("Bo‘y (sm)")
    birth_year = models.PositiveSmallIntegerField("Tug‘ilgan yil")
    picture = models.ImageField(
        "Rasm", upload_to='athlete_pictures/', blank=True, null=True)

    created_at = models.DateTimeField("Yaratilgan sana", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan sana", auto_now=True)

    @property
    def fullname(self) -> str:
        """Foydalanuvchining to‘liq ismi (Familiya Ism Otasining ismi)."""
        if self.patronymic:
            return f"{self.lastname} {self.firstname} {self.patronymic}"
        return f"{self.lastname} {self.firstname}"

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

    class Meta:
        verbose_name = "Sportchi"
        verbose_name_plural = "Sportchilar"
        ordering = ["lastname", "firstname"]


class SportType(models.Model):
    name = models.CharField("Sport turi nomi", max_length=100, unique=True)
    description = models.TextField("Izoh", blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Sport turi"
        verbose_name_plural = "Sport turlari"
        ordering = ["name"]


class TrainingSession(models.Model):
    athlete = models.ForeignKey(
        "Athlete",
        on_delete=models.CASCADE,
        related_name="training_sessions",
        verbose_name="Sportchi"
    )
    sport_type = models.ForeignKey(
        SportType,
        on_delete=models.PROTECT,
        related_name="sessions",
        verbose_name="Sport turi"
    )
    pre_heart_rate = models.PositiveSmallIntegerField(
        "Mashg‘ulotdan oldingi yurak urishi (bpm)",
        default=0
    )
    post_heart_rate = models.PositiveSmallIntegerField(
        "Mashg‘ulotdan keyingi yurak urishi (bpm)",
        default=0
    )
    exercise_count = models.PositiveSmallIntegerField(
        "Mashqlar soni",
        default=0
    )
    duration = models.PositiveIntegerField(
        "Mashg‘ulot davomiyligi (millisekundda)",
        default=0
    )
    file = models.FileField(
        "Qo‘shimcha fayl",
        upload_to="training_files/",
        blank=True,
        null=True
    )
    created_at = models.DateTimeField("Yaratilgan sana", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan sana", auto_now=True)

    def __str__(self):
        return f"{self.athlete.fullname} - {self.sport_type.name} ({self.created_at.date()})"

    class Meta:
        verbose_name = "Mashg‘ulot"
        verbose_name_plural = "Mashg‘ulotlar"
        ordering = ["-created_at"]
