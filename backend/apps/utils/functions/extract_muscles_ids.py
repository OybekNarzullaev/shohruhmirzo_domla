
from apps.core.models import TrainingSession

from .common import find_time_column, emt2df, best_muscle_match_id


def extract_muscles_ids(train_session: TrainingSession) -> str:

    src_emt = train_session.file_EMT.path

    # EMT faylni o‘qish
    df = emt2df(src_emt)
    time_col = find_time_column(df)

    # EMT ustunlaridan mushak ID’larini topish
    found_ids = []
    for col in df.columns:
        if col == time_col:
            continue
        match_id = best_muscle_match_id(col)
        if match_id and match_id not in found_ids:
            found_ids.append(match_id)

    # ID massivini vergul bilan saqlash
    ids_str = ",".join(str(i) for i in sorted(found_ids))

    print("🔢 Topilgan ID’lar:", ids_str)
    return ids_str
