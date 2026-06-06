import torch, torchvision, os
from torchvision import models
import io
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from CNNs.car_detection_cnn import CarDetectionCNN
from CNNs.car_direction_detection_cnn import CarDirectionDetectionCNN
from CNNs.car_scratch_dent_detection_cnn import CarScratchDentDetectionCNN
from PIL import Image
import numpy as np
import pandas as pd
import xgboost as xgb
from car_data import CarData 
import urllib
import joblib
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.requests import Request

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("uploads", exist_ok=True)

device = "cuda" if torch.cuda.is_available() else "cpu"

carDetectionModel = CarDetectionCNN(input_shape=3,
            hidden_units_1=32,
            hidden_units_2=64,
            hidden_units_3=128,
            hidden_units_4=256,
            hidden_units_5=512,
            hidden_units_6=1024,
            output_shape=95).to(device)

carDirectionDetectionModel = CarDirectionDetectionCNN(input_shape=3,
                                                      hidden_units_1=32,
                                                      hidden_units_2=64,
                                                      hidden_units_3=128,
                                                      hidden_units_4=256,
                                                      output_shape=4).to(device)

carScratchDentDetectionModelV1 = CarScratchDentDetectionCNN(input_shape=3,
                                                          hidden_units_1=32,
                                                          hidden_units_2=64,
                                                          hidden_units_3=128,
                                                          hidden_units_4=256,
                                                          output_shape=3).to(device)

carScratchDentDetectionModelV2 = models.efficientnet_b2()
carScratchDentDetectionModelV2.classifier[1] = torch.nn.Linear(
    in_features=carScratchDentDetectionModelV2.classifier[1].in_features, 
    out_features=3
)
carScratchDentDetectionModelV2 = carScratchDentDetectionModelV2.to(device)

premium_model = xgb.XGBRegressor()
premium_model.load_model("xgboost_premium_model_yuksek.json")

standard_model = xgb.XGBRegressor()
standard_model.load_model("xgboost_standard_model_yuksek.json")

days_to_sell_model = xgb.XGBRegressor()
days_to_sell_model.load_model("days_to_sell_xgb_model.json")

label_encoders = joblib.load("label_encoders.pkl")

premium_brands = ["audi", "bmw", "mercedes", "mercedes-benz"]

transform = torchvision.transforms.Compose([
    torchvision.transforms.Resize(size=(224, 224)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                     std=[0.229, 0.224, 0.225])
])

scratch_dent_transformV1 = torchvision.transforms.Compose([
    torchvision.transforms.Resize(size=(256, 256)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                     std=[0.229, 0.224, 0.225])
])

scratch_dent_transformV2 = torchvision.transforms.Compose([
    torchvision.transforms.Resize(size=(384, 384)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                     std=[0.229, 0.224, 0.225])
])

car_detection_data = torchvision.datasets.ImageFolder(root="./cars/train",
                                               transform=transform)

car_direction_detection_data = torchvision.datasets.ImageFolder(root="./directions/train",
                                                                transform=transform)

car_scratch_dent_detection_data = torchvision.datasets.ImageFolder(root="./damages/train",
                                                                   transform=transform)

car_detection_class_names = car_detection_data.classes
car_detection_state_dict = torch.load("models/car_detection/car_detection_cnn_model_20_epoch100_acc89.pth", map_location=device, weights_only=True)
car_detection_clean_state_dict = {
    k.replace("_orig_mod.", ""): v
 for k, v in car_detection_state_dict.items()
}
carDetectionModel.load_state_dict(car_detection_clean_state_dict, strict=False)
carDetectionModel.eval()

car_direction_detection_class_names = car_direction_detection_data.classes
car_direction_detection_state_dict = torch.load("models/car_direction_detection/car_direction_detection_cnn_model_1_epoch100_acc100.pth", map_location=device, weights_only=True)
car_direction_detection_clean_state_dict = {
    k.replace("_orig_mod.", ""): v
for k, v in car_direction_detection_state_dict.items()
}
carDirectionDetectionModel.load_state_dict(car_direction_detection_clean_state_dict, strict=False)
carDirectionDetectionModel.eval()

car_scratch_dent_detection_class_namesV1 = car_scratch_dent_detection_data.classes
car_scratch_dent_detection_state_dictV1= torch.load("models/car_scratch_dent_detection/car_scratch_dent_detection_cnn_model_5_epoch100_acc88.pth", map_location=device, weights_only=True)
car_scratch_dent_detection_clean_state_dictV1 = {
    k.replace("_orig_mod.", ""): v
for k, v in car_scratch_dent_detection_state_dictV1.items()
}
carScratchDentDetectionModelV1.load_state_dict(car_scratch_dent_detection_clean_state_dictV1, strict=False)
carScratchDentDetectionModelV1.eval()

car_scratch_dent_detection_class_namesV2 = car_scratch_dent_detection_data.classes
car_scratch_dent_detection_state_dictV2 = torch.load("models/car_scratch_dent_detection/efficientnet_b2_epoch30_acc99.pth", map_location=device, weights_only=True)
car_scratch_dent_detection_clean_state_dictV2 = {
    k.replace("_orig_mod.", ""): v
for k, v in car_scratch_dent_detection_state_dictV2.items()
}
carScratchDentDetectionModelV2.load_state_dict(car_scratch_dent_detection_clean_state_dictV2, strict=False)
carScratchDentDetectionModelV2.eval()

@app.get("/")
def home():
    return {"message": "API çalışıyor"}

