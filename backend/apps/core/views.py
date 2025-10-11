from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Athlete, SportType, TrainingSession
from .serializers import (
    AthleteSerializer,
    SportTypeSerializer,
    TrainingSessionSerializer,
)
from ..utils.gui_functions import process_emt_pipeline_auto
from ..utils.segment_functions import save_emg_slice_with_stats

MUSCLES = [
    "Right Biceps brachii caput longus",
    "Left Biceps brachii caput longus",
    "Right Pectoralis Major",
    "Left Pectoralis Major",
]


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

    def create(self, request, *args, **kwargs):
        """
        Custom create method:
        - JSON yoki form-data dan ma’lumot qabul qiladi
        - Fayl yuborilgan bo‘lsa, uni saqlaydi
        - Qaytgan javobni boyitadi (athlete_fullname, sport_type_name)
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        # 🔹 Qo‘shimcha logika(masalan, avtomatik field o‘zgartirish)
        instance.duration = instance.duration or 0
        instance.save(update_fields=["duration"])
        user_file = request.FILES.get('file')
        print(instance.file.path)

        dict = process_emt_pipeline_auto(
            src_emt=instance.file.path,
            base_output_dir='output',
            muscle_names=MUSCLES,
            a_rest=int(request.data.get('pre_heart_rate')),
            b_post=int(request.data.get('post_heart_rate')),
        )
        save_emg_slice_with_stats
        print(dict)
        return Response('ok')
        # instance = serializer.save()

        # 🔹 Qo‘shimcha logika (masalan, avtomatik field o‘zgartirish)
        # instance.duration = instance.duration or 0
        # instance.save(update_fields=["duration"])

        headers = self.get_success_headers(serializer.data)
        # refresh with readonly fields
        data = TrainingSessionSerializer(instance).data

        return Response(
            {
                "message": "Mashg‘ulot muvaffaqiyatli qo‘shildi ✅",
                "training_session": data
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )
