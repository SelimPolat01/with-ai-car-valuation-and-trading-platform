import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def load_and_preprocess(file_path):
    df = pd.read_csv(file_path)
    
    if "created_at" in df.columns:
        df = df.drop(columns=["created_at"])
    if "id" in df.columns:
        df = df.drop(columns=["id"])
        
    if "brand" in df.columns:
        df["brand"] = df["brand"].astype(str).str.lower().str.strip()
        df["brand"] = df["brand"].replace(["mercedes", "mercedes benz"], "mercedes-benz")
        
    if "model" in df.columns:
        df["model"] = df["model"].astype(str).str.replace(r"\u00a0", " ", regex=True).str.lower().str.strip()
        
    return df

def train_specific_model(df, model_name):
    print(f"\n--- {model_name} Eğitiliyor ({len(df)} araç) ---")
    
    X = df.drop(columns=["price"])
    # Logaritmik dönüşüm fiyatın dengeli öğrenilmesi için önemli
    y = np.log1p(df["price"]) 
    
    # Yeni model araçlara yüksek ağırlık veriyoruz
    weights = np.ones(len(df))
    if "model_year" in df.columns:
        weights = np.where(df["model_year"] == 2024, 5.0, weights)
        weights = np.where(df["model_year"] == 2023, 3.0, weights)
        weights = np.where(df["model_year"] == 2022, 2.0, weights)

    # Kategorik değişkenleri XGBoost formatına çevirme
    categorical_cols = ["brand", "model", "body_type", "transmission", "fuel_type", "trim_level"]
    for col in categorical_cols:
        if col in X.columns:
            X[col] = X[col].astype(str).str.replace(r"\u00a0", " ", regex=True).str.lower().str.strip().fillna("missing").astype("category")

    X_train, X_test, y_train, y_test, w_train, w_test = train_test_split(
        X, y, weights, test_size=0.15, random_state=42
    )

    # Fiziksel Kurallar: Yıl artarsa fiyat artar, KM artarsa fiyat düşer
    constraints = {}
    if "model_year" in X.columns:
        constraints["model_year"] = 1
    if "kilometer" in X.columns:
        constraints["kilometer"] = -1

    if model_name == "Premium":
        model = xgb.XGBRegressor(
            objective="reg:absoluteerror", # Doğrudan MAE düşürmeye odaklan
            n_estimators=1500,
            max_depth=7, 
            learning_rate=0.03,      
            subsample=0.85,
            colsample_bytree=0.85,
            early_stopping_rounds=100,
            enable_categorical=True,
            tree_method="hist",
            monotone_constraints=constraints, 
            random_state=42,
            n_jobs=-1 
        )
    else:
        model = xgb.XGBRegressor(
            objective="reg:absoluteerror", # Doğrudan MAE düşürmeye odaklan
            n_estimators=1200,
            max_depth=6,
            learning_rate=0.03,
            subsample=0.8,
            colsample_bytree=0.8,
            early_stopping_rounds=50,
            enable_categorical=True,
            tree_method="hist",
            monotone_constraints=constraints, 
            random_state=42,
            n_jobs=-1 
        )

    model.fit(
        X_train, y_train, 
        sample_weight=w_train, 
        eval_set=[(X_test, y_test)], 
        verbose=200
    )
    
    # Tahminleri logaritmik formattan gerçek fiyat formatına geri çevirme
    y_pred_log = model.predict(X_test)
    y_pred = np.expm1(y_pred_log)
    y_test_real = np.expm1(y_test)
    
    # Metriklerin hesaplanması
    mae = mean_absolute_error(y_test_real, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_real, y_pred)) 
    r2 = r2_score(y_test_real, y_pred)
    
    print(f"[{model_name}] R² Skoru: {r2:.4f} | MAE: {mae:,.2f} TL | RMSE: {rmse:,.2f} TL")
    
    filename = f"xgboost_{model_name.lower()}_modelyeni1.json"
    model.save_model(filename)
    print(f"Model kaydedildi: {filename}")

if __name__ == "__main__":
    # Veri setini yükle
    df = load_and_preprocess("cars.csv")

    # Genişletilmiş Lüks Araç Listesi
    premium_brands = [
        "bmw", "mercedes-benz", "audi", 
        "porsche", "land rover", "volvo", 
        "jaguar", "lexus", "mini", "jeep", "alfa romeo", "maserati"
    ]
    
    is_premium_model = df["brand"].isin(premium_brands)
    
    df_premium = df[is_premium_model]
    df_standard = df[~is_premium_model]
    
    # Modelleri eğit ve kaydet
    if len(df_premium) > 0:
        train_specific_model(df_premium, "Premium")
    else:
        print("Premium araç bulunamadı!")
        
    if len(df_standard) > 0:
        train_specific_model(df_standard, "Standard")