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
        self.entrance = None
        self.exit = None

    def process_image(self):
        # Read the image
        img = cv2.imread(self.image_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            raise ValueError(f"Unable to read image from {self.image_path}")

        logging.info(f"Image shape: {img.shape}")
        self.debug_show(img, "Original Image")

        # Apply simple thresholding
        _, binary = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY)
        self.debug_show(binary, "After Thresholding")

        # Find the maze boundaries
        rows, cols = binary.shape
        top = next(i for i in range(rows) if np.any(binary[i] == 0))
        bottom = next(i for i in range(rows-1, -1, -1)
                      if np.any(binary[i] == 0))
        left = next(j for j in range(cols) if np.any(binary[:, j] == 0))
        right = next(j for j in range(cols-1, -1, -1)
                     if np.any(binary[:, j] == 0))

        # Crop the image to the maze boundaries
        cropped = binary[top:bottom+1, left:right+1]
        self.debug_show(cropped, "Cropped Maze")

        # Find entrance and exit
        self.find_entrance_exit(cropped)

        # Create the maze array
        self.maze_array = (cropped == 255).astype(int)

        self.image = Image.fromarray(img)

        logging.info(f"Maze array shape: {self.maze_array.shape}")
        self.debug_show(self.maze_array, "Final Maze Array")
        self.original_shape = img.shape
        self.crop_info = (top, bottom, left, right)
        return self.maze_array

    def find_entrance_exit(self, binary):
        rows, cols = binary.shape
        openings = []

        # Function to check if an opening is valid
        def is_valid_opening(r, c, direction):
            if direction == 'horizontal':
                # Check if the opening is at least 3 pixels wide
                if c + 2 >= cols or binary[r, c] != 255 or binary[r, c+1] != 255 or binary[r, c+2] != 255:
                    return False
                # Check if it's connected to the maze (check the pixel below or above)
                return (r + 1 < rows and binary[r+1, c+1] == 255) or (r > 0 and binary[r-1, c+1] == 255)
            else:  # vertical
                if r + 2 >= rows or binary[r, c] != 255 or binary[r+1, c] != 255 or binary[r+2, c] != 255:
                    return False
                return (c + 1 < cols and binary[r+1, c+1] == 255) or (c > 0 and binary[r+1, c-1] == 255)

        # Check top and bottom rows
        for j in range(cols - 2):
            if is_valid_opening(0, j, 'horizontal'):
                openings.append((0, j))
            if is_valid_opening(rows-1, j, 'horizontal'):
                openings.append((rows-1, j))

        # Check left and right columns
        for i in range(rows - 2):
            if is_valid_opening(i, 0, 'vertical'):
                openings.append((i, 0))
            if is_valid_opening(i, cols-1, 'vertical'):
                openings.append((i, cols-1))

        if len(openings) < 2:
            raise ValueError(
                f"Expected at least 2 openings, but found {len(openings)}")

        # If we found more than 2 openings, choose the two closest to opposite corners
        if len(openings) > 2:
            logging.warning(
                f"Found {len(openings)} openings, expected 2. Choosing the two closest to opposite corners.")
            corners = [(0, 0), (0, cols-1), (rows-1, 0), (rows-1, cols-1)]
            distances = [min(np.linalg.norm(np.array(opening) - np.array(corner))
                             for corner in corners) for opening in openings]
            sorted_openings = [x for _, x in sorted(zip(distances, openings))]
            self.entrance, self.exit = sorted_openings[0], sorted_openings[-1]
        else:
            self.entrance, self.exit = openings

        logging.info(f"Entrance: {self.entrance}, Exit: {self.exit}")

        if self.debug:
            marked = cv2.cvtColor(binary, cv2.COLOR_GRAY2RGB)

            # 使用更大的圆形标记入口和出口
            circle_radius = 10  # 增加圆的半径
            circle_thickness = 3  # 增加圆的线条粗细

            # 绘制入口（绿色）
            cv2.circle(marked, (self.entrance[1], self.entrance[0]),
                       circle_radius, (0, 255, 0), circle_thickness)

            # 绘制出口（红色）
            cv2.circle(marked, (self.exit[1], self.exit[0]),
                       circle_radius, (0, 0, 255), circle_thickness)

            self.debug_show(marked, "Maze with Entrance and Exit")

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
        # 创建一个与原始图像大小相同的空白图像
        solution_image = Image.new(
            'RGB', (self.original_shape[1], self.original_shape[0]), color='white')
        draw = ImageDraw.Draw(solution_image)

        # 调整路径坐标以匹配原始图像
        adjusted_path = self.adjust_path_to_original(path)

        # 使用亮绿色绘制路径
        for i in range(len(adjusted_path) - 1):
            start = adjusted_path[i][1], adjusted_path[i][0]
            end = adjusted_path[i+1][1], adjusted_path[i+1][0]
            draw.line([start, end], fill=(0, 255, 0), width=2)  # 亮绿色

        # 将解决方案叠加到原始图像上
        self.image = Image.open(self.image_path).convert('RGB')
        self.image = Image.blend(self.image, solution_image, 0.5)

        # 展示最终结果
        plt.figure(figsize=(10, 10))
        plt.imshow(np.array(self.image))
        plt.title('Maze Solution')
        plt.axis('off')
        plt.show()

    def adjust_path_to_original(self, path):
        top, bottom, left, right = self.crop_info
        return [(y + top, x + left) for y, x in path]

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
