import argparse
from image_processor import ImageProcessor
from maze_solver import MazeSolver
import logging

# 设置日志级别
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    parser = argparse.ArgumentParser(description="Maze Image Analyzer and Solver")
    parser.add_argument("-i", "--input", required=True, help="Input maze image file path")
    parser.add_argument("-o", "--output", default="solved_maze.png", help="Output solved maze image file path")
    parser.add_argument("--debug", action="store_true", help="Enable debug mode")
    args = parser.parse_args()

    try:
        logging.info(f"Processing input image: {args.input}")
        # Process the image
        image_processor = ImageProcessor(args.input, debug=args.debug)
        maze_array = image_processor.process_image()
        logging.debug(f"Maze array shape: {maze_array.shape}")

        # Solve the maze
        logging.info("Starting maze solving process")
        maze_solver = MazeSolver(maze_array)
        start = (0, 0)
        end = (maze_array.shape[0] - 1, maze_array.shape[1] - 1)
        logging.debug(f"Start point: {start}, End point: {end}")
        path = maze_solver.solve(start, end)

        if path is None:
            logging.warning("No valid path found in the maze.")
            return

        logging.info(f"Path found with {len(path)} steps")

        # Draw the solution
        logging.info("Drawing solution on the image")
        image_processor.draw_solution(path)
        image_processor.save_image(args.output)

        logging.info(f"Maze solved! Solution saved to {args.output}")
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}", exc_info=True)

if __name__ == "__main__":
    main()
