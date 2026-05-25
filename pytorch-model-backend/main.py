import torch, torchvision, os
import io
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from car_detection_cnn import CarDetectionCNN
from car_direction_detection_cnn import CarDirectionDetectionCNN
from PIL import Image

app = FastAPI()
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
            output_shape=122).to(device)

carDirectionDetectionModel = CarDirectionDetectionCNN(input_shape=3,
                                                      hidden_units_1=32,
                                                      hidden_units_2=64,
                                                      hidden_units_3=128,
                                                      hidden_units_4=256,
                                                      output_shape=4).to(device)

transform = torchvision.transforms.Compose([
torchvision.transforms.Resize(size=(224, 224)),
torchvision.transforms.ToTensor(),
torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225])
])

car_detection_data = torchvision.datasets.ImageFolder(root="./cars/train",
                                               transform=transform)

car_direction_detection_data = torchvision.datasets.ImageFolder(root="./directions/train",
                                                                transform=transform)

car_detection_class_names = car_detection_data.classes
car_detection_state_dict = torch.load("models/car_detection/car_detection_cnn_model_19_epoch100_acc90.pth", map_location=device, weights_only=True)
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

@app.get("/")
def home():
    return {"message": "API çalışıyor"}

@app.post("/car-detection-upload")
async def carDetectionUpload(file: UploadFile = File(...)):
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
async def carDirectionDetectionUpload(file: UploadFile = File(...)):
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