import os
from django.conf import settings
from functools import lru_cache
from typing import Optional
import numpy as np
import joblib
from tensorflow import keras
import tensorflow as tf
from keras.saving import register_keras_serializable
from apps.core.models import Muscle, Exercise
import os

current_dir = os.path.join(settings.BASE_DIR, 'apps', 'utils', 'ai')

# Custom sigmoid funksiyalar


def flat_sigmoid_k(x, k=0.6):
    return 1 / (1 + tf.exp(-k * x))


@register_keras_serializable()
def flat_sigmoid_k60(x): return flat_sigmoid_k(x, 0.60)


def predict_fatigue(
    muscle_shortname: str,
    exercise: Exercise,
    fs: int = 1000,
    scaler_path: str = os.path.join(
        current_dir, "scaler_2025_10_04.pkl"
    ),
    expect_timeseries: bool = True
) -> Optional[float]:
    """
    Har bir mushak ID uchun mos modelni yuklab, fatigue ni bashorat qiladi.
    - Features: calculate_emg_features(signal, bmi, uzun, hrate, fs)
    - Scaler: diskdan yuklanadi va faqat transform qilinadi (fit EMAS!)
    - Input shape: agar model vaqt qatorini kutsa, (batch, 1, n_features) reshaped qilinadi.

    Qaytadi: float fatigue yoki None (noma'lum muscle_id bo‘lsa)
    """
    mid = muscle_shortname.strip().upper()
    muscle = Muscle.objects.get(shortname=mid)

    if mid not in Muscle.objects.values_list('shortname', flat=True):
        return None

    bmi = exercise.training.athlete.params.last().bmi
    uzun, hrate = exercise.signal_length, exercise.hrate

    # 1) Xususiyatlar
    feats = exercise.calculate_emg_features(muscle_shortname=mid, fs=fs)
    feats = _as_2d(np.asarray(feats))  # (n_samples, n_features)

    # 2) Scaler (faqat transform!)
    scaler = load_scaler_cached(scaler_path)
    X = scaler.transform(feats)

    # 3) Model yuklash
    model_path = os.path.join(os.path.join(current_dir, muscle.model_url))

    try:
        model = load_model_cached(model_path)
        # 4) Shape moslash (agar model timeseries kutsa)
        if expect_timeseries:
            # (batch, timesteps=1, n_features)
            X_in = X.reshape((X.shape[0], 1, X.shape[1]))
        else:
            # (batch, n_features)
            X_in = X

        # 5) Bashorat
        y = model.predict(X_in, verbose=0)
        y = np.asarray(y).ravel()
        if y.size == 0:
            # Model chiqishi bo‘sh bo‘lsa, fallback
            return _fallback_formula(mid, bmi, uzun, hrate)
        return float(y[0])

    except Exception as e:
        # Model topilmasa yoki xato bo‘lsa: zaxira formulaga o‘tamiz
        # xohlasangiz log qiling
        raise Exception(f"[WARN] {mid} modeli bilan muammo: {e}")
        return _fallback_formula(mid, bmi, uzun, hrate)


@lru_cache(maxsize=1)
def load_scaler_cached(scaler_path: str):
    """Fitted scaler’ni diskdan o‘qib, cache’laydi."""
    if not os.path.exists(scaler_path):
        raise FileNotFoundError(f"Scaler topilmadi: {scaler_path}")
    return joblib.load(scaler_path)


@lru_cache(maxsize=128)
def load_model_cached(model_path: str):
    """Keras modelni cache bilan yuklaydi."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model topilmadi: {model_path}")
    return keras.models.load_model(model_path)


def _as_2d(X: np.ndarray) -> np.ndarray:
    """X ni (n_samples, n_features) ko‘rinishiga keltiradi."""
    X = np.asarray(X)
    if X.ndim == 1:
        X = X.reshape(1, -1)
    return X


def _fallback_formula(muscle_id: str, bmi: float, uzun: float, hrate: float) -> float:
    """
    Agar model topilmasa yoki xato bo‘lsa, zaxira tarzida oddiy fatigue formulasi.
    Xohlasangiz, bu qismini olib tashlashingiz yoki o‘zingizniki bilan alishtirishingiz mumkin.
    """
    # Har xil mushak uchun kichik farqlar:
    hash_shift = (abs(hash(muscle_id)) % 10) / 1000.0  # 0..0.009
    a = 0.12 + hash_shift
    b = 0.08 + (hash_shift / 2)
    c = 0.01 + (hash_shift / 3)
    d = 0.8 + (hash_shift * 10)
    return float(a * bmi + b * hrate - c * uzun + d)
