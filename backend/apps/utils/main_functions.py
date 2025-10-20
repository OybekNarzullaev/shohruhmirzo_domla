
import joblib
import prediction_functions as pd_func
from tensorflow import keras

# Modelni yuklash
model_LBBCL = keras.models.load_model("model_LBBCL.keras")
model_RBBCL = keras.models.load_model("model_RBBCL.keras")
model_LPM = keras.models.load_model("model_LPM.keras")
model_RPM = keras.models.load_model("model_RPM.keras")

# Scalerni yuklash
scaler = joblib.load('scaler_2025_10_04.pkl')

# Xususiyatlarni hisoblash
folder = 'path'
features = pd_func.process_folder(folder)

data = scaler.fit_transform(features)

predict = model_LBBCL.predict(data)
