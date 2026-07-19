import os
import io
import urllib.parse
import joblib
import re
import numpy as np
import pandas as pd
import psycopg2
import torch
import torchvision
import xgboost as xgb
from fastapi import FastAPI, UploadFile, File, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from transformers import pipeline, logging
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from pgvector.psycopg2 import register_vector
from PIL import Image
from car_data import CarData
from CNNs.car_detection_cnn import CarDetectionCNN
from CNNs.car_direction_detection_cnn import CarDirectionDetectionCNN
from CNNs.car_scratch_dent_detection_cnn import CarScratchDentDetectionCNN
from dotenv import load_dotenv

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://localhost:3000", "http://127.0.0.1:3000", "https://with-ai-car-valuation-and-trading-sy9d.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.add_middleware(SlowAPIMiddleware)

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

device = "cuda" if torch.cuda.is_available() else "cpu"

transform_224 = torchvision.transforms.Compose([
    torchvision.transforms.Resize(size=(224, 224)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

transform_256 = torchvision.transforms.Compose([
    torchvision.transforms.Resize(size=(256, 256)),
    torchvision.transforms.ToTensor(),
    torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

try:
    car_detection_data = torchvision.datasets.ImageFolder(root="./class_names/cars/train")
    car_detection_class_names = car_detection_data.classes
except Exception:
    car_detection_class_names = []

carDetectionModel = CarDetectionCNN(
    input_shape=3, hidden_units_1=32, hidden_units_2=64, hidden_units_3=128,
    hidden_units_4=256, hidden_units_5=512, hidden_units_6=1024, output_shape=95
).to(device)
if os.path.exists("models/car_detection/car_detection_cnn_model_20_epoch100_acc89.pth"):
    car_detection_state_dict = torch.load("models/car_detection/car_detection_cnn_model_20_epoch100_acc89.pth", map_location=device, weights_only=True)
    carDetectionModel.load_state_dict({k.replace("_orig_mod.", ""): v for k, v in car_detection_state_dict.items()}, strict=False)
carDetectionModel.eval()

try:
    car_direction_detection_data = torchvision.datasets.ImageFolder(root="./class_names/directions/train")
    car_direction_detection_class_names = car_direction_detection_data.classes
except Exception:
    car_direction_detection_class_names = []

carDirectionDetectionModel = CarDirectionDetectionCNN(
    input_shape=3, hidden_units_1=32, hidden_units_2=64, hidden_units_3=128, hidden_units_4=256, output_shape=4
).to(device)
if os.path.exists("models/car_direction_detection/car_direction_detection_cnn_model_1_epoch100_acc100.pth"):
    car_direction_detection_state_dict = torch.load("models/car_direction_detection/car_direction_detection_cnn_model_1_epoch100_acc100.pth", map_location=device, weights_only=True)
    carDirectionDetectionModel.load_state_dict({k.replace("_orig_mod.", ""): v for k, v in car_direction_detection_state_dict.items()}, strict=False)
carDirectionDetectionModel.eval()

try:
    car_scratch_dent_detection_data = torchvision.datasets.ImageFolder(root="./class_names/damages/train")
    car_scratch_dent_detection_class_names = car_scratch_dent_detection_data.classes
except Exception:
    car_scratch_dent_detection_class_names = []

carScratchDentDetectionModel = CarScratchDentDetectionCNN(
    input_shape=3, hidden_units_1=32, hidden_units_2=64, hidden_units_3=128, hidden_units_4=256, output_shape=3
).to(device)
if os.path.exists("models/car_scratch_dent_detection/car_scratch_dent_detection_cnn_model_7_epoch100_acc90.pth"):
    car_scratch_dent_detection_state_dict = torch.load("models/car_scratch_dent_detection/car_scratch_dent_detection_cnn_model_7_epoch100_acc90.pth", map_location=device, weights_only=True)
    carScratchDentDetectionModel.load_state_dict({k.replace("_orig_mod.", ""): v for k, v in car_scratch_dent_detection_state_dict.items()}, strict=False)
carScratchDentDetectionModel.eval()

main_model = xgb.XGBRegressor()
try:
    if os.path.exists("./models/price_prediction/xgboost_main_model_premium_son_son.json"):
        main_model.load_model("./models/price_prediction/xgboost_main_model_premium_son_son.json")
except Exception as e:
    print(f"XGBoost Fiyat Modeli yüklenemedi: {e}")

days_to_sell_model = xgb.XGBRegressor()
label_encoders = {}
try:
    if os.path.exists("./models/average_sell_time_prediction/days_to_sell_xgb_model.json"):
        days_to_sell_model.load_model("./models/average_sell_time_prediction/days_to_sell_xgb_model.json")
    if os.path.exists("label_encoders.pkl"):
        label_encoders = joblib.load("label_encoders.pkl")
except Exception as e:
    print(f"XGBoost Satış Süresi Modeli veya Encoder yüklenemedi: {e}")

logging.set_verbosity_error()
text_summarizer = pipeline(
    "summarization",
    model="SSERPENT1NEE/oto-ekspertiz-ozet-modeli", 
    tokenizer="SSERPENT1NEE/oto-ekspertiz-ozet-modeli",  
    device=0 if torch.cuda.is_available() else -1
)

embedding_model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2", device=device)

ner_pipeline = pipeline(
    "ner", 
    model="savasy/bert-base-turkish-ner-cased", 
    aggregation_strategy="simple",
    device=0 if torch.cuda.is_available() else -1
)

DATABASE_URL = os.getenv("DATABASE_URL")

class SummaryRequest(BaseModel):
    description: str

class searchRequest(BaseModel):
    text: str

class AdRequest(BaseModel):
    title: str
    description: str

def normalize_text_numbers(text):
    number_map = {
        "sıfır": "0", "bir": "1", "iki": "2", "üç": "3", "dört": "4",
        "beş": "5", "altı": "6", "yedi": "7", "sekiz": "8", "dokuz": "9",
        "on": "1", "yirmi": "2", "otuz": "3", "kırk": "4", "elli": "5",
        "seksen": "8", "doksan": "9", "yüz": "", "bin": ""
    }
    text_lower = text.lower()
    for word, digit in number_map.items():
        text_lower = re.sub(rf'\b{word}\b', digit, text_lower)
    return text_lower

def extract_phone_numbers(text):
    phone_pattern = r'(?:\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}'
    cleaned_text = re.sub(r'[\.\-\/]', ' ', text)
    cleaned_text = re.sub(r'\s+', ' ', cleaned_text)
    matches = re.finditer(phone_pattern, cleaned_text)
    return [match.group().strip() for match in matches]

def extract_entities_with_ner(text):
    results = ner_pipeline(text)
    entities = {"PERSON": [], "LOCATION": [], "ORGANIZATION": []}
    for entity in results:
        ent_group = entity['entity_group']
        word = entity['word']
        if ent_group in entities:
            clean_word = word.replace('##', '').strip()
            if clean_word and len(clean_word) > 1:
                entities[ent_group].append(clean_word)
    return entities

def analyze_single_field(text):
    if not text or not text.strip():
        return {"phones": [], "locations": [], "persons": []}
    normalized = normalize_text_numbers(text)
    detected_phones = extract_phone_numbers(text)
    detected_phones.extend(extract_phone_numbers(normalized))
    final_phones = list(set([p.replace(" ", "") for p in detected_phones]))
    ner_results = extract_entities_with_ner(text)
    return {
        "phones": final_phones,
        "locations": list(set(ner_results["LOCATION"])),
        "persons": list(set(ner_results["PERSON"]))
    }

@app.get("/")
def home():
    return {"message": "API çalışıyor"}

@app.post("/car-detection-upload")
@limiter.limit("10/minute")
async def carDetectionUpload(request: Request, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = transform_224(img).unsqueeze(0).to(device)

        with torch.inference_mode():
            y_pred = carDetectionModel(img_tensor)
            y_logit = torch.argmax(y_pred, dim=1)
            
            embedding_tensor = carDetectionModel.get_embedding(img_tensor)
            embedding_list = embedding_tensor.squeeze().tolist()

        return {
            "prediction": car_detection_class_names[y_logit.item()] if car_detection_class_names else str(y_logit.item()),
            "prediction_percent": round(torch.max(torch.softmax(y_pred, dim=1)).item() * 100),
            "image_embedding": embedding_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/car-direction-detection-upload")
@limiter.limit("100/minute")
async def carDirectionDetectionUpload(request: Request, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = transform_224(img).unsqueeze(0).to(device)

        with torch.inference_mode():
            y_pred = carDirectionDetectionModel(img_tensor)
            y_logit = torch.argmax(y_pred, dim=1)

        return {
            "prediction": car_direction_detection_class_names[y_logit.item()] if car_direction_detection_class_names else str(y_logit.item()),
            "prediction_percent": round(torch.max(torch.softmax(y_pred, dim=1)).item() * 100)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/car-scratch-dent-detection-upload")
@limiter.limit("100/minute")
async def carScratchDentDetectionUpload(request: Request, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = transform_256(img).unsqueeze(0).to(device)
        
        with torch.inference_mode():
            y_pred = carScratchDentDetectionModel(img_tensor)
            probs = torch.softmax(y_pred, dim=1)[0]
            pred_class_idx = torch.argmax(probs).item()
            pred_class_name = car_scratch_dent_detection_class_names[pred_class_idx] if car_scratch_dent_detection_class_names else str(pred_class_idx)
            pred_percent = round(probs[pred_class_idx].item() * 100)

        return {
            "prediction": pred_class_name,
            "prediction_percent": pred_percent
        }
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

    data_dict = data.model_dump() if hasattr(data, "model_dump") else data.dict()
    df = pd.DataFrame([data_dict])
    
    if 'kilometer' not in df.columns or df['kilometer'].dropna().empty:
        df['kilometer'] = df['km'] if 'km' in df.columns else getattr(data, 'kilometer', getattr(data, 'km', 100000))
    if 'model_year' not in df.columns or df['model_year'].dropna().empty:
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

@app.post("/description-summarization")
@limiter.limit("50/minute")
def description_summarization(request: Request, body: SummaryRequest):
    clean_text = body.description
    clean_text = re.sub(r'(?i)\btramersiz\b', ' tramer kaydı bulunmamaktadır. ', clean_text)
    clean_text = re.sub(r'(?i)\bhatasız\b', ' hata, boya veya değişen parça yoktur. ', clean_text)
    clean_text = re.sub(r'(?i)\bboyasız\b', ' boya yoktur. ', clean_text)
    clean_text = re.sub(r'(?i)\bdeğişensiz\b', ' değişen parça yoktur. ', clean_text)
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    input_text = "profesyonel oto ekspertiz özeti oluştur: " + clean_text
    
    raw_summary = text_summarizer(
        input_text,
        min_length=50,           
        max_length=128,      
        length_penalty=1.0,      
        num_beams=4,             
        no_repeat_ngram_size=3,  
        repetition_penalty=1.15, 
        early_stopping=True      
    )[0]["summary_text"]

    summarizatedDesc = re.sub(r'<EXTRA_ID_\d+>', '', raw_summary, flags=re.IGNORECASE)
    summarizatedDesc = re.sub(r'\s+', ' ', summarizatedDesc).strip()
    summarizatedDesc = summarizatedDesc.lstrip(" ,.:;-")
    summarizatedDesc = re.sub(r'^(ve\s+|veya\s+|ile\s+)', '', summarizatedDesc, flags=re.IGNORECASE)
    summarizatedDesc = summarizatedDesc.lstrip(" ,.:;-").strip()

    if summarizatedDesc:
        summarizatedDesc = summarizatedDesc[0].upper() + summarizatedDesc[1:]

    description_summary_embedding = embedding_model.encode(summarizatedDesc).tolist()
    description_embedding = embedding_model.encode(clean_text).tolist()

    return {
        "summarizated_description": summarizatedDesc,
        "description_summary_embedding": description_summary_embedding,
        "description_embedding": description_embedding,
    }

@app.post("/search-similar-advert")
@limiter.limit("50/minute")
def search_similar_advert(request: Request, body: searchRequest):
    search_text = body.text 
    raw_embedding = embedding_model.encode(search_text).tolist()
    search_text_embedding = "[" + ",".join(map(str, raw_embedding)) + "]"
    
    conn = None
    try:
        if not DATABASE_URL:
            raise ValueError("DATABASE_URL ayarlanmamış! Lütfen .env dosyanı kontrol et.")
            
        conn = psycopg2.connect(DATABASE_URL)
        register_vector(conn)
        cur = conn.cursor()
        query = """
            SELECT 
                a.id, 
                a.title, 
                a.description, 
                ai.image_url, 
                a.description_summary_embedding <=> %s::vector AS distance
            FROM adverts a
            LEFT JOIN advert_images ai ON a.id = ai.advert_id AND ai.is_main = TRUE
            WHERE a.description_embedding IS NOT NULL
            ORDER BY distance ASC
            LIMIT 5;
        """
        cur.execute(query, (search_text_embedding,))
        results = cur.fetchall()
        similar_adverts = []
        for row in results:
            similar_adverts.append({
                "id": row[0],
                "title": row[1],
                "description": row[2],
                "image_src": row[3], 
                "distance": row[4]
            })
            
        return {"success": True, "results": similar_adverts}

    except Exception as e:
        print("Vektör Arama Hatası:", e)
        return {"success": False, "message": f"Arama sırasında bir hata oluştu: {str(e)}"}
        
    finally:
        if conn is not None:
            cur.close()
            conn.close()

@app.post("/validate-content")
@limiter.limit("50/minute")
def analyze_advertisement_payload(request: Request, payload: AdRequest):
    title_report = analyze_single_field(payload.title)
    description_report = analyze_single_field(payload.description)
    
    return {
        "status": "success",
        "errors_found": bool(title_report["phones"] or description_report["phones"]),
        "title_errors": title_report,
        "description_errors": description_report
    }