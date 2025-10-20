
import os
import re
from typing import Optional
from apps.core.models import Muscle
import pandas as pd


def emt2df(path: str, encoding: str = "latin1") -> pd.DataFrame:
    """BTS ASCII .emt faylni DataFrame ga o‘qish."""
    with open(path, "r", encoding=encoding, errors="replace") as f:
        lines = f.readlines()

    # Header topish
    header_idx = None
    for i, line in enumerate(lines):
        if "Frame" in line and "Time" in line and "\t" in line:
            header_idx = i
            break
    if header_idx is None:
        raise RuntimeError(
            "Header ('Frame','Time') topilmadi — format o‘zgargan bo‘lishi mumkin.")

    import tempfile
    with tempfile.NamedTemporaryFile("w", delete=False, suffix=".tsv", encoding="utf-8") as tmp:
        tmp.writelines(lines[header_idx:])
        tmp_path = tmp.name

    df = pd.read_csv(tmp_path, sep="\t")
    os.remove(tmp_path)
    df.columns = [str(c).strip() for c in df.columns]
    return df


def find_time_column(df: pd.DataFrame) -> str:
    """Time ustunini topish."""
    for cand in ["Time", "time", "Timestamp", "timestamp", "T", "t"]:
        if cand in df.columns:
            return cand
    for col in df.columns:
        if "time" in str(col).lower():
            return col
    raise KeyError("Time ustuni topilmadi.")


def tokens(s: str) -> set:
    """Matnni tokenlarga bo‘lish (moslik uchun)."""
    words = re.findall(r"[a-z]+", s.lower())
    stop = {"ch", "channel", "emg", "signal"}
    return {w for w in words if w not in stop}


def best_muscle_match_id(colname: str) -> Optional[int]:
    """EMT ustunini mushak nomiga moslab ID qaytaradi."""
    col_toks = tokens(colname)
    best_id, best_score = None, 0
    muscles = Muscle.objects.all()
    for m in muscles:
        name_toks = tokens(m.name)
        score = len(col_toks & name_toks)
        if score > best_score:
            best_id, best_score = m.id, score
    if best_score >= 2:
        return best_id
    return None
