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
            nn.LeakyReLU(negative_slope=0.1),
            nn.Conv2d(in_channels=hidden_units_1, out_channels=hidden_units_1, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_1),
            nn.LeakyReLU(negative_slope=0.1),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.conv_block_2 = nn.Sequential(
            nn.Conv2d(in_channels=hidden_units_1, out_channels=hidden_units_2, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_2),
            nn.LeakyReLU(negative_slope=0.1),
            nn.Conv2d(in_channels=hidden_units_2, out_channels=hidden_units_2, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_2),
            nn.LeakyReLU(negative_slope=0.1),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.conv_block_3 = nn.Sequential(
            nn.Conv2d(in_channels=hidden_units_2, out_channels=hidden_units_3, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_3),
            nn.LeakyReLU(negative_slope=0.1),
            nn.Conv2d(in_channels=hidden_units_3, out_channels=hidden_units_3, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_3),
            nn.LeakyReLU(negative_slope=0.1),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.conv_block_4 = nn.Sequential(
            nn.Conv2d(in_channels=hidden_units_3, out_channels=hidden_units_4, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_4),
            nn.LeakyReLU(negative_slope=0.1),
            nn.Conv2d(in_channels=hidden_units_4, out_channels=hidden_units_4, kernel_size=3, stride=1, padding=1),
            nn.BatchNorm2d(hidden_units_4),
            nn.LeakyReLU(negative_slope=0.1),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )

        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),            
            nn.Flatten(),
            nn.Linear(in_features=hidden_units_4, out_features=128),
            nn.BatchNorm1d(128),
            nn.LeakyReLU(negative_slope=0.1),
            nn.Dropout(p=0.4), 
            nn.Linear(in_features=128, out_features=output_shape)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.conv_block_1(x)
        x = self.conv_block_2(x)
        x = self.conv_block_3(x)
        x = self.conv_block_4(x)
        x = self.classifier(x)
        return x