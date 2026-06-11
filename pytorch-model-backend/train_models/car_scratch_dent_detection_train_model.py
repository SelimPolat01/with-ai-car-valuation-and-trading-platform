import torch, torchvision, os
from pathlib import Path
from CNNs.car_scratch_dent_detection_cnn import CarScratchDentDetectionCNN
from train import train 

if __name__ == "__main__":
    LEARNING_RATE = 0.0002
    EPOCHS = 100
    BATCH_SIZE = 32 
    LABEL_SMOOTHING = 0.05
    WEIGHT_DECAY = 0.01
    NUM_WORKERS = 8
    SEED = 42
    SAVE_PATH = "models/car_scratch_dent_detection/car_scratch_dent_detection_cnn_best_model.pth"

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Eğitim şu cihazda yapılıyor: {device}")

    Path("models").mkdir(parents=True, exist_ok=True)
    
    train_transforms = torchvision.transforms.Compose([
        torchvision.transforms.Resize((256, 256)), 
        torchvision.transforms.RandomAffine(degrees=15, scale=(0.85, 1.1)),
        torchvision.transforms.RandomHorizontalFlip(p=0.5),
        torchvision.transforms.ColorJitter(brightness=0.05, contrast=0.05, saturation=0.05),
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    test_transforms = torchvision.transforms.Compose([
        torchvision.transforms.Resize((256, 256)),
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    train_data = torchvision.datasets.ImageFolder(root="./damages/train", transform=train_transforms)
    test_data = torchvision.datasets.ImageFolder(root="./damages/test", transform=test_transforms)
    
    class_names = train_data.classes
    print(f"Sınıflar: {class_names}")

    train_dataloader = torch.utils.data.DataLoader(
        dataset=train_data,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
        persistent_workers=True,
        pin_memory=True,
    )

    test_dataloader = torch.utils.data.DataLoader(
        dataset=test_data,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
        persistent_workers=True,
        pin_memory=True
    )

    torch.cuda.manual_seed(SEED)
    torch.manual_seed(SEED)
    
    car_scratch_dent_detection_cnn = CarScratchDentDetectionCNN(
        input_shape=3,
        hidden_units_1=32,
        hidden_units_2=64,
        hidden_units_3=128,
        hidden_units_4=256, 
        output_shape=len(class_names)
    )
    
    car_scratch_dent_detection_cnn = car_scratch_dent_detection_cnn.to(device)

    loss_fn = torch.nn.CrossEntropyLoss(label_smoothing=LABEL_SMOOTHING)
    
    optimizer = torch.optim.AdamW(
        params=car_scratch_dent_detection_cnn.parameters(), 
        lr=LEARNING_RATE,
        weight_decay=WEIGHT_DECAY
    )
    
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, 
        mode="min",
        factor=0.5,
        patience=5,
        min_lr=0.000001
    )

    train_results = train(
        model=car_scratch_dent_detection_cnn,
        train_dataloader=train_dataloader,
        test_dataloader=test_dataloader,
        loss_fn=loss_fn,
        optimizer=optimizer,
        epochs=EPOCHS,
        device=device,
        scheduler=scheduler,
        save_path=SAVE_PATH
    )
    
    BEST_ACC = max(train_results["test_acc"])
    final_model_name = f"models/car_scratch_dent_detection/car_scratch_dent_detection_cnn_model_9_epoch{EPOCHS}_acc{int(BEST_ACC * 100)}.pth"

    if os.path.exists(SAVE_PATH):   
        if os.path.exists(final_model_name):
            os.remove(final_model_name)
            print(f"[BİLGİ] Eski {final_model_name} dosyası silindi.")
            
        os.rename(SAVE_PATH, final_model_name)
        print(f"[BAŞARILI] Gerçek en yüksek skorlu model kaydedildi: {final_model_name}")