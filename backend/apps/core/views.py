from django.db import transaction
import numpy as np
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
    page_size = 100
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
    queryset = Athlete.objects.all().select_related("coach")
    serializer_class = AthleteSerializer
    pagination_class = CustomPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(
            self.get_queryset()
        ).filter(coach=request.user)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["get"])
    def k_load_graph(self, request, pk=None):
        """
        Sportchi uchun BARCHA ishlatilgan muskullar bo‘yicha K-Load grafigi.
        ?muscles=RF,VL  → ixtiyoriy filtr (faqat kerakli muskullar)
        Agar berilmasa → sportchida hech bo‘lmaganda bitta mashqda ishlagan BARCHA muskullar avto-oladi
        """
        athlete: Athlete = self.get_object()

        training_ids = request.query_params.get("training_ids")
        if training_ids:
            training_ids = training_ids.split(',')
        else:
            training_ids = []

        # 1. Qaysi muskullar ishlatilganligini aniqlaymiz (sportchi haqiqatan ishlaganlari!)
        used_muscle_shortnames = MuscleFatigue.objects.filter(
            exercise__training__athlete=athlete
        ).values_list("muscle__shortname", flat=True).distinct()

        # Agar query paramsda muscles berilgan bo‘lsa – faqat ulardan filtrlaymiz
        muscles_param = request.query_params.get("muscles")
        if muscles_param:
            requested = [s.strip().upper()
                         for s in muscles_param.split(",") if s.strip()]
            used_muscle_shortnames = used_muscle_shortnames.filter(
                muscle__shortname__in=requested
            )

        # Muskullar ro‘yxatini olish
        muscles = Muscle.objects.filter(
            shortname__in=used_muscle_shortnames).order_by("title")

        if not muscles.exists():
            return Response({
                "message": "Ushbu sportchi uchun hali hech qanday K-Load ma'lumoti yo'q.",
                "titles": [],
                "columns": [],
                "signals": {},
            })

        if len(training_ids) == 0:
            trainings = TrainingSession.objects.filter(
                athlete=athlete).order_by("created_at")
        else:
            trainings = TrainingSession.objects.filter(
                id__in=training_ids,
                athlete=athlete).order_by("created_at")

        # Natija konteynerlari
        titles = []       # X o‘qi: Mashg‘ulot nomlari
        signals = {}      # { "RF": [12.4, 15.6, ...], "VL": [8.1, 9.3, ...] }
        columns = []      # ["RF", "VL", "BF", ...]

        # Har bir muskul uchun bo‘sh massiv ochamiz
        for muscle in muscles:
            signals[muscle.shortname] = []
            columns.append(muscle.shortname)

        # 3. Har bir mashg‘ulot bo‘yicha barcha muskullar uchun K-load hisoblaymiz
        for training in trainings:
            titles.append(
                training.title or f"Mashg'ulot {training.created_at.strftime('%d.%m')}")

            for muscle in muscles:
                result = training.calculate_k_adapt_load(muscle.shortname)
                k_value = result.get("k_adapt_load", 0)

                # Himoya: agar dHR=0 bo‘lsa yoki boshqa xatolik → 0
                try:
                    k_value = float(k_value)
                    if np.isnan(k_value) or np.isinf(k_value):
                        k_value = 0
                except (TypeError, ValueError):
                    k_value = 0

                signals[muscle.shortname].append(round(k_value, 3))

        return Response({
            "message": "K-Load ma'lumotlari muvaffaqiyatli yuklandi ✅",
            "rows_count": len(trainings),
            "columns": columns,                    # ["RF", "VL", "BF", ...]
            "signals": {
                "titles": titles,                  # X o‘qi
                **signals                          # Har bir muskulning qiymatlari
            }
        })

    @action(detail=True, methods=["get"])
    def fatigue_by_training_graph(self, request, pk=None):
        """
        Sportchi uchun BARCHA ishlatilgan muskullar bo‘yicha o‘rtacha charchoq (fatigue_avg) grafigi.
        ?muscles=RF,VL,BF → ixtiyoriy filtr (faqat kerakli muskullar)
        Agar berilmasa → sportchida hech bo‘lmaganda bitta mashqda ishlagan BARCHA muskullar avtomatik olinadi
        """
        athlete: Athlete = self.get_object()
        training_ids = request.query_params.get("training_ids")
        if training_ids:
            training_ids = training_ids.split(',')
        else:
            training_ids = []
        # 1. Sportchida ishlatilgan barcha muskullarni aniqlaymiz
        used_muscle_shortnames = MuscleFatigue.objects.filter(
            exercise__training__athlete=athlete
        ).values_list("muscle__shortname", flat=True).distinct()

        # Agar query paramsda muscles berilgan bo‘lsa – filtrlaymiz
        muscles_param = request.query_params.get("muscles")
        if muscles_param:
            requested = [s.strip().upper()
                         for s in muscles_param.split(",") if s.strip()]
            used_muscle_shortnames = used_muscle_shortnames.filter(
                muscle__shortname__in=requested
            )

        muscles = Muscle.objects.filter(
            shortname__in=used_muscle_shortnames).order_by("title")

        if not muscles.exists():
            return Response({
                "message": "Ushbu sportchi uchun hali charchoq ma'lumotlari yo‘q.",
                "titles": [],
                "columns": [],
                "signals": {},
            })

        # 2. Mashg‘ulotlarni tartib bilan olamiz
        if len(training_ids) == 0:
            trainings = TrainingSession.objects.filter(
                athlete=athlete).order_by("created_at")
        else:
            trainings = TrainingSession.objects.filter(
                id__in=training_ids,
                athlete=athlete).order_by("created_at")

        # Natija konteynerlari
        titles = []                    # X o‘qi: Mashg‘ulot nomlari
        # { "RF": [45.2, 58.1, ...], "VL": [32.4, 41.0, ...] }
        signals = {}
        columns = []                   # ["RF", "VL", "BF", ...]

        # Har bir muskul uchun bo‘sh massiv
        for muscle in muscles:
            signals[muscle.shortname] = []
            columns.append(muscle.shortname)

        # 3. Har bir mashg‘ulot bo‘yicha barcha muskullar uchun o‘rtacha charchoqni hisoblaymiz
        for training in trainings:
            titles.append(
                training.title or f"Mashg‘ulot {training.created_at.strftime('%d.%m.%Y')}")

            for muscle in muscles:
                result = training.calculate_avg_fatigue(muscle.shortname)
                fatigue_val = result.get("fatigue_avg", 0)

                # Himoya: agar None, NaN yoki xatolik bo‘lsa → 0
                try:
                    fatigue_val = float(fatigue_val)
                    if np.isnan(fatigue_val) or np.isinf(fatigue_val):
                        fatigue_val = 0
                except (TypeError, ValueError):
                    fatigue_val = 0

                signals[muscle.shortname].append(round(fatigue_val, 2))

        return Response({
            "message": "O‘rtacha charchoq ma'lumotlari muvaffaqiyatli yuklandi ✅",
            "rows_count": len(trainings),
            # ["RF", "VL", "BF", ...]
            "columns": columns,
            "signals": {
                "titles": titles,                            # X o‘qi
                **signals                                    # Har bir muskulning qiymatlari
            }
        })

    @action(detail=True, methods=["get"], url_path="compare-trainings-by-muscle")
    def compare_trainings_by_muscle(self, request, pk=None):
        athlete = self.get_object()

        ids_param = request.query_params.get("ids")
        if not ids_param:
            return Response({"error": "ids parametri majburiy"}, status=400)

        try:
            training_ids = [int(x) for x in ids_param.split(
                ",") if x.strip().isdigit()]
        except ValueError:
            return Response({"error": "ids noto‘g‘ri formatda"}, status=400)

        if not training_ids:
            return Response({"error": "Hech qanday trening tanlanmagan"}, status=400)

        # Faqat ushbu sportchiga tegishli treninglarni olamiz
        trainings = TrainingSession.objects.filter(
            id__in=training_ids,
            athlete=athlete
        ).select_related("sport_type").order_by("created_at")

        if not trainings.exists():
            return Response({
                "rows_count": 0,
                "columns": [],
                "signals": {},
                "training_info": [],
                "compared_count": 0
            })

        # Har bir treningdagi maksimal mashq sonini topamiz (X o‘qi uzunligi)
        max_exercises = 0
        exercise_counts = {}
        for training in trainings:
            count = Exercise.objects.filter(training=training).count()
            exercise_counts[training.id] = count
            max_exercises = max(max_exercises, count)

        if max_exercises == 0:
            return Response({
                "rows_count": 0,
                "columns": [],
                "signals": {},
                "training_info": [...],
            })

        # Ishlatilgan muskullarni aniqlash
        used_muscles = MuscleFatigue.objects.filter(
            exercise__training__in=trainings
        ).values_list("muscle__shortname", flat=True).distinct()

        muscles_filter = request.query_params.get("muscles")
        if muscles_filter:
            requested = [m.strip().upper()
                         for m in muscles_filter.split(",") if m.strip()]
            used_muscles = [m for m in used_muscles if m in requested]

        if not used_muscles:
            return Response({
                "rows_count": max_exercises,
                "columns": [],
                "signals": {},
                "training_info": [...],
            })

        muscles = Muscle.objects.filter(
            shortname__in=used_muscles).order_by("title")

        # Training info (legend uchun)
        training_info = []
        training_names = {}
        for t in trainings:
            date_str = t.created_at.strftime("%d.%m.%Y")
            name = t.title + " (" + date_str + ")" if t.title else date_str
            training_names[t.id] = name
            training_info.append({
                "id": t.id,
                "name": name,
                "date": t.created_at.strftime("%Y-%m-%d"),
            })

        # signals: { muscle_shortname: { training_name: [fatigue_values...] } }
        signals = {}

        for muscle in muscles:
            shortname = muscle.shortname
            signals[shortname] = {}

            for training in trainings:
                exercises = Exercise.objects.filter(
                    training=training).order_by("first_count")
                fatigues = MuscleFatigue.objects.filter(
                    exercise__in=exercises,
                    muscle=muscle
                ).order_by("exercise__first_count").values_list("fatigue", flat=True)

                values = []
                for f in fatigues:
                    values.append(round(float(f), 3) if f is not None else 0.0)

                # Agar mashqlar soni kam bo‘lsa — 0 bilan to‘ldiramiz
                if len(values) < max_exercises:
                    values.extend([0.0] * (max_exercises - len(values)))
                values = values[:max_exercises]  # kesib tashlash

                signals[shortname][training_names[training.id]] = values

        return Response({
            "compared_count": len(trainings),
            "rows_count": max_exercises,
            "columns": [m.shortname for m in muscles],
            "signals": signals,
            "training_info": training_info,
        })


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
            ids = self.request.query_params.get("ids")
            if athlete_id:
                queryset = queryset.filter(athlete_id=athlete_id)
            if ids:
                ids_list = ids.split(',')
                if len(ids_list) > 0:
                    queryset = queryset.filter(id__in=ids_list)
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
        Bitta mashg‘ulot ichidagi BARCHA muskullar bo‘yicha charchoq dinamikasi.
        ?muscles=RF,VL,BF → ixtiyoriy filtr (faqat kerakli muskullar)
        Agar berilmasa → mashg‘ulotda ishlatilgan barcha muskullar avtomatik olinadi
        """
        instance = self.get_object()  # TrainingSession

        # 1. Mashg‘ulotdagi barcha mashqlarni tartib bilan olamiz
        exercises = Exercise.objects.filter(
            training=instance).order_by("first_count")

        if not exercises.exists():
            return Response({
                "message": "Ushbu mashg‘ulotda hech qanday mashq yo‘q.",
                "rows_count": 0,
                "columns": [],
                "signals": {},
            })

        # 2. Ushbu mashg‘ulotda qaysi muskullar ishlatilgan?
        used_muscle_shortnames = MuscleFatigue.objects.filter(
            exercise__training=instance
        ).values_list("muscle__shortname", flat=True).distinct()

        # Agar query paramsda muscles berilgan bo‘lsa – filtrlaymiz
        muscles_param = request.query_params.get("muscles")
        if muscles_param:
            requested = [s.strip().upper()
                         for s in muscles_param.split(",") if s.strip()]
            used_muscle_shortnames = used_muscle_shortnames.filter(
                muscle__shortname__in=requested
            )

        muscles = Muscle.objects.filter(
            shortname__in=used_muscle_shortnames).order_by("title")

        if not muscles.exists():
            return Response({
                "message": "Ushbu mashg‘ulotda hali charchoq ma'lumotlari yo‘q.",
                "rows_count": 0,
                "columns": [],
                "signals": {},
            })

        # 3. Har bir muskul uchun charchoq qiymatlarini yig‘amiz
        signals = {}      # { "RF": [0.12, 0.45, 0.78, ...], "VL": [...] }
        columns = []      # ["RF", "VL", ...]

        for muscle in muscles:
            shortname = muscle.shortname
            columns.append(shortname)
            signals[shortname] = []

            fatigues = MuscleFatigue.objects.filter(
                exercise__in=exercises,
                muscle__shortname=shortname
            ).order_by("exercise__first_count").values_list("fatigue", flat=True)

            # Agar biror mashqda bu muskul ishlamagan bo‘lsa → 0 qo‘yamiz (bo‘sh joylar bo‘lmasligi uchun)
            fatigue_list = list(fatigues)
            if len(fatigue_list) < exercises.count():
                # To‘ldirish: agar ma'lumot kam bo‘lsa, oxirigacha 0 qo‘shiladi
                fatigue_list.extend(
                    [0] * (exercises.count() - len(fatigue_list)))
            elif len(fatigue_list) > exercises.count():
                # Xavfsizlik uchun kesamiz
                fatigue_list = fatigue_list[:exercises.count()]

            # Qiymatlarni 2 kasrga yaxlitlaymiz
            signals[shortname] = [round(float(f), 3) for f in fatigue_list]

        return Response({
            "message": "Muskullar bo‘yicha charchoq dinamikasi muvaffaqiyatli yuklandi ✅",
            "rows_count": exercises.count(),          # Mashqlar soni (X o‘qi uzunligi)
            # ["RF", "VL", "BF", ...]
            "columns": columns,
            "signals": signals,                        # Har bir muskulning massivi
        })


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
