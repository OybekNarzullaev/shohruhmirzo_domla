import os
import pandas as pd

def find_time_col(df):
    """Time ustunini nomi bo'yicha topish (case-insensitive, variantlarga chidamli)."""
    for cand in ["Time", "time", "Timestamp", "timestamp", "T", "t"]:
        if cand in df.columns:
            return cand
    for c in df.columns:
        if "time" in str(c).lower():
            return c
    raise KeyError("Time ustuni topilmadi.")

def save_emg_slice_with_stats(
    emg_path: str,
    ecg_path: str,
    emg_col: str,
    m_ms: int,
    n_ms: int,
    mass_kg: float,
    height_cm: float,
    out_path: str | None = None,
) -> tuple[str, dict]:
    """
    EMG va ECG TXT fayllaridan [m_ms, n_ms] oraliqni kesib olib:
      - 'signal' ustuniga EMG signal kesimini yozadi,
      - 'bmi' (massa / (bo'y/100)^2), 'uzun' (qatorlar soni), 'hrate' (ECG o'rtacha BPM, int) ni faqat 1-qatorga yozadi,
      - natijani TXT faylga saqlaydi.

    Returns:
        (out_path, stats_dict)
    """
    # --- EMG'ni o‘qish ---
    emg = pd.read_csv(emg_path, sep="\t")
    emg.columns = [str(c).strip() for c in emg.columns]
    t_emg = find_time_col(emg)
    emg["Time_ms"] = (emg[t_emg] * 1000.0).round().astype(int)

    # Oraliqni tartibga keltirish
    if m_ms > n_ms:
        m_ms, n_ms = n_ms, m_ms

    # EMG kesimi
    emg_slice = emg[(emg["Time_ms"] >= m_ms) & (emg["Time_ms"] <= n_ms)].copy()
    if emg_slice.empty:
        raise ValueError(f"EMG: {m_ms}–{n_ms} ms oralig'ida ma'lumot topilmadi.")

    # --- ECG'ni o‘qish ---
    ecg = pd.read_csv(ecg_path, sep="\t")
    ecg.columns = [str(c).strip() for c in ecg.columns]
    t_ecg = find_time_col(ecg)
    ecg["Time_ms"] = (ecg[t_ecg] * 1000.0).round().astype(int)

    # ECG kesimi
    ecg_slice = ecg[(ecg["Time_ms"] >= m_ms) & (ecg["Time_ms"] <= n_ms)].copy()
    if ecg_slice.empty:
        raise ValueError(f"ECG: {m_ms}–{n_ms} ms oralig'ida ma'lumot topilmadi.")

    # --- Hisoblashlar ---
    # ECG o‘rtacha yurak urishi (integer BPM)
    hrate_mean = int(round(pd.to_numeric(ecg_slice["ECG"], errors="coerce").dropna().mean()))
    # BMI
    bmi_value = round(mass_kg / ((height_cm / 100.0) ** 2), 2)
    # Signal uzunligi
    uzun_value = int(len(emg_slice))

    # --- Chiqish jadvali ---
    signal_vals = pd.to_numeric(emg_slice[emg_col], errors="coerce").reset_index(drop=True)
    out_df = pd.DataFrame({"signal": signal_vals})
    out_df["bmi"] = None
    out_df["uzun"] = None
    out_df["hrate"] = None

    # Faqat 1-qatorga scalarlar
    out_df.loc[0, "bmi"] = bmi_value
    out_df.loc[0, "uzun"] = uzun_value
    out_df.loc[0, "hrate"] = hrate_mean

    # --- Saqlash ---
    if out_path is None:
        # avtomatik nom: <EMG_COL>_slice_<m>_<n>.txt — emg fayli papkasiga
        base_dir = os.path.dirname(os.path.abspath(emg_path))
        out_path = os.path.join(base_dir, f"{emg_col}_slice_{m_ms}_{n_ms}.txt")

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    out_df.to_csv(out_path, sep="\t", index=False)

    stats = {"bmi": bmi_value, "uzun": uzun_value, "hrate_mean": hrate_mean,
             "m_ms": m_ms, "n_ms": n_ms, "rows": len(out_df)}

    return out_path, stats


# # Chaqirish
# out_path, stats = save_emg_slice_with_stats(
#     emg_path=r"D:/secret/Script/emt_outputs/04-10-2025/RBBCL.txt",
#     ecg_path=r"D:/secret/Script/emt_outputs/04-10-2025/ECG.txt",
#     emg_col="RBBCL",
#     m_ms=1000,
#     n_ms=5000,
#     mass_kg=70.0,
#     height_cm=175.0,
#     out_path=r"D:/secret/Script/emt_outputs/04-10-2025/RBBCL_slice_1000_5000.txt",  # ixtiyoriy
# )

# print("Saved to:", out_path)
# print("Stats:", stats)
