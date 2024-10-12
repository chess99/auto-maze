import cv2
import numpy as np
from PIL import Image, ImageDraw
import matplotlib.pyplot as plt
import logging


class ImageProcessor:
    def __init__(self, image_path, debug=False):
        self.image_path = image_path
        self.image = None
        self.maze_array = None
        self.debug = debug

    def process_image(self):
        # Read the image
        img = cv2.imread(self.image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError(f"Unable to read image from {self.image_path}")

        logging.info(f"Image shape: {img.shape}")
        self.debug_show(img, "Original Image")

        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(img, (5, 5), 0)
        self.debug_show(blurred, "After Gaussian Blur")

        # Use adaptive thresholding to handle different lighting conditions
        binary = cv2.adaptiveThreshold(
            blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        self.debug_show(binary, "After Adaptive Thresholding")

        # Use morphological operations to clean up the image and make black areas larger
        kernel = np.ones((14, 14), np.uint8)
        eroded = cv2.erode(binary, kernel, iterations=1)
        self.debug_show(eroded, "After Erosion")

        # Find line width (cell size)
        row_transitions = np.sum(np.abs(np.diff(eroded, axis=1)), axis=1)
        col_transitions = np.sum(np.abs(np.diff(eroded, axis=0)), axis=0)

        row_line_width = np.median(np.diff(np.where(row_transitions > 0)[0]))
        col_line_width = np.median(np.diff(np.where(col_transitions > 0)[0]))

        cell_size = int((row_line_width + col_line_width) / 2)
        logging.info(f"Calculated cell size: {cell_size}")

        # Calculate the number of rows and columns
        height, width = eroded.shape
        rows = height // cell_size
        cols = width // cell_size

        logging.info(f"Maze dimensions: {rows} rows, {cols} columns")

        if rows == 0 or cols == 0:
            raise ValueError(
                f"Invalid maze dimensions: {rows}x{cols}. The cell size might be too large.")

        # Create the maze array
        self.maze_array = np.zeros((rows, cols), dtype=int)

        for i in range(rows):
            for j in range(cols):
                # Get the center point of each cell
                center_y = i * cell_size + cell_size // 2
                center_x = j * cell_size + cell_size // 2

                # Check the color at the center point
                if eroded[center_y, center_x] == 0:  # Black (obstacle)
                    self.maze_array[i, j] = 0
                else:  # White (path)
                    self.maze_array[i, j] = 1

        self.image = Image.fromarray(img)

        logging.info(f"Maze array shape: {self.maze_array.shape}")
        self.debug_show(self.maze_array, "Final Maze Array")
        return self.maze_array

    def debug_show(self, img, title):
        if self.debug:
            plt.figure(figsize=(10, 10))
            if len(img.shape) == 2 or img.shape[2] == 1:
                plt.imshow(img, cmap='gray')
            else:
                plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            plt.title(title)
            plt.axis('off')
            plt.show()

    def draw_solution(self, path):
        draw = ImageDraw.Draw(self.image)
        for i in range(len(path) - 1):
            start = path[i][1], path[i][0]
            end = path[i+1][1], path[i+1][0]
            draw.line([start, end], fill=128, width=2)

    def save_image(self, output_path):
        self.image.save(output_path)

    def visualize_maze_array(self):
        plt.figure(figsize=(10, 10))
        plt.imshow(self.maze_array, cmap='binary')
        plt.title('Parsed Maze Array')
        plt.axis('off')
        plt.show()

        # Display the original image for comparison
        plt.figure(figsize=(10, 10))
        plt.imshow(cv2.imread(self.image_path), cmap='gray')
        plt.title('Original Maze Image')
        plt.axis('off')
        plt.show()
