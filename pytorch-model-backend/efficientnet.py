import torch, torchvision, os
from pathlib import Path
from torchvision import models
from train import train 

if __name__ == "__main__":
    LEARNING_RATE = 0.0003 
    EPOCHS = 30 
    BATCH_SIZE = 16 
    NUM_WORKERS = 8
    SEED = 42
    SAVE_PATH = "models/car_scratch_dent_detection/car_scratch_dent_detection_efficientnet_best.pth"

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Eğitim şu cihazda yapılıyor: {device}")

    Path("models/car_scratch_dent_detection").mkdir(parents=True, exist_ok=True)

    train_transforms = torchvision.transforms.Compose([
        torchvision.transforms.Resize((384, 384)),
        torchvision.transforms.RandomAffine(degrees=15, scale=(0.5, 1.0)),
        torchvision.transforms.RandomHorizontalFlip(p=0.5),
        torchvision.transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1, hue=0.05),
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_transforms = torchvision.transforms.Compose([
        torchvision.transforms.Resize((384, 384)),
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_data = torchvision.datasets.ImageFolder(root="./damages/train", transform=train_transforms)
    test_data = torchvision.datasets.ImageFolder(root="./damages/test", transform=test_transforms)
    
    class_names = train_data.classes
    print(f"Sınıflar: {class_names}")

    train_dataloader = torch.utils.data.DataLoader(
        dataset=train_data, batch_size=BATCH_SIZE, shuffle=True,
        num_workers=NUM_WORKERS, persistent_workers=True, pin_memory=True
    )

    test_dataloader = torch.utils.data.DataLoader(
        dataset=test_data, batch_size=BATCH_SIZE, shuffle=False,
        num_workers=NUM_WORKERS, persistent_workers=True, pin_memory=True
    )

    torch.cuda.manual_seed(SEED)
    torch.manual_seed(SEED)
    
    print("[BİLGİ] Pre-trained EfficientNet-B2 modeli yükleniyor...")
    weights = models.EfficientNet_B2_Weights.DEFAULT
    model = models.efficientnet_b2(weights=weights)

    model.classifier[1] = torch.nn.Linear(
        in_features=model.classifier[1].in_features, 
        out_features=len(class_names)
    )
    
    model = model.to(device)
    loss_fn = torch.nn.CrossEntropyLoss()
    optimizer = torch.optim.AdamW(params=model.parameters(), lr=LEARNING_RATE, weight_decay=0.01)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode="min", factor=0.5, patience=3, min_lr=0.000001
    )

    train_results = train(model=model,
                          train_dataloader=train_dataloader,
                          test_dataloader=test_dataloader,
                          loss_fn=loss_fn,
                          optimizer=optimizer,
                          epochs=EPOCHS,
                          device=device,
                          scheduler=scheduler,
                          save_path=SAVE_PATH)
    
    BEST_ACC = max(train_results["test_acc"])
    final_model_name = f"models/car_scratch_dent_detection/efficientnet_b2_epoch{EPOCHS}_acc{int(BEST_ACC * 100)}.pth"

    if os.path.exists(SAVE_PATH):   
        if os.path.exists(final_model_name):
            os.remove(final_model_name)
            
        os.rename(SAVE_PATH, final_model_name)
        print(f"[BAŞARILI] Yeni Transfer Learning modelin kaydedildi: {final_model_name}")