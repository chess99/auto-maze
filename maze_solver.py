import numpy as np
from queue import PriorityQueue
import logging

class MazeSolver:
    def __init__(self, maze):
        self.maze = maze
        self.rows, self.cols = maze.shape
        logging.debug(f"Maze shape: {self.rows}x{self.cols}")

    def heuristic(self, a, b):
        return np.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)

    def get_neighbors(self, node):
        neighbors = []
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = node[0] + dx, node[1] + dy
            if 0 <= nx < self.rows and 0 <= ny < self.cols and self.maze[nx, ny] == 1:
                neighbors.append((nx, ny))
        logging.debug(f"Neighbors of {node}: {neighbors}")
        return neighbors

    def solve(self, start, end):
        frontier = PriorityQueue()
        frontier.put((0, start))
        came_from = {start: None}
        cost_so_far = {start: 0}
        nodes_explored = 0

        while not frontier.empty():
            current = frontier.get()[1]
            nodes_explored += 1

            if nodes_explored % 1000 == 0:
                logging.debug(f"Explored {nodes_explored} nodes. Current node: {current}")

            if current == end:
                logging.info(f"Path found! Total nodes explored: {nodes_explored}")
                break

            for next in self.get_neighbors(current):
                new_cost = cost_so_far[current] + 1
                if next not in cost_so_far or new_cost < cost_so_far[next]:
                    cost_so_far[next] = new_cost
                    priority = new_cost + self.heuristic(end, next)
                    frontier.put((priority, next))
                    came_from[next] = current

        # Reconstruct path
        path = []
        current = end
        while current and current != start:
            path.append(current)
            current = came_from.get(current)
        
        if current != start:
            logging.warning("No path found")
            return None  # No path found
        
        path.append(start)
        path.reverse()

        logging.info(f"Path length: {len(path)}")
        return path
