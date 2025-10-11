import os
import numpy as np
import pandas as pd

def calculate_emg_features(data, fs=1000):
    data = data.fillna(0)
    if np.any(np.isnan(data)):
        raise ValueError("Ma'lumotlarda NaN qiymatlar mavjud!")
    
    signal = data['signal']
    # signal = np.array(signal).reshape(-1)
    bmi = data.loc[0, 'bmi']
    uzun = data.loc[0, 'uzun']
    hrate = data.loc[0, 'hrate']

    # Frequency features

    N = len(signal)
    X = np.fft.rfft(signal)
    freqs = np.fft.rfftfreq(N, d=1.0/fs)
    PSD_fft = np.abs(X)**2 / N  # FFT PSD normalizatsiya qilingan

    m0 = np.sum(PSD_fft)
    MNF = np.sum(freqs * PSD_fft) / m0 if m0 != 0 else 0
    amplitude = np.abs(X)
    spectral_centroid = np.sum(freqs * amplitude) / np.sum(amplitude) if np.sum(amplitude) != 0 else 0

    cumulative_power = np.cumsum(PSD_fft)
    MDF_idx = np.where(cumulative_power >= m0 / 2.0)[0][0]
    MDF = freqs[MDF_idx]

    spectral_variance = np.sum(((freqs - MNF)**2) * PSD_fft) / m0 if m0 != 0 else 0
    spectral_variance = spectral_variance / (len(signal) - 1)
    bandwidth = np.sqrt(spectral_variance)
    

    eps = 1e-8
    valid = freqs > 0
    slope, _ = np.polyfit(freqs[valid], np.log10(amplitude[valid] + eps), 1) if np.sum(valid) > 0 else (0, 0)
    
    low_band = (freqs >= 20) & (freqs < 60)
    high_band = (freqs >= 60) & (freqs <= 500)
    low_power = np.sum(PSD_fft[low_band])
    high_power = np.sum(PSD_fft[high_band])
    band_power_ratio = low_power / high_power if high_power != 0 else np.nan
    
    # Amplitude features

    RMS = np.sqrt(np.mean(signal**2))
    MAV = np.mean(np.abs(signal))
    var_val = np.var(signal)
    WL = np.sum(np.abs(np.diff(signal)))

    # Threshold_ssc ni signal amplitudasiga qarab dinamik tanlash
    signal_range = np.ptp(signal)  # Peak-to-peak diapazon
    threshold_ssc = 0.01 * signal_range if signal_range > 0 else 0.01  # Minimal qiymat

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

    # MNF, spectral_centroid, spectral_variance, bandwidth, ssc 
    return [ MDF, MNF, spectral_centroid, spectral_variance, bandwidth, slope,  band_power_ratio, RMS, MAV, var_val, WL, ssc, ZCR, MAD, wamp, bmi, uzun, hrate]

def process_folder(folder_path, fs=1000):
    feature_list = []
    
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".csv"):
            file_path = os.path.join(folder_path, file_name)
            data = pd.read_csv(file_path)
            features = calculate_emg_features(data, fs)
            feature_list.append(features)
            
    feature_array = np.array(feature_list)
    return feature_array