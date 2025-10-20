from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import (
    Athlete,
    SportType,
    TrainingSession,
    Exercise,
    Muscle,
    MuscleFatigue
)
from .serializers import (
    AthleteSerializer,
    SportTypeSerializer,
    TrainingSessionSerializer,
    ExerciseSerializer
)
from apps.utils.functions.extract_ecg_file import extract_ecg_file
from apps.utils.ai.calculate_fatigue import predict_fatigue


class SportTypeViewSet(viewsets.ModelViewSet):
    queryset = SportType.objects.all()
    serializer_class = SportTypeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AthleteViewSet(viewsets.ModelViewSet):
    queryset = Athlete.objects.all()
    serializer_class = AthleteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.select_related(
        "athlete", "sport_type").all()
    serializer_class = TrainingSessionSerializer
    permission_classes = [permissions.AllowAny]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """
        Custom create method:
        - JSON yoki form-data dan ma’lumot qabul qiladi
        - Fayl yuborilgan bo‘lsa, uni saqlaydi
        - Qaytgan javobni boyitadi (athlete_fullname, sport_type_name)
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance: TrainingSession = serializer.save()
        df = instance.emt_muscles_to_df()
        rows_count = df.shape[0]
        extract_ecg_file(instance)
        # 🔹 Qo‘shimcha logika(masalan, avtomatik field o‘zgartirish)
        instance.duration = rows_count or 0
        instance.save(update_fields=["duration"])

        headers = self.get_success_headers(serializer.data)
        data = TrainingSessionSerializer(instance).data

        return Response(
            {
                "message": "Mashg‘ulot muvaffaqiyatli qo‘shildi ✅",
                "training_session": data
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )


class ExercisesViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.select_related("training").all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.AllowAny]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        """
        Custom create method:
        - JSON yoki form-data dan ma’lumot qabul qiladi
        - Fayl yuborilgan bo‘lsa, uni saqlaydi
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        instance: Exercise = serializer.save()

        instance.signal_length = instance.last_count - instance.first_count + 1
        instance.hrate = instance.calculate_hrate()
        instance.save(update_fields=["signal_length", "hrate"])

        df = instance.training.emt_muscles_to_df()
        muscles = df.columns.tolist()
        print(muscles)
        for muscle in muscles:
            m = Muscle.objects.filter(shortname=muscle).first()
            if not m:
                continue
            fatigue = predict_fatigue(muscle, instance)
            MuscleFatigue.objects.create(
                fatigue=fatigue,
                muscle=Muscle.objects.get(shortname=muscle),
                exercise=instance
            )

        headers = self.get_success_headers(serializer.data)
        data = ExerciseSerializer(instance).data

        return Response(
            {
                "message": "Mashq muvaffaqiyatli qo‘shildi ✅",
                "exercise": data
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
