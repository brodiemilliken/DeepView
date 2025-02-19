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
        prev_dim = input_dim
        
        # Create a linear layer for each entry in layer_sizes
        for size in layer_sizes:
            self.layers.append(nn.Linear(prev_dim, size))
            prev_dim = size
        
        # Add the output layer with the specified number of neurons
        self.layers.append(nn.Linear(prev_dim, output_dim))

    def forward(self, x):
        # Flatten the input (assuming x has shape [batch_size, channels, height, width])
        x = x.view(x.size(0), -1)
        # Process all layers: use ReLU for hidden layers
        for layer in self.layers[:-1]:
            x = F.relu(layer(x))
        # Apply the output layer
        x = self.layers[-1](x)
        return x
