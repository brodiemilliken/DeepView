import torch
import torch.nn as nn
import torch.nn.functional as F

class DynamicNet(nn.Module):
    def __init__(self, layer_sizes, input_dim=784, output_dim=10):
        """
        Initialize a dynamic neural network.
        
        Parameters:
        - layer_sizes: List of integers representing the number of neurons in each layer.
                       For example, [128, 64] means two hidden layers (128 and 64 neurons)
                       followed by an output layer with 10 neurons.
        - input_dim: The dimensionality of the input (default is 784 for flattened 28x28 images).
        - output_dim: The number of neurons in the output layer (default is 10 for MNIST).
        """
        super(DynamicNet, self).__init__()
        self.layers = nn.ModuleList()
        self.batch_norms = nn.ModuleList()
        prev_dim = input_dim
        
        # Create a linear layer and batch normalization for each entry in layer_sizes
        for size in layer_sizes:
            self.layers.append(nn.Linear(prev_dim, size))
            self.batch_norms.append(nn.BatchNorm1d(size))
            prev_dim = size
        
        # Add the output layer with the specified number of neurons
        self.layers.append(nn.Linear(prev_dim, output_dim))
        
        # Initialize weights
        self._initialize_weights()

    def _initialize_weights(self):
        for layer in self.layers:
            if isinstance(layer, nn.Linear):
                nn.init.kaiming_normal_(layer.weight, nonlinearity='relu')
                if layer.bias is not None:
                    nn.init.constant_(layer.bias, 0)

    def forward(self, x):
        # Flatten the input (assuming x has shape [batch_size, channels, height, width])
        x = x.view(x.size(0), -1)
        # Process all layers: use ReLU and batch normalization for hidden layers
        for layer, batch_norm in zip(self.layers[:-1], self.batch_norms):
            x = F.relu(batch_norm(layer(x)))
        # Apply the output layer
        x = self.layers[-1](x)
        return x
