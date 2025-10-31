from django.db import models
from django.db.models.functions import Lower
import pandas as pd
import numpy as np


class Athlete(models.Model):
    firstname = models.CharField("Ism", max_length=50)
    lastname = models.CharField("Familiya", max_length=50)
    level = models.ForeignKey(
        "AthleteLevel", on_delete=models.CASCADE, related_name='athlete'
    )
    patronymic = models.CharField("Otasining ismi", max_length=50, blank=True)
    birth_year = models.PositiveSmallIntegerField("Tug‘ilgan yil")
    picture = models.ImageField(
        "Rasm", upload_to='athlete_pictures/', blank=True, null=True
    )
    # sport_type = models.ForeignKey(
    #     'SportType', on_delete=models.CASCADE, related_name='athletes'
    # )0123

    created_at = models.DateTimeField("Yaratilgan sana", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan sana", auto_now=True)

    @property
    def name(self) -> str:
        """Foydalanuvchining to‘liq ismi (Familiya Ism Otasining ismi)."""
        if self.patronymic:
            return f"{self.lastname} {self.firstname} {self.patronymic}"
        return f"{self.lastname} {self.firstname}"

    def __str__(self):
        return f"{self.name} {self.lastname}"

    class Meta:
        verbose_name = "Sportchi"
        verbose_name_plural = "Sportchilar"
        ordering = ["lastname", "firstname"]


class AthleteLevel(models.Model):
    name = models.CharField("Sportchi darajasi nomi",
                            max_length=100, unique=True)
    number = models.PositiveSmallIntegerField("Daraja raqami")
    description = models.TextField("Izoh", blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Sportchi darajasi"
        verbose_name_plural = "Sportchi darajalari"
        ordering = ["name"]


class AthleteParams(models.Model):
    athlete = models.ForeignKey(
        "Athlete", on_delete=models.CASCADE, related_name='params'
    )

    bmi = models.FloatField(default=0)
    weight = models.PositiveSmallIntegerField("Vazn (kg)")
    height = models.PositiveSmallIntegerField("Bo‘y (sm)")
    created_at = models.DateTimeField("Yaratilgan sana", auto_now_add=True)
    description = models.TextField("Izoh", blank=True, null=True)

    class Meta:
        verbose_name = "Sportchi parametrlari"
        verbose_name_plural = "Sportchilar parametrlari"

    def __str__(self):
        return f"{self.athlete.name}"


class SportType(models.Model):

    name = models.CharField("Sport turi nomi", max_length=100, unique=True)
    number = models.PositiveSmallIntegerField(
        "Daraja raqami", blank=True, null=True
    )
    description = models.TextField("Izoh", blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Sport turi"
        verbose_name_plural = "Sport turlari"
        ordering = ["name"]


class Muscle(models.Model):
    name = models.CharField('Lotincha nomi', max_length=50)
    title = models.CharField("O'zbekcha nomi", max_length=50)
    shortname = models.CharField("Qisqa nomi", max_length=16)
    model_url = models.TextField("AI Model manzili")
    description = models.TextField("Izoh", blank=True, null=True)

    def __str__(self):
        return f"{self.shortname} | {self.name} | {self.title}"

    class Meta:
        verbose_name = "Muskul"
        verbose_name_plural = "Muskullar"


class TrainingSession(models.Model):
    title = models.CharField("Mashg'ulot nomi", max_length=50)
    athlete = models.ForeignKey(
        "Athlete",
        on_delete=models.CASCADE,
        related_name="training_sessions",
        verbose_name="Sportchi"
    )
    sport_type = models.ForeignKey(
        "SportType",
        on_delete=models.PROTECT,
        related_name="training_sessions",
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
        "Mashqlar soni", default=0)
    duration = models.PositiveIntegerField(
        "Mashg‘ulot davomiyligi (millisekundda)", default=0)
    file_EMT = models.FileField(
        "EMT fayl", upload_to="training_files/", blank=True, null=True)
    file_ECG = models.FileField(
        "ECG fayl", upload_to="training_files/", blank=True, null=True)
    description = models.TextField("Izoh", blank=True, null=True)

    created_at = models.DateTimeField("Yaratilgan sana", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan sana", auto_now=True)

    def emt_muscles_to_df(self) -> pd.DataFrame:
        """
        EMT fayldan faqat mushak (EMG) ustunlarini o‘qiydi.
        'Frame' yoki 'Time' kabi texnik ustunlarni tashlab ketadi.
        """
        # path o'qish va data_start_idx ni topish qismi o'zgarishsiz qoladi
        path = self.file_EMT.path
        rows = []
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            lines: list[str] = f.readlines()

        for line in lines[10:]:
            rows.append([item.strip()
                        for item in line.replace('\n', '').split('\t')])

        cols = rows[0]
        data = rows[1:]
        columns_to_drop = ['Frame', 'Time']

        df = pd.DataFrame(data=data, columns=cols)
        df = df.drop(columns=columns_to_drop, axis=1)
        cols = df.columns.tolist()
        col_ids = Muscle.objects.annotate(name_lower=Lower('name')).filter(
            name_lower__in=[c.lower() for c in cols]
        ).values_list('shortname', flat=True)

        len(cols)
        len(col_ids)
        columns = dict(
            zip(cols, col_ids)
        )
        return df.rename(columns=columns)

    def ecg_to_dataframe(self):
        path = self.file_ECG.path
        rows = []
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            lines: list[str] = f.readlines()

        for line in lines:
            rows.append(
                [
                    item.strip()
                    for item in line.replace('\n', '').split('\t')
                ]
            )

        columns_to_drop = ['Data']

        return pd.DataFrame(data=rows, columns=columns_to_drop)

    def calculate_k_adapt_load(self, muscle_shortname, time_from=None, time_to=None):

        muscle_fatigues = MuscleFatigue.objects.filter(
            muscle__shortname=muscle_shortname,
            exercise__training=self
        ).order_by('exercise__training__id')

        if muscle_fatigues.count() == 0:
            return {
                'k_adapt_load': 0,
                'name': self.title,
                'created_at': self.created_at
            }
        times = muscle_fatigues.values_list(
            'exercise__signal_length', flat=True
        )

        fatigues = muscle_fatigues.values_list('fatigue', flat=True)
        # o‘rtacha qiymatlar
        v_time = np.array(times, dtype=int)
        v_fatigue = np.array(fatigues, dtype=float)
        print(v_time, times)
        t_max = np.max(v_time)
        t_norm = v_time / t_max

        # 3. Umumiy yuklama
        L_total = np.sum(v_fatigue * t_norm)
        dHR = self.post_heart_rate - self.pre_heart_rate

        # 5. S koeffitsienti
        K = L_total / dHR

        return {
            'k_adapt_load': K.tolist(),
            'name': self.title,
            'created_at': self.created_at
        }

    def calculate_avg_fatigue(self, muscle_shortname, time_from=None, time_to=None):

        fatigue_avg = MuscleFatigue.objects.filter(
            muscle__shortname=muscle_shortname,
            exercise__training=self
        ).aggregate(models.Avg('fatigue'))['fatigue__avg']

        return {
            'fatigue_avg': fatigue_avg,
            'name': self.title,
            'created_at': self.created_at
        }

    def __str__(self):
        return f"{self.athlete.name} - {self.sport_type.name} ({self.created_at.date()})"

    class Meta:
        verbose_name = "Mashg‘ulot"
        verbose_name_plural = "Mashg‘ulotlar"
        ordering = ["-created_at"]


class Exercise(models.Model):
    first_count = models.PositiveSmallIntegerField(
        "Boshlang'ich vaqt", default=0
    )
    last_count = models.PositiveSmallIntegerField(
        "Yakuniy vaqt", default=0
    )

    training = models.ForeignKey(
        'TrainingSession',
        on_delete=models.CASCADE,
        related_name='execise'
    )
    signal_length = models.PositiveBigIntegerField(
        "Mashq davomiyligi (millisekund)",
        default=0
    )

    hrate = models.PositiveSmallIntegerField("Yurak urishi", default=0)

    description = models.TextField("Izoh", blank=True, null=True)

    created_at = models.DateTimeField("Yaratilgan sana", auto_now_add=True)
    updated_at = models.DateTimeField("Yangilangan sana", auto_now=True)

    def calculate_hrate(self):
        df = self.training.ecg_to_dataframe()
        subset = df.iloc[self.first_count:self.last_count + 1]

        if subset.empty:
            return None

        mean_val = subset.astype("Int64").mean(skipna=True)
        return float(round(mean_val['Data']))

    def calculate_emg_features(self, muscle_shortname,  fs=1000):
        """
        signal: numpy array yoki list (EMG signal)
        fs: int (sampling frequency, default = 1000 Hz)
        """
        # signalni numpy array shakliga keltiramiz
        df: pd.DataFrame = self.training.emt_muscles_to_df()
        df = df.iloc[self.first_count:self.last_count+1]
        signal = df[muscle_shortname].astype(float).to_numpy()

        # Agar NaN qiymatlar bo‘lsa, ularni 0 bilan almashtiramiz
        if np.any(np.isnan(signal)):
            signal = np.nan_to_num(signal, nan=0.0)

        # ======= FREQUENCY FEATURES =======
        N = len(signal)
        X = np.fft.rfft(signal)
        freqs = np.fft.rfftfreq(N, d=1.0/fs)
        PSD_fft = np.abs(X)**2 / N

        m0 = np.sum(PSD_fft)
        MNF = np.sum(freqs * PSD_fft) / m0 if m0 != 0 else 0
        amplitude = np.abs(X)
        spectral_centroid = np.sum(
            freqs * amplitude) / np.sum(amplitude) if np.sum(amplitude) != 0 else 0

        cumulative_power = np.cumsum(PSD_fft)
        MDF_idx = np.where(cumulative_power >= m0 / 2.0)[0][0]
        MDF = freqs[MDF_idx]

        spectral_variance = np.sum(
            ((freqs - MNF)**2) * PSD_fft) / m0 if m0 != 0 else 0
        spectral_variance = spectral_variance / (len(signal) - 1)
        bandwidth = np.sqrt(spectral_variance)

        eps = 1e-8
        valid = freqs > 0
        slope, _ = np.polyfit(freqs[valid], np.log10(
            amplitude[valid] + eps), 1) if np.sum(valid) > 0 else (0, 0)

        low_band = (freqs >= 20) & (freqs < 60)
        high_band = (freqs >= 60) & (freqs <= 500)
        low_power = np.sum(PSD_fft[low_band])
        high_power = np.sum(PSD_fft[high_band])
        band_power_ratio = low_power / high_power if high_power != 0 else np.nan

        # ======= AMPLITUDE FEATURES =======
        RMS = np.sqrt(np.mean(signal**2))
        MAV = np.mean(np.abs(signal))
        var_val = np.var(signal)
        WL = np.sum(np.abs(np.diff(signal)))

        # Dinamik threshold
        signal_range = np.ptp(signal)
        threshold_ssc = 0.01 * signal_range if signal_range > 0 else 0.01

        ssc = 0
        for i in range(1, len(signal) - 1):
            diff1 = signal[i] - signal[i - 1]
            diff2 = signal[i + 1] - signal[i]
            if diff1 * diff2 < 0 and (abs(diff1) > threshold_ssc or abs(diff2) > threshold_ssc):
                ssc += 1
        ssc = ssc / (len(signal) - 1)

        zc = np.where(np.diff(np.sign(signal)))[0]
        ZCR = len(zc)

        MAD = np.median(np.abs(signal - np.median(signal)))
        wamp = np.sum(np.abs(np.diff(signal)) > threshold_ssc)

        # Natija sifatida barcha xususiyatlarni ro‘yxatda qaytaramiz
        return [
            MDF, MNF, spectral_centroid, spectral_variance, bandwidth, slope,
            band_power_ratio, RMS, MAV, var_val, WL, ssc, ZCR, MAD, wamp,
            self.training.athlete.params.last().bmi, self.signal_length, self.hrate
        ]

    def __str__(self):
        return f"{self.training.title} - {self.first_count} - {self.last_count}"

    class Meta:
        verbose_name = "Mashq"
        verbose_name_plural = "Mashqlar"


class MuscleFatigue(models.Model):
    exercise = models.ForeignKey(
        'Exercise',
        on_delete=models.CASCADE,
        related_name='muscle_fatigue'
    )
    muscle = models.ForeignKey(
        'Muscle',
        on_delete=models.CASCADE,
        related_name='fatigues'
    )
    fatigue = models.FloatField("Charchoq qiymati", default=0)

    def __str__(self):
        return f"{self.fatigue} - {self.muscle} - {self.exercise}"

    class Meta:
        verbose_name = "Muskul charchog'i"
        verbose_name_plural = "Muskul charchoqlari"
