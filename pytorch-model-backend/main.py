import torch, torchvision, os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from cnn import CNN
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
model = CNN(input_shape=3,
            hidden_units_1=32,
            hidden_units_2=64,
            hidden_units_3=128,
            hidden_units_4=256,
            hidden_units_5=512,
            output_shape=101).to(device)

transform = torchvision.transforms.Compose([
torchvision.transforms.Resize(size=(224, 224)),
torchvision.transforms.ToTensor(),
torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                std=[0.229, 0.224, 0.225])
])

data = torchvision.datasets.ImageFolder(root="./food-101/images",
                                               transform=transform)

class_names = data.classes
state_dict = torch.load("models/cnn_model_13_epoch50_acc78.pth", map_location=device)
clean_state_dict = {
    k.replace("_orig_mod.", ""): v
 for k, v in state_dict.items()
}
model.load_state_dict(clean_state_dict, strict=False)
model.eval()

@app.get("/")
def home():
    return {"message": "API çalışıyor"}

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    contents = await file.read()
    with open(f"uploads/{file.filename}", "wb") as f:
       f.write(contents)

    img = Image.open(f"./uploads/{file.filename}").convert("RGB")
    img_tensor = transform(img).unsqueeze(0).to(device)

    with torch.inference_mode():
        y_pred = model(img_tensor)
        y_logit = torch.argmax(y_pred, dim=1)
    
    return {
        "prediction": class_names[y_logit.item()],
        "prediction_percent": round(torch.max(torch.softmax(y_pred, dim=1)).item() * 100)
    }