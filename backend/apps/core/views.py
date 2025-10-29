from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import (
    Athlete,
    SportType,
    TrainingSession,
    Exercise,
    Muscle,
    AthleteLevel,
    AthleteParams,
    MuscleFatigue
)
from .serializers import (
    AthleteSerializer,
    AthleteLevelSerializer,
    SportTypeSerializer,
    TrainingSessionSerializer,
    AthleteParamsSerializer,
    ExerciseSerializer,
    MuscleFatigueSerializer,
    MuscleSerializer
)
from apps.utils.functions.extract_ecg_file import extract_ecg_file
from apps.utils.ai.calculate_fatigue import predict_fatigue


class CustomPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    page_query_param = 'page'
    max_page_size = 100

    def get_paginated_response(self, data):
        current_page = self.page.number
        next_page = current_page + 1 if self.page.has_next() else None
        prev_page = current_page - 1 if self.page.has_previous() else None

        return Response({
            "count": self.page.paginator.count,
            "current_page": current_page,
            "page_size": self.page.paginator.per_page,
            "total_pages": self.page.paginator.num_pages,
            "next_page": next_page,
            "prev_page": prev_page,
            "results": data,
        })


class SportTypeViewSet(viewsets.ModelViewSet):
    queryset = SportType.objects.all()
    serializer_class = SportTypeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class AthleteViewSet(viewsets.ModelViewSet):
    queryset = Athlete.objects.all().select_related("level")
    serializer_class = AthleteSerializer
    pagination_class = CustomPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def k_load_graph(self, request, pk=None):
        instance: Athlete = self.get_object()
        muscle_shortname = request.query_params.get('muscle')
        trainings = TrainingSession.objects.filter(athlete=instance)
        data = {
            'k_adapt_load': [],
            'datetimes': [],
            'titles': [],
        }
        for t in trainings:
            d = t.calculate_k_adapt_load(muscle_shortname)
            data['k_adapt_load'].append(d['k_adapt_load'])
            data['datetimes'].append(d['created_at'])
            data['titles'].append(d['name'])

        return Response(
            {
                "message": "Signal ma’lumotlari muvaffaqiyatli olindi ✅",
                "rows_count": trainings.count(),
                "columns": ['k_adapt_load'],
                "signals": data,  # har bir kanal uchun massiv
            },
            status=status.HTTP_200_OK,
        )


class AthleteLevelViewSet(viewsets.ModelViewSet):
    queryset = AthleteLevel.objects.all()
    serializer_class = AthleteLevelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class MuscleViewSet(viewsets.ModelViewSet):
    queryset = Muscle.objects.all()
    serializer_class = MuscleSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = self.queryset
        if self.action == "list":  # faqat GET list uchun filterlash
            training_id = self.request.query_params.get("training_id")
            athlete_id = self.request.query_params.get("athlete_id")
            if training_id:
                muscle_ids = MuscleFatigue.objects.filter(exercise__training__id=training_id).values_list(
                    'muscle_id', flat=True
                )
                queryset = queryset.filter(id__in=muscle_ids)
            if athlete_id:
                muscle_ids = MuscleFatigue.objects.filter(exercise__training__athlete__id=athlete_id).values_list(
                    'muscle_id', flat=True
                )
                queryset = queryset.filter(id__in=muscle_ids)
        return queryset


class AthleteParamsViewSet(viewsets.ModelViewSet):
    queryset = AthleteParams.objects.all()
    serializer_class = AthleteParamsSerializer
    pagination_class = CustomPagination
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = self.queryset
        if self.action == "list":  # faqat GET list uchun filterlash
            athlete_id = self.request.query_params.get("athlete_id")
            if athlete_id:
                queryset = queryset.filter(athlete_id=athlete_id)
        return queryset


class TrainingSessionViewSet(viewsets.ModelViewSet):
    queryset = TrainingSession.objects.select_related(
        "athlete", "sport_type").all()
    serializer_class = TrainingSessionSerializer
    pagination_class = CustomPagination
    permission_classes = [permissions.AllowAny]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = self.queryset
        if self.action == "list":  # faqat GET list uchun filterlash
            athlete_id = self.request.query_params.get("athlete_id")
            if athlete_id:
                queryset = queryset.filter(athlete_id=athlete_id)
        return queryset

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
    # 🔹 Qo‘shimcha metod: GET /api/training-sessions/<id>/emt-data/

    @action(detail=True, methods=["get"])
    def emtData(self, request, pk=None):
        """
        Har bir ustunni (signal kanalini) alohida massiv sifatida yuboradi.
        Plotly uchun qulay format.
        """
        instance = self.get_object()
        df = instance.emt_muscles_to_df().dropna(how="all")
        # 🔹 Bo‘sh nomli ustunlarni olib tashlash
        if "" in df.columns:
            df = df.drop(columns=[""])
        # None/NaN yo‘qotish
        df = df.fillna(0)

        # Har bir ustunni alohida massivga ajratamiz
        data = {col: df[col].tolist() for col in df.columns}

        return Response(
            {
                "message": "Signal ma’lumotlari muvaffaqiyatli olindi ✅",
                "rows_count": len(df),
                "columns": list(df.columns),
                "signals": data,  # har bir kanal uchun massiv
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"])
    def muscleFatigueGraph(self, request, pk=None):
        """
        Har bir ustunni (signal kanalini) alohida massiv sifatida yuboradi.
        Plotly uchun qulay format.
        """
        muscle = request.query_params.get('muscle')
        instance = self.get_object()
        exercises = Exercise.objects.filter(
            training=instance).order_by('first_count')

        fatigues = MuscleFatigue.objects.filter(
            exercise__id__in=[ex.id for ex in exercises],
            muscle__shortname=muscle
        ).order_by('exercise__first_count').values_list('fatigue', flat=True)

        return Response(
            {
                "message": "Signal ma’lumotlari muvaffaqiyatli olindi ✅",
                "rows_count": len(fatigues),
                "columns": ['fatigues'],
                "signals": fatigues,  # har bir kanal uchun massiv
            },
            status=status.HTTP_200_OK,
        )


class ExercisesViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.select_related("training").all()
    serializer_class = ExerciseSerializer
    pagination_class = CustomPagination
    permission_classes = [permissions.AllowAny]

    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = self.queryset
        if self.action == "list":  # faqat GET list uchun filterlash
            training_id = self.request.query_params.get("training_id")
            if training_id:
                queryset = queryset.filter(training_id=training_id)
        return queryset

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
