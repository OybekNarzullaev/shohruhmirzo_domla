import numpy as np


def k_adapt_load(v_time, v_fatigue):
    """
    Yuklamaga moslashish koeffitsiyentini (k) hisoblaydi.

    Parametrlar:
    ------------
    v_time : list yoki numpy.ndarray
        Mashq vaqt qiymatlari (ms da)
    v_fatigue : list yoki numpy.ndarray
        Mos ravishda mushak charchoq qiymatlari

    Qaytaradi:
    ----------
    k_values : numpy.ndarray
        Har bir nuqta uchun yuklamaga moslashish koeffitsiyenti
    """
    # massivlarni numpy ko‘rinishiga o‘tkazamiz
    v_time = np.array(v_time, dtype=float)
    v_fatigue = np.array(v_fatigue, dtype=float)

    # o‘rtacha qiymatlar
    t_mean = np.mean(v_time)
    f_mean = np.mean(v_fatigue)

    # T va F hisoblash
    T = v_time / t_mean
    F = v_fatigue / f_mean

    # K ni hisoblash
    k = np.sqrt(np.abs(T * (1 - F)))

    return k
