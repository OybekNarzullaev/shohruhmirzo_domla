from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from apps.core.models import TrainingSession, Athlete


class AdatationLoadStatsAPI(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        athlete_id = request.data.get('athlete_id')
        muscle_shortname = request.data.get('muscle_shortname')
        athlete = Athlete.objects.get(id=athlete_id)

        trs = TrainingSession.objects.filter(athlete=athlete)
        stats = []
        for tr in trs:
            stat = tr.calculate_k_adapt_load(muscle_shortname)
            stats.append({
                'id': tr.id,
                'title': tr.title,
                'athlete': tr.athlete.id,
                'stat': stat
            })
        return Response(data=stats)
