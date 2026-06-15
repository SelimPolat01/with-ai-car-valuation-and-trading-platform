import os
import io
import urllib
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb

from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.requests import Request

from car_data import CarData 

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "https://localhost:3000", 
        "http://127.0.0.1:3000", 
        "https://with-ai-car-valuation-and-trading-sy9d.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("uploads", exist_ok=True)

PREMIUM_BRANDS = [
    "bmw", "mercedes-benz", "audi", "porsche", "land rover", 
    "volvo", "jaguar", "lexus", "mini", "jeep", "alfa romeo", "maserati"
]

luxury_models = [
    "5 series", "5 serisi", "5series", "5serisi", "5-series", "5-serisi",
    "e series", "e serisi", "eseries", "eserisi", "e-series", "e-serisi",
    "g class", "g-class", "g serisi", "7 series", "7 serisi", "7-series",
    "a6", "a7", "a8", "q7", "q8", "x5", "x6", "x7"
]

main_model = xgb.XGBRegressor()
main_model.load_model("./models/price_prediction/xgboost_main_model_premium_son_son.json")

days_to_sell_model = xgb.XGBRegressor()
days_to_sell_model.load_model("./models/average_sell_time_prediction/days_to_sell_xgb_model.json")

label_encoders = joblib.load("label_encoders.pkl")


@app.get("/")
def home():
    return {"message": "API çalışıyor"}


@app.post("/car-detection-upload")
@limiter.limit("10/minute")
async def carDetectionUpload(request: Request, file: UploadFile = File(...)):
    try:
        import gc
        import torch
        import torchvision
        from PIL import Image
        from CNNs.car_detection_cnn import CarDetectionCNN

        device = "cuda" if torch.cuda.is_available() else "cpu"

        transform = torchvision.transforms.Compose([
            torchvision.transforms.Resize(size=(224, 224)),
            torchvision.transforms.ToTensor(),
            torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        car_detection_data = torchvision.datasets.ImageFolder(root="./class_names/cars/train", transform=transform)
        car_detection_class_names = car_detection_data.classes

        carDetectionModel = CarDetectionCNN(
            input_shape=3, hidden_units_1=32, hidden_units_2=64, hidden_units_3=128,
            hidden_units_4=256, hidden_units_5=512, hidden_units_6=1024, output_shape=95
        ).to(device)
        
        car_detection_state_dict = torch.load("models/car_detection/car_detection_cnn_model_20_epoch100_acc89.pth", map_location=device, weights_only=True)
        car_detection_clean_state_dict = {k.replace("_orig_mod.", ""): v for k, v in car_detection_state_dict.items()}
        carDetectionModel.load_state_dict(car_detection_clean_state_dict, strict=False)
        carDetectionModel.eval()

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = transform(img).unsqueeze(0).to(device)

        with torch.inference_mode():
            y_pred = carDetectionModel(img_tensor)
            y_logit = torch.argmax(y_pred, dim=1)
        
        result = {
            "prediction": car_detection_class_names[y_logit.item()],
            "prediction_percent": round(torch.max(torch.softmax(y_pred, dim=1)).item() * 100)
        }

        del carDetectionModel, car_detection_data, car_detection_state_dict, car_detection_clean_state_dict, img_tensor, img, contents
        gc.collect()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/car-direction-detection-upload")
@limiter.limit("100/minute")
async def carDirectionDetectionUpload(request: Request, file: UploadFile = File(...)):
    try:
        import gc
        import torch
        import torchvision
        from PIL import Image
        from CNNs.car_direction_detection_cnn import CarDirectionDetectionCNN

        device = "cuda" if torch.cuda.is_available() else "cpu"

        transform = torchvision.transforms.Compose([
            torchvision.transforms.Resize(size=(224, 224)),
            torchvision.transforms.ToTensor(),
            torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        car_direction_detection_data = torchvision.datasets.ImageFolder(root="./class_names/directions/train", transform=transform)
        car_direction_detection_class_names = car_direction_detection_data.classes

        carDirectionDetectionModel = CarDirectionDetectionCNN(
            input_shape=3, hidden_units_1=32, hidden_units_2=64, hidden_units_3=128, hidden_units_4=256, output_shape=4
        ).to(device)
        
        car_direction_detection_state_dict = torch.load("models/car_direction_detection/car_direction_detection_cnn_model_1_epoch100_acc100.pth", map_location=device, weights_only=True)
        car_direction_detection_clean_state_dict = {k.replace("_orig_mod.", ""): v for k, v in car_direction_detection_state_dict.items()}
        carDirectionDetectionModel.load_state_dict(car_direction_detection_clean_state_dict, strict=False)
        carDirectionDetectionModel.eval()

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = transform(img).unsqueeze(0).to(device)

        with torch.inference_mode():
            y_pred = carDirectionDetectionModel(img_tensor)
            y_logit = torch.argmax(y_pred, dim=1)

        result = {
            "prediction": car_direction_detection_class_names[y_logit.item()],
            "prediction_percent": round(torch.max(torch.softmax(y_pred, dim=1)).item() * 100)
        }

        del carDirectionDetectionModel, car_direction_detection_data, car_direction_detection_state_dict, car_direction_detection_clean_state_dict, img_tensor, img, contents
        gc.collect()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/car-scratch-dent-detection-upload")
@limiter.limit("100/minute")
async def carStrachDentDetectionUpload(request: Request, file: UploadFile = File(...)):
    try:
        import gc
        import torch
        import torchvision
        from PIL import Image
        from CNNs.car_scratch_dent_detection_cnn import CarScratchDentDetectionCNN

        device = "cuda" if torch.cuda.is_available() else "cpu"

        scratch_dent_transform = torchvision.transforms.Compose([
            torchvision.transforms.Resize(size=(256, 256)),
            torchvision.transforms.ToTensor(),
            torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        car_scratch_dent_detection_data = torchvision.datasets.ImageFolder(root="./class_names/damages/train", transform=scratch_dent_transform)
        car_scratch_dent_detection_class_names = car_scratch_dent_detection_data.classes

        carScratchDentDetectionModel = CarScratchDentDetectionCNN(
            input_shape=3, hidden_units_1=32, hidden_units_2=64, hidden_units_3=128, hidden_units_4=256, output_shape=3
        ).to(device)
        
        car_scratch_dent_detection_state_dict = torch.load("models/car_scratch_dent_detection/car_scratch_dent_detection_cnn_model_7_epoch100_acc90.pth", map_location=device, weights_only=True)
        car_scratch_dent_detection_clean_state_dict = {k.replace("_orig_mod.", ""): v for k, v in car_scratch_dent_detection_state_dict.items()}
        carScratchDentDetectionModel.load_state_dict(car_scratch_dent_detection_clean_state_dict, strict=False)
        carScratchDentDetectionModel.eval()

        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = scratch_dent_transform(img).unsqueeze(0).to(device)
        
        with torch.inference_mode():
            y_pred = carScratchDentDetectionModel(img_tensor)
            probs = torch.softmax(y_pred, dim=1)[0]
            pred_class_idx = torch.argmax(probs).item()
            pred_class_name = car_scratch_dent_detection_class_names[pred_class_idx]
            pred_percent = round(probs[pred_class_idx].item() * 100)

        result = {
            "prediction": pred_class_name,
            "prediction_percent": pred_percent
        }

        del carScratchDentDetectionModel, car_scratch_dent_detection_data, car_scratch_dent_detection_state_dict, car_scratch_dent_detection_clean_state_dict, img_tensor, img, contents
        gc.collect()
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict")
@limiter.limit("50/minute")
async def predict(request: Request, data: CarData):
    if data.brand: data.brand = urllib.parse.unquote(data.brand).lower().strip()
    if data.model: data.model = urllib.parse.unquote(data.model).lower().strip()
    if data.body_type: data.body_type = urllib.parse.unquote(data.body_type).lower().strip()
    if data.trim_level: data.trim_level = urllib.parse.unquote(data.trim_level).lower().strip()
    if data.transmission: data.transmission = urllib.parse.unquote(data.transmission).lower().strip()
    if data.fuel_type: data.fuel_type = urllib.parse.unquote(data.fuel_type).lower().strip()
    
    if data.brand in ["mercedes", "mercedes benz"]:
        data.brand = "mercedes-benz"

    df = pd.DataFrame([data.dict()])
    
    if 'kilometer' not in df.columns:
        df['kilometer'] = df['km'] if 'km' in df.columns else getattr(data, 'kilometer', getattr(data, 'km', 100000))
    if 'model_year' not in df.columns:
        df['model_year'] = df['year'] if 'year' in df.columns else getattr(data, 'model_year', getattr(data, 'year', 2020))

    df["is_premium"] = 1 if data.brand in PREMIUM_BRANDS else 0

    expected_price_cols = [
        'brand', 'model', 'model_year', 'body_type', 'engine_capacity', 
        'horsepower', 'transmission', 'kilometer', 'fuel_type', 'trim_level', 'is_premium'
    ]
    df = df[expected_price_cols]

    categorical_cols = ["brand", "model", "body_type", "transmission", "fuel_type", "trim_level"]
    for col in categorical_cols:
        df[col] = df[col].astype(str).fillna("missing").astype("category")
    
    try:
        pred_log = main_model.predict(df)
        real_price = np.expm1(pred_log[0])
    except Exception as e:
        return {"error": f"Model tahmin hatası: {str(e)}. Lütfen kategorileri kontrol edin."}
    
    return {"predicted_price": round(float(real_price), 2)}


@app.post("/predict-sell-time")
@limiter.limit("50/minute")
async def predict_sell_time(request: Request, data: CarData):
    if data.brand: data.brand = urllib.parse.unquote(data.brand).lower().strip()
    if data.model: data.model = urllib.parse.unquote(data.model).lower().strip()
    if data.body_type: data.body_type = urllib.parse.unquote(data.body_type).lower().strip()
    if data.trim_level: data.trim_level = urllib.parse.unquote(data.trim_level).lower().strip()
    if data.transmission: data.transmission = urllib.parse.unquote(data.transmission).lower().strip()
    if data.fuel_type: data.fuel_type = urllib.parse.unquote(data.fuel_type).lower().strip()

    if data.brand in ["mercedes", "mercedes benz"]:
        data.brand = "mercedes-benz"

    try:
        km = data.kilometer if hasattr(data, 'kilometer') and data.kilometer is not None else getattr(data, 'km')
        yil = data.model_year if hasattr(data, 'model_year') and data.model_year is not None else getattr(data, 'year')
    except AttributeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Kilometre veya Model Yılı alanı eksik gönderildi!"
        )

    input_data = {
        'brand': data.brand, 'model': data.model, 'body_type': data.body_type,
        'engine_capacity': data.engine_capacity, 'horsepower': data.horsepower,
        'transmission': data.transmission, 'kilometer': km, 'fuel_type': data.fuel_type,
        'price': data.price, 'trim_level': data.trim_level, 'has_scratch': data.has_scratch,
        'has_dent': data.has_dent, 'car_age': 2026 - int(yil)
    }

    df = pd.DataFrame([input_data])

    try:
        df['price'] = df['price'].astype(str).str.replace('.', '', regex=False).str.replace(',', '', regex=False)
        df['price'] = pd.to_numeric(df['price'], errors='raise').astype(float)
        df['kilometer'] = df['kilometer'].astype(str).str.replace('.', '', regex=False).str.replace(',', '', regex=False)
        df['kilometer'] = pd.to_numeric(df['kilometer'], errors='raise').astype(float)
        df['engine_capacity'] = pd.to_numeric(df['engine_capacity'], errors='raise').astype(float)
        df['horsepower'] = pd.to_numeric(df['horsepower'], errors='raise').astype(float)
        df['has_scratch'] = pd.to_numeric(df['has_scratch'], errors='raise').astype(int)
        df['has_dent'] = pd.to_numeric(df['has_dent'], errors='raise').astype(int)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sayısal alanlardan biri (price, kilometer, engine_capacity, horsepower, has_scratch, has_dent) geçersiz formatta veya boş!"
        )

    categorical_cols = ['brand', 'model', 'body_type', 'transmission', 'fuel_type', 'trim_level']
    for col in categorical_cols:
        le = label_encoders.get(col)
        if le:
            val = str(df[col].iloc[0])
            if val in le.classes_:
                df[col] = le.transform([val])[0]
            else:
                df[col] = 0

    expected_cols = [
        'brand', 'model', 'body_type', 'engine_capacity', 'horsepower', 
        'transmission', 'kilometer', 'fuel_type', 'price', 'trim_level', 
        'has_scratch', 'has_dent', 'car_age'
    ]
    df = df[expected_cols]
    
    try:
        pred = days_to_sell_model.predict(df)
        predicted_days = max(1, int(round(float(pred[0]))))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Satış süresi tahmin motoru hatası: {str(e)}"
        )

    return {"predicted_days_to_sell": predicted_days}