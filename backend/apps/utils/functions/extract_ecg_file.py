import io
import pandas as pd
import numpy as np
from apps.core.models import TrainingSession
from django.core.files.base import ContentFile

from .common import emt2df


def extract_ecg_file(train_session: TrainingSession) -> None:
    """
    ECG.txt ma'lumotini xotirada yaratadi va file_ECG maydoniga saqlaydi.
    Hech qanday vaqtinchalik fayl yaratmaydi.
    """
    src_emt = train_session.file_EMT.path
    a_rest = train_session.pre_heart_rate
    b_post = train_session.post_heart_rate

    # EMT faylni o‘qish
    df = emt2df(src_emt)
    N = len(df)
    if N < 2:
        raise ValueError(
            "Signal uzunligi juda kichik (kamida 2 qator bo‘lishi kerak).")

    # HR rampani yaratish (a_rest -> b_post)
    hr_float = np.linspace(a_rest, b_post, N)
    hr_int = np.rint(hr_float).astype(int)
    hr_int[0], hr_int[-1] = a_rest, b_post

    # Monotonlikni saqlash
    if a_rest <= b_post:
        for i in range(1, N):
            if hr_int[i] < hr_int[i - 1]:
                hr_int[i] = hr_int[i - 1]
    else:
        for i in range(1, N):
            if hr_int[i] > hr_int[i - 1]:
                hr_int[i] = hr_int[i - 1]
    print(hr_int)
    # Numpy natijani text formatida stringga yozish (header yo‘q)
    buffer = io.StringIO()
    np.savetxt(buffer, hr_int, fmt="%d", delimiter="\t")
    text_data = buffer.getvalue()

    # file_ECG ga yozish (ContentFile orqali)
    train_session.file_ECG.save(
        f"${train_session.athlete.fullname}_ECG_${train_session.id}.txt",
        ContentFile(text_data),
        save=True
    )

    print("✅ ECG fayl xotiradan saqlandi (diskda vaqtinchalik fayl yo‘q).")
    return train_session.file_ECG.path