@app.post("/car-detection-upload")
@limiter.limit("10/minute")
async def carDetectionUpload(request: Request, file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.inference_mode():
        y_pred = carDetectionModel(img_tensor)
        y_logit = torch.argmax(y_pred, dim=1)
    
    return {
        "prediction": car_detection_class_names[y_logit.item()],
        "prediction_percent": round(torch.max(torch.softmax(y_pred, dim=1)).item() * 100)
    }

@app.post("/car-direction-detection-upload")
@limiter.limit("10/minute")
async def carDirectionDetectionUpload(request: Request, file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.inference_mode():
        y_pred = carDirectionDetectionModel(img_tensor)
        y_logit = torch.argmax(y_pred, dim=1)

    return {
        "prediction": car_direction_detection_class_names[y_logit.item()],
        "prediction_percent": round(torch.max(torch.softmax(y_pred, dim=1)).item() * 100)
    }


@app.post("/car-scratch-dent-detection-upload")
@limiter.limit("10/minute")
async def carStrachDentDetectionUpload(request: Request, file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    width, height = img.size
    half_w, half_h = width // 2, height // 2
    boxes = [
        (0, 0, half_w, half_h),        
        (half_w, 0, width, half_h),       
        (0, half_h, half_w, height),     
        (half_w, half_h, width, height),  
        (width//4, height//4, width*3//4, height*3//4)
    ]
    
    patches = [img.crop(box) for box in boxes]
    predictions = []
    
    with torch.inference_mode():
        for patch in patches:
            img_tensor = scratch_dent_transformV2(patch).unsqueeze(0).to(device)
            y_pred = carScratchDentDetectionModelV1(img_tensor)
            
            probs = torch.softmax(y_pred, dim=1)[0]
            pred_class_idx = torch.argmax(probs).item()
            pred_class_name = car_scratch_dent_detection_class_namesV1[pred_class_idx]
            pred_percent = round(probs[pred_class_idx].item() * 100)
            
            predictions.append({
                "class": pred_class_name,
                "percent": pred_percent
            })

    final_prediction = "clean"
    final_percent = 0
    
    for pred in predictions:
        if pred["class"] in ["dent", "scratch"] and pred["percent"] > 50:
            final_prediction = pred["class"]
            final_percent = pred["percent"]
            break

    if final_prediction == "clean":
        highest_clean = max([p["percent"] for p in predictions if p["class"] == "clean"] + [0])
        final_percent = highest_clean if highest_clean > 0 else 99

    return {
        "prediction": final_prediction,
        "prediction_percent": final_percent
    }


luxury_models = [
        "5 series", "5 serisi", "5series", "5serisi", "5-series", "5-serisi",
        "e series", "e serisi", "eseries", "eserisi", "e-series", "e-serisi",
        "g class", "g-class", "g serisi", "7 series", "7 serisi", "7-series",
        "a6", "a7", "a8", "q7", "q8", "x5", "x6", "x7"
]

@app.post("/predict")
@limiter.limit("5/minute")
async def predict(request: Request, data: CarData):
    if data.brand: data.brand = urllib.parse.unquote(data.brand).lower().strip()
    if data.model: data.model = urllib.parse.unquote(data.model).lower().strip()
    if data.body_type: data.body_type = urllib.parse.unquote(data.body_type)
    if data.brand in ["mercedes", "mercedes benz"]:
        data.brand = "mercedes-benz"

    df = pd.DataFrame([data.dict()])
    expected_price_cols = [
        'brand', 'model', 'model_year', 'body_type', 'engine_capacity', 
        'horsepower', 'transmission', 'kilometer', 'fuel_type', 'trim_level'
    ]
    
    if 'kilometer' not in df.columns:
        df['kilometer'] = df['km'] if 'km' in df.columns else getattr(data, 'kilometer', getattr(data, 'km', 100000))
        
    if 'model_year' not in df.columns:
        df['model_year'] = df['year'] if 'year' in df.columns else getattr(data, 'model_year', getattr(data, 'year', 2020))

    df = df[expected_price_cols]
    categorical_cols = ["brand", "model", "body_type", "transmission", "fuel_type", "trim_level"]
    for col in categorical_cols:
        df[col] = df[col].astype("category")
    
    gelen_model = data.model if data.model else ""
    
    if gelen_model in luxury_models:
        pred_log = premium_model.predict(df)
        real_price = np.expm1(pred_log[0])
        ultra_luxury = ["s class", "s-class", "s serisi", "g class", "g-class", "g serisi", "7 series", "7 serisi", "q8", "x7"]
        
        if gelen_model in ultra_luxury:
            km = float(df['kilometer'].iloc[0])
            yil = int(df['model_year'].iloc[0])
        
            if km < 50000 and yil >= 2022:
                real_price = real_price * 1.85  
            elif km < 100000 and yil >= 2020:
                real_price = real_price * 1.50  
            else:
                real_price = real_price * 1.25  
                
    else:
        pred_log = standard_model.predict(df)
        real_price = np.expm1(pred_log[0])
    
    return {"predicted_price": round(float(real_price), 2)}

@app.post("/predict-sell-time")
@limiter.limit("50/minute")
async def predict_sell_time(request: Request, data: CarData):
    if data.brand: data.brand = urllib.parse.unquote(data.brand).lower().strip()
    if data.model: data.model = urllib.parse.unquote(data.model).lower().strip()
    if data.body_type: data.body_type = urllib.parse.unquote(data.body_type)
    if data.brand in ["mercedes", "mercedes benz"]:
        data.brand = "mercedes-benz"

    km = data.kilometer if hasattr(data, 'kilometer') else getattr(data, 'km', 100000)
    yil = data.model_year if hasattr(data, 'model_year') else getattr(data, 'year', 2020)

    input_data = {
        'brand': data.brand,
        'model': data.model,
        'body_type': data.body_type,
        'engine_capacity': data.engine_capacity,
        'horsepower': data.horsepower,
        'transmission': data.transmission,
        'kilometer': km,
        'fuel_type': data.fuel_type,
        'price': data.price,
        'trim_level': data.trim_level,
        'has_scratch': int(data.has_scratch) if hasattr(data, 'has_scratch') else 0,
        'has_dent': int(data.has_dent) if hasattr(data, 'has_dent') else 0,
        'car_age': 2026 - yil
    }

    df = pd.DataFrame([input_data])
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
    pred = days_to_sell_model.predict(df)
    predicted_days = max(1, int(round(float(pred[0]))))

    return {"predicted_days_to_sell": predicted_days}