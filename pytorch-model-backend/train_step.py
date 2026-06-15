import torch
from typing import Tuple
from tqdm.auto import tqdm

def train_step(model:torch.nn.Module,
            dataloader:torch.utils.data.DataLoader,
            loss_fn:torch.nn.Module,
            optimizer:torch.optim.Optimizer,
            scaler:torch.amp.GradScaler,
            device:torch.device=None) -> Tuple[float, float]:
    
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    model.train()

    train_loss, train_acc = 0, 0

    for X, y in tqdm(dataloader, desc="Training Batches", leave=False):
        X, y = X.to(device), y.to(device)

        with torch.amp.autocast(device_type="cuda"):
            y_pred = model(X)
            loss = loss_fn(y_pred, y)

        train_loss += loss.item()

        optimizer.zero_grad(set_to_none=True)
        scaler.scale(loss).backward()
        scaler.step(optimizer)
        scaler.update()

        y_pred_class = torch.argmax(y_pred, dim=1)
        train_acc += (y_pred_class == y).sum().item() / len(y_pred)
        
    train_loss = train_loss / len(dataloader)
    train_acc = train_acc / len(dataloader)

    return train_loss, train_acc