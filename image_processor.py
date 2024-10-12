import cv2
import numpy as np
from PIL import Image, ImageDraw

class ImageProcessor:
    def __init__(self, image_path):
        self.image_path = image_path
        self.image = None
        self.maze_array = None

    def process_image(self):
        # Read the image
        img = cv2.imread(self.image_path, cv2.IMREAD_GRAYSCALE)
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(img, (5, 5), 0)
        
        # Use adaptive thresholding to handle different lighting conditions
        binary = cv2.adaptiveThreshold(blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
        
        # Invert the binary image
        binary = cv2.bitwise_not(binary)
        
        # Use morphological operations to clean up the image
        kernel = np.ones((3,3), np.uint8)
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        
        # Convert to numpy array
        self.maze_array = np.array(binary) // 255
        
        # Treat any non-white pixel as a wall
        self.maze_array = (self.maze_array > 0.5).astype(int)
        
        self.image = Image.fromarray(img)
        
        return self.maze_array

    def draw_solution(self, path):
        draw = ImageDraw.Draw(self.image)
        for i in range(len(path) - 1):
            start = path[i][1], path[i][0]
            end = path[i+1][1], path[i+1][0]
            draw.line([start, end], fill=128, width=2)

    def save_image(self, output_path):
        self.image.save(output_path)
