import numpy as np
from queue import PriorityQueue
import logging


class MazeSolver:
    def __init__(self, maze, entrance, exit):
        self.maze = maze
        self.rows, self.cols = maze.shape
        self.entrance = entrance
        self.exit = exit
        logging.debug(f"Maze shape: {self.rows}x{self.cols}")
        logging.debug(f"Entrance: {self.entrance}, Exit: {self.exit}")

    def heuristic(self, a, b):
        return np.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)

    def get_neighbors(self, node):
        neighbors = []
        for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
            nx, ny = node[0] + dx, node[1] + dy
            if 0 <= nx < self.rows and 0 <= ny < self.cols and self.maze[nx, ny] == 1:
                neighbors.append((nx, ny))
        return neighbors

    def solve(self):
        frontier = PriorityQueue()
        frontier.put((0, self.entrance))
        came_from = {self.entrance: None}
        cost_so_far = {self.entrance: 0}
        nodes_explored = 0

        while not frontier.empty():
            current = frontier.get()[1]
            nodes_explored += 1

            if nodes_explored % 1000 == 0:
                logging.debug(
                    f"Explored {nodes_explored} nodes. Current node: {current}")

            if current == self.exit:
                logging.info(
                    f"Path found! Total nodes explored: {nodes_explored}")
                break

            for next in self.get_neighbors(current):
                new_cost = cost_so_far[current] + 1
                if next not in cost_so_far or new_cost < cost_so_far[next]:
                    cost_so_far[next] = new_cost
                    priority = new_cost + self.heuristic(self.exit, next)
                    frontier.put((priority, next))
                    came_from[next] = current

        # Reconstruct path
        path = []
        current = self.exit
        while current and current != self.entrance:
            path.append(current)
            current = came_from.get(current)

        if current != self.entrance:
            logging.warning("No path found")
            return None  # No path found

        path.append(self.entrance)
        path.reverse()

        logging.info(f"Path length: {len(path)}")
        return path
