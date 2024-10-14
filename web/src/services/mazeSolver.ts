interface Node {
  x: number;
  y: number;
  f: number;
  g: number;
  h: number;
  parent: Node | null;
}

export const solveMaze = (
  maze: number[][],
  start: [number, number],
  end: [number, number],
  progressCallback: () => void
): number[][] => {
  const [startY, startX] = start;
  const [endY, endX] = end;
  const rows = maze.length;
  const cols = maze[0].length;

  const openList: Node[] = [];
  const closedList: boolean[][] = Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(false));

  const startNode: Node = {
    x: startX,
    y: startY,
    f: 0,
    g: 0,
    h: 0,
    parent: null,
  };

  openList.push(startNode);

  let iterationCount = 0;

  while (openList.length > 0) {
    let currentNode = openList[0];
    let currentIndex = 0;

    openList.forEach((node, index) => {
      if (node.f < currentNode.f) {
        currentNode = node;
        currentIndex = index;
      }
    });

    openList.splice(currentIndex, 1);
    closedList[currentNode.y][currentNode.x] = true;

    if (currentNode.x === endX && currentNode.y === endY) {
      const path: number[][] = [];
      let current: Node | null = currentNode;
      while (current !== null) {
        path.unshift([current.y, current.x]);
        current = current.parent;
      }
      return path;
    }

    const neighbors: Node[] = [];
    for (const [dx, dy] of [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ]) {
      const newX = currentNode.x + dx;
      const newY = currentNode.y + dy;

      if (
        newX >= 0 &&
        newX < cols &&
        newY >= 0 &&
        newY < rows &&
        maze[newY][newX] === 1 &&
        !closedList[newY][newX]
      ) {
        neighbors.push({
          x: newX,
          y: newY,
          f: 0,
          g: 0,
          h: 0,
          parent: currentNode,
        });
      }
    }

    for (const neighbor of neighbors) {
      if (closedList[neighbor.y][neighbor.x]) {
        continue;
      }

      neighbor.g = currentNode.g + 1;
      neighbor.h = Math.abs(neighbor.x - endX) + Math.abs(neighbor.y - endY);
      neighbor.f = neighbor.g + neighbor.h;

      if (
        !openList.some(
          (node) =>
            node.x === neighbor.x &&
            node.y === neighbor.y &&
            node.g <= neighbor.g
        )
      ) {
        openList.push(neighbor);
      }
    }

    iterationCount++;
    if (iterationCount % 1000 === 0) {
      progressCallback();
    }
  }

  return []; // No path found
};
