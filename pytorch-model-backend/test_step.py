import torch
from typing import Tuple
from tqdm.auto import tqdm

def test_step(model:torch.nn.Module,
            dataloader:torch.utils.data.DataLoader,
            loss_fn:torch.nn.Module,
            device:torch.device=None) -> Tuple[float, float]:
        
    if device is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"

    model.eval()

    test_loss, test_acc = 0, 0
    with torch.inference_mode():
        for X, y in tqdm(dataloader, desc="Testing Batches", leave=False):
            X, y = X.to(device), y.to(device)
            y_pred = model(X)

            loss = loss_fn(y_pred, y)
            test_loss += loss.item()

            test_label = torch.argmax(y_pred, dim=1)
            test_acc += (test_label == y).sum().item() / len(y_pred)
            
    test_loss = test_loss / len(dataloader)
    test_acc = test_acc / len(dataloader)

    return test_loss, test_acc