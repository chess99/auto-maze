import { createImageData } from "../utils/imageUtils";

export const processImage = async (
  imageData: ImageData
): Promise<{
  mazeArray: number[][];
  entrance: [number, number];
  exit: [number, number];
  croppedArea: { x: number; y: number; width: number; height: number };
}> => {
  const croppedArea = await cropMazeArea(imageData);
  const mazeArray: number[][] = [];

  for (let y = 0; y < croppedArea.height; y++) {
    const row: number[] = [];
    for (let x = 0; x < croppedArea.width; x++) {
      const index =
        ((y + croppedArea.y) * imageData.width + (x + croppedArea.x)) * 4;
      const isWall = imageData.data[index] < 128; // Assuming grayscale image, walls are darker
      row.push(isWall ? 0 : 1);
    }
    mazeArray.push(row);
  }

  // Find entrance and exit
  const entrance = findEntrance(mazeArray);
  const exit = findExit(mazeArray);

  console.log("Cropped area:", croppedArea);
  console.log("Maze dimensions:", mazeArray.length, "x", mazeArray[0].length);
  console.log("Entrance:", entrance);
  console.log("Exit:", exit);

  return { mazeArray, entrance, exit, croppedArea };
};

export const cropMazeArea = async (
  imageData: ImageData
): Promise<{ x: number; y: number; width: number; height: number }> => {
  const { width, height, data } = imageData;
  let minX = width,
    minY = height,
    maxX = 0,
    maxY = 0;

  const threshold = 128; // Threshold for determining wall pixels
  const minWallRatio = 0.01; // Minimum ratio of wall pixels in a row/column to be considered part of the maze

  // Find the bounding box of the maze
  for (let y = 0; y < height; y++) {
    let wallCount = 0;
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      if (data[index] < threshold) {
        wallCount++;
      }
    }
    if (wallCount / width >= minWallRatio) {
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }

  for (let x = 0; x < width; x++) {
    let wallCount = 0;
    for (let y = minY; y <= maxY; y++) {
      const index = (y * width + x) * 4;
      if (data[index] < threshold) {
        wallCount++;
      }
    }
    if (wallCount / (maxY - minY + 1) >= minWallRatio) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }

  // Add a small padding
  const padding = 5;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
};

const findEntrance = (maze: number[][]): [number, number] => {
  for (let x = 0; x < maze[0].length; x++) {
    if (maze[0][x] === 1) {
      return [0, x];
    }
  }
  return [0, 0]; // Default to top-left if no entrance found
};

const findExit = (maze: number[][]): [number, number] => {
  const lastRow = maze.length - 1;
  for (let x = 0; x < maze[0].length; x++) {
    if (maze[lastRow][x] === 1) {
      return [lastRow, x];
    }
  }
  return [lastRow, maze[0].length - 1]; // Default to bottom-right if no exit found
};
