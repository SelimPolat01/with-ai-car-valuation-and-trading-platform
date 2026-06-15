import torch, torchvision, os
from torch import nn
from torchvision import datasets
from CNNs.car_detection_cnn import CarDetectionCNN
from train import train
from pathlib import Path

if __name__ == "__main__":
    LEARNING_RATE = 0.001
    EPOCHS = 125
    BATCH_SIZE = 64
    LABEL_SMOOTHING = 0.02
    WEIGHT_DECAY = 0.001
    NUM_WORKERS = 8
    SEED = 42    
    SAVE_PATH = "models/car_detection/car_detection_cnn_best_model.pth"


    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")   

    Path("models").mkdir(parents=True,
                        exist_ok=True)

    train_transforms = torchvision.transforms.Compose([
        torchvision.transforms.Resize((224, 224)),
        torchvision.transforms.TrivialAugmentWide(),
        torchvision.transforms.RandomHorizontalFlip(p=0.5),
        # # torchvision.transforms.RandomRotation(15),
        torchvision.transforms.ColorJitter(
            brightness=0.1,
            contrast=0.1,
            saturation=0.1,
            hue=0.05
        ),
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                        std=[0.229, 0.224, 0.225])
    ])

    test_transforms = torchvision.transforms.Compose([
        torchvision.transforms.Resize(size=(224, 224)),
        # torchvision.transforms.CenterCrop(size=(224, 224)),
        torchvision.transforms.ToTensor(),
        torchvision.transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                        std=[0.229, 0.224, 0.225])
    ])

    # train_data = datasets.Food101(root=".",
    #                               transform=train_transforms,
    #                               split="train",
    #                               download=False)
    
    # test_data = datasets.Food101(root=".",
    #                              transform=test_transforms,
    #                              split="test",
    #                              download=False)

    train_data = datasets.ImageFolder(root="./cars/train",
                                    transform=train_transforms
                                    )

    test_data = datasets.ImageFolder(root="./cars/test",
                                    transform=test_transforms)

    class_names = train_data.classes

    train_dataloader = torch.utils.data.DataLoader(dataset=train_data,
                                                batch_size=BATCH_SIZE,
                                                shuffle=True,
                                                num_workers=NUM_WORKERS,
                                                persistent_workers=True,
                                                pin_memory=True)

    test_dataloader = torch.utils.data.DataLoader(dataset=test_data,
                                                batch_size=BATCH_SIZE,
                                                shuffle=False,
                                                num_workers=NUM_WORKERS,
                                                persistent_workers=True,
                                                pin_memory=True)

    torch.manual_seed(SEED)
    torch.cuda.manual_seed(SEED)

    car_detection_cnn_model = CarDetectionCNN(input_shape=3,
                    hidden_units_1=16,
                    hidden_units_2=32,
                    hidden_units_3=64,
                    hidden_units_4=128,
                    hidden_units_5=256,
                    hidden_units_6=512,
                    output_shape=len(class_names))
    
    car_detection_cnn_model = car_detection_cnn_model.to(device)
    car_detection_cnn_model = torch.compile(car_detection_cnn_model, mode="reduce-overhead")

    loss_fn = nn.CrossEntropyLoss(label_smoothing=LABEL_SMOOTHING)
    optimizer = torch.optim.AdamW(params=car_detection_cnn_model.parameters(),
                                lr=LEARNING_RATE,
                                weight_decay=WEIGHT_DECAY)
    
    # scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="min",
        factor=0.5,
        patience=5,
        min_lr=0.000001,
    )

    # scheduler = torch.optim.lr_scheduler.StepLR(optimizer=optimizer, step_size=15, gamma=0.5)

    train_results = train(model=car_detection_cnn_model,
                        train_dataloader=train_dataloader,
                        test_dataloader=test_dataloader,
                        loss_fn=loss_fn,
                        optimizer=optimizer,
                        scheduler=scheduler,
                        epochs=EPOCHS,
                        device=device,
                        save_path=SAVE_PATH)
    
    BEST_ACC = max(train_results["test_acc"])
    final_model_name = f"models/car_detection/car_detection_cnn_model_23_epoch{EPOCHS}_acc{int(BEST_ACC * 100)}.pth"

    if os.path.exists(SAVE_PATH):   
        if os.path.exists(final_model_name):
            os.remove(final_model_name)
            print(f"[BİLGİ] Eski {final_model_name} dosyası silindi.")
            
        os.rename(SAVE_PATH, final_model_name)
        print(f"[BAŞARILI] Gerçek en yüksek skorlu model kaydedildi: {final_model_name}")
    