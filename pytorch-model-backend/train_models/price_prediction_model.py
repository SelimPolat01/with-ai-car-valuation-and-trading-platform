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
    y = np.log1p(df["price"]) 
    
    categorical_cols = ["brand", "model", "body_type", "transmission", "fuel_type", "trim_level"]
    for col in categorical_cols:
        if col in X.columns:
            X[col] = X[col].astype(str).str.replace(r"\u00a0", " ", regex=True).str.lower().str.strip().fillna("missing").astype("category")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    
    if model_name == "Premium":
        model = xgb.XGBRegressor(
            n_estimators=1500,
            max_depth=12,            
            learning_rate=0.05,      
            subsample=0.9,
            colsample_bytree=0.9,
            early_stopping_rounds=100,
            enable_categorical=True,
            tree_method="hist",
            random_state=42,
            n_jobs=-1 
        )
    else:
        model = xgb.XGBRegressor(
            n_estimators=1000,
            max_depth=8,
            learning_rate=0.03,
            subsample=0.8,
            colsample_bytree=0.8,
            early_stopping_rounds=50,
            enable_categorical=True,
            tree_method="hist",
            random_state=42,
            n_jobs=-1 
        )

    model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=200)
    
    y_pred_log = model.predict(X_test)
    y_pred = np.expm1(y_pred_log)
    y_test_real = np.expm1(y_test)
    
    mae = mean_absolute_error(y_test_real, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test_real, y_pred)) 
    r2 = r2_score(y_test_real, y_pred)
    
    print(f"[{model_name}] R² Skoru: {r2:.4f} | MAE: {mae:,.2f} TL | RMSE: {rmse:,.2f} TL")
    
    filename = f"xgboost_{model_name.lower()}_model.json"
    model.save_model(filename)
    print(f"Model kaydedildi: {filename}")

if __name__ == "__main__":
    df = load_and_preprocess("cars.csv")

    premium_brands = [
        "bmw", "mercedes-benz", "audi",
    ]
    
    is_premium_model = df["brand"].isin(premium_brands)
    
    df_premium = df[is_premium_model]
    df_standard = df[~is_premium_model]
    
    if len(df_premium) > 0:
        train_specific_model(df_premium, "Premium")
    else:
        print("Premium araç bulunamadı!")
        
    if len(df_standard) > 0:
        train_specific_model(df_standard, "Standard")