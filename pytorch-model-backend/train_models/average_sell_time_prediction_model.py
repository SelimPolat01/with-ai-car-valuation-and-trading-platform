import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

df = pd.read_csv("sold_adverts.csv")

df['car_age'] = 2026 - df['model_year']

X = df.drop(columns=['days_to_sell', 'created_at', 'sold_at', 'id', 'model_year'], errors='ignore')
y = df['days_to_sell']

boolean_cols = ['has_scratch', 'has_dent'] 

for col in boolean_cols:
    if col in X.columns:
        X[col] = X[col].replace({'TRUE': 1, 'FALSE': 0, 'true': 1, 'false': 0, 'True': 1, 'False': 0, True: 1, False: 0}).astype(int)

categorical_cols = ['brand', 'model', 'body_type', 'transmission', 'fuel_type', 'trim_level']
encoders = {}

for col in categorical_cols:
    le = LabelEncoder()
    X[col] = le.fit_transform(X[col].astype(str))
    encoders[col] = le 

X_temp, X_test, y_temp, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
X_train, X_val, y_train, y_val = train_test_split(X_temp, y_temp, test_size=0.176, random_state=42)

model = xgb.XGBRegressor(
    objective='reg:squarederror', 
    n_estimators=1500,       
    learning_rate=0.03,      
    max_depth=6, 
    subsample=0.8, 
    colsample_bytree=0.8,
    random_state=42,
    early_stopping_rounds=50 
)

model.fit(
    X_train, y_train,
    eval_set=[(X_train, y_train), (X_val, y_val)],
    verbose=False
)

print(f"Eğitim tamamlandı! Model {model.best_iteration}. iterasyonda en optimum sonuca ulaştı.")

predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
rmse = np.sqrt(mean_squared_error(y_test, predictions))
r2 = r2_score(y_test, predictions)

print("\n--- MODEL PERFORMANS SONUÇLARI ---")
print(f"Ortalama Hata (MAE): {mae:.2f} gün")
print(f"Kök Ortalama Kare Hata (RMSE): {rmse:.2f} gün")
print(f"Açıklanabilirlik (R² Skoru): {r2:.4f}")

model.save_model("days_to_sell_xgb_model22.json")
joblib.dump(encoders, "label_encoders.pkl")
print("\nModel ve encoder'lar yerel dizine başarıyla kaydedildi!")