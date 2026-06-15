import torch
from tqdm.auto import tqdm
from train_step import train_step
from test_step import test_step

def train(model: torch.nn.Module,
          train_dataloader: torch.utils.data.DataLoader,
          test_dataloader: torch.utils.data.DataLoader,
          loss_fn: torch.nn.Module,
          optimizer: torch.optim.Optimizer,
          epochs: int,
          device: torch.device = None,
          scheduler = None,
          save_path: str = "models/car_direction_best_model.pth"):
          
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    torch.set_float32_matmul_precision("high")
    scaler = torch.amp.GradScaler()

    model.to(device)
    print("Model device:", next(model.parameters()).device)

    results = {"train_loss": [],
               "train_acc": [],
               "test_loss": [],
               "test_acc": []}

    best_test_acc = 0.0
    best_test_loss = float("inf")

    for epoch in tqdm(range(epochs), desc="Training Epochs"):
        train_loss, train_acc = train_step(model=model,
                                           dataloader=train_dataloader,
                                           loss_fn=loss_fn,
                                           optimizer=optimizer,
                                           scaler=scaler,
                                           device=device)
            
        test_loss, test_acc = test_step(model=model,
                                        dataloader=test_dataloader,
                                        loss_fn=loss_fn,
                                        device=device)

        if scheduler is not None:
            scheduler.step(test_loss)


        print(f"Epochs: {epoch + 1} | "
              f"train_loss: {train_loss:.4f} | "
              f"train_acc: {train_acc*100:.2f}% | "
              f"test_loss: {test_loss:.4f} | "
              f"test_acc: {test_acc*100:.2f}%")
            
        if (test_acc > best_test_acc) or (test_acc == best_test_acc and test_loss < best_test_loss):
            if test_acc == best_test_acc:
                print(f"-> Eşit doğruluk (%{test_acc*100:.2f}) ama daha düşük Loss ({test_loss:.4f} < {best_test_loss:.4f}) yakalandı! Model güncelleniyor...")
            else:
                print(f"-> Yeni en iyi skor yakalandı! (%{test_acc*100:.2f}). Model kaydediliyor...")

            best_test_acc = test_acc
            best_test_loss = test_loss
            
            raw_state_dict = model._orig_mod.state_dict() if hasattr(model, "_orig_mod") else model.state_dict()
            torch.save(obj=raw_state_dict, f=save_path)
            
        results["train_loss"].append(train_loss)
        results["train_acc"].append(train_acc)
        results["test_loss"].append(test_loss)
        results["test_acc"].append(test_acc)

    return results