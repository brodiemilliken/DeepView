import numpy as np

def calculate_initial_grids(weights):
    grid_size = 28
    initial_grids = []

    # Calculate the grid for each neuron in the first layer
    for neuron_weights in weights[0]:
        grid = []
        for i in range(grid_size):
            for j in range(grid_size):
                weight = neuron_weights[i * grid_size + j]
                grid.append(weight)

        # Normalize the grid
        max_grid_value = max(map(abs, grid))
        if max_grid_value > 0:
            grid = [w / max_grid_value for w in grid]

        initial_grids.append(grid)

    return initial_grids

def calculate_layer_grids(weights, initial_grids):
    grid_size = 28
    layer_grids = [initial_grids]

    # Calculate the grids for each layer
    for layer_index in range(1, len(weights)):
        prev_layer_grids = layer_grids[layer_index - 1]
        current_layer_grids = []
        num_neurons_in_layer = len(weights[layer_index])

        for neuron_weights in weights[layer_index]:
            grid = np.zeros(grid_size * grid_size)

            for weight, prev_neuron_index in zip(neuron_weights, range(len(neuron_weights))):
                prev_layer_grid = prev_layer_grids[prev_neuron_index]
                grid += np.array(prev_layer_grid) * weight

            # Normalize the grid
            max_grid_value = max(map(abs, grid))
            if max_grid_value > 0:
                grid = [w / max_grid_value for w in grid]

            current_layer_grids.append(grid)

        layer_grids.append(current_layer_grids)

    return layer_grids

def calculate_grids(weights):
    initial_grids = calculate_initial_grids(weights)
    layer_grids = calculate_layer_grids(weights, initial_grids)
    return initial_grids, layer_grids
