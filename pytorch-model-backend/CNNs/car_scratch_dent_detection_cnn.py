import torch
from torch import nn

class CarScratchDentDetectionCNN(nn.Module):
    def __init__(self,
                 input_shape: int,
                 hidden_units_1: int,
                 hidden_units_2: int,
                 hidden_units_3: int,
                 hidden_units_4: int,
                 output_shape: int) -> None:
        super().__init__()

        self.conv_block_1 = nn.Sequential(
            nn.Conv2d(in_channels=input_shape, out_channels=hidden_units_1, kernel_size=5, stride=1, padding=2),
            nn.BatchNorm2d(hidden_units_1),
            nn.ReLU(),
            nn.Conv2d(in_channels=hidden_units_1, out_channels=hidden_units_1, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.conv_block_2 = nn.Sequential(
            nn.Conv2d(in_channels=hidden_units_1, out_channels=hidden_units_2, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_2),
            nn.ReLU(),
            nn.Conv2d(in_channels=hidden_units_2, out_channels=hidden_units_2, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_2),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.conv_block_3 = nn.Sequential(
            nn.Conv2d(in_channels=hidden_units_2, out_channels=hidden_units_3, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_3),
            nn.ReLU(),
            nn.Conv2d(in_channels=hidden_units_3, out_channels=hidden_units_3, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_3),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.conv_block_4 = nn.Sequential(
            nn.Conv2d(in_channels=hidden_units_3, out_channels=hidden_units_4, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_4),
            nn.ReLU(),
            nn.Conv2d(in_channels=hidden_units_4, out_channels=hidden_units_4, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_4),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.classifier = nn.Sequential(
            nn.AdaptiveMaxPool2d((1, 1)),            
            nn.Flatten(),
            nn.Dropout(p=0.3, inplace=True), 
            nn.Linear(in_features=hidden_units_4, out_features=output_shape)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv_block_1(x)
        x = self.conv_block_2(x)
        x = self.conv_block_3(x)
        x = self.conv_block_4(x)
        x = self.classifier(x)
        return x