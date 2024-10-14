import cv from "@techstark/opencv-js";

export class ImageProcessor {
  private image: cv.Mat;
  private mazeArray: number[][];
  private entrance: [number, number];
  private exit: [number, number];
  private cropInfo: [number, number, number, number];

  constructor(imageData: ImageData) {
    this.image = cv.matFromImageData(imageData);
    this.mazeArray = [];
    this.entrance = [0, 0];
    this.exit = [0, 0];
    this.cropInfo = [0, 0, 0, 0];
  }

  processImage(): number[][] {
    const gray = new cv.Mat();
    cv.cvtColor(this.image, gray, cv.COLOR_RGBA2GRAY);

    const binary = new cv.Mat();
    cv.threshold(gray, binary, 128, 255, cv.THRESH_BINARY);

    this.cropInfo = this.findMazeBoundaries(binary);
    const [top, bottom, left, right] = this.cropInfo;

    const rect = new cv.Rect(left, top, right - left + 1, bottom - top + 1);
    const cropped = binary.roi(rect);

    this.mazeArray = this.createMazeArray(cropped);
    this.findEntranceExit();

    gray.delete();
    binary.delete();
    cropped.delete();

    return this.mazeArray;
  }

  private findMazeBoundaries(binary: cv.Mat): [number, number, number, number] {
    const cols = binary.cols;
    const rows = binary.rows;
    let top = 0,
      bottom = rows - 1,
      left = 0,
      right = cols - 1;

    const minWallRatio = 0.01;

    // Find top
    for (let i = 0; i < rows; i++) {
      const rowData = binary.row(i).data32F;
      if (rowData.filter((val) => val === 0).length / cols >= minWallRatio) {
        top = i;
        break;
      }
    }

    // Find bottom
    for (let i = rows - 1; i >= 0; i--) {
      const rowData = binary.row(i).data32F;
      if (rowData.filter((val) => val === 0).length / cols >= minWallRatio) {
        bottom = i;
        break;
      }
    }

    // Find left
    for (let j = 0; j < cols; j++) {
      const colData = binary.col(j).data32F;
      if (colData.filter((val) => val === 0).length / rows >= minWallRatio) {
        left = j;
        break;
      }
    }

    // Find right
    for (let j = cols - 1; j >= 0; j--) {
      const colData = binary.col(j).data32F;
      if (colData.filter((val) => val === 0).length / rows >= minWallRatio) {
        right = j;
        break;
      }
    }

    return [top, bottom, left, right];
  }

  private createMazeArray(cropped: cv.Mat): number[][] {
    const rows = cropped.rows;
    const cols = cropped.cols;
    const maze = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      for (let j = 0; j < cols; j++) {
        row.push(cropped.ucharPtr(i, j)[0] === 255 ? 1 : 0);
      }
      maze.push(row);
    }

    return maze;
  }

  private findEntranceExit(): void {
    const rows = this.mazeArray.length;
    const cols = this.mazeArray[0].length;
    const openings: [number, number][] = [];

    // Check top and bottom rows
    for (let j = 0; j < cols; j++) {
      if (this.isValidOpening(0, j, "horizontal")) {
        openings.push([0, j]);
      }
      if (this.isValidOpening(rows - 1, j, "horizontal")) {
        openings.push([rows - 1, j]);
      }
    }

    // Check left and right columns
    for (let i = 0; i < rows; i++) {
      if (this.isValidOpening(i, 0, "vertical")) {
        openings.push([i, 0]);
      }
      if (this.isValidOpening(i, cols - 1, "vertical")) {
        openings.push([i, cols - 1]);
      }
    }

    if (openings.length < 2) {
      throw new Error(
        `Expected at least 2 openings, but found ${openings.length}`
      );
    }

    // Choose the two openings closest to opposite corners
    const corners: [number, number][] = [
      [0, 0],
      [0, cols - 1],
      [rows - 1, 0],
      [rows - 1, cols - 1],
    ];
    const distances = openings.map((opening) =>
      Math.min(
        ...corners.map((corner) =>
          Math.sqrt(
            Math.pow(opening[0] - corner[0], 2) +
              Math.pow(opening[1] - corner[1], 2)
          )
        )
      )
    );
    const sortedOpenings = openings
      .map((opening, index) => ({ opening, distance: distances[index] }))
      .sort((a, b) => a.distance - b.distance);

    this.entrance = sortedOpenings[0].opening;
    this.exit = sortedOpenings[sortedOpenings.length - 1].opening;
  }

  private isValidOpening(
    r: number,
    c: number,
    direction: "horizontal" | "vertical"
  ): boolean {
    const rows = this.mazeArray.length;
    const cols = this.mazeArray[0].length;

    if (direction === "horizontal") {
      if (
        c + 2 >= cols ||
        this.mazeArray[r][c] !== 1 ||
        this.mazeArray[r][c + 1] !== 1 ||
        this.mazeArray[r][c + 2] !== 1
      ) {
        return false;
      }
      return (
        (r + 1 < rows && this.mazeArray[r + 1][c + 1] === 1) ||
        (r > 0 && this.mazeArray[r - 1][c + 1] === 1)
      );
    } else {
      if (
        r + 2 >= rows ||
        this.mazeArray[r][c] !== 1 ||
        this.mazeArray[r + 1][c] !== 1 ||
        this.mazeArray[r + 2][c] !== 1
      ) {
        return false;
      }
      return (
        (c + 1 < cols && this.mazeArray[r + 1][c + 1] === 1) ||
        (c > 0 && this.mazeArray[r + 1][c - 1] === 1)
      );
    }
  }

  getEntrance(): [number, number] {
    return this.entrance;
  }

  getExit(): [number, number] {
    return this.exit;
  }

  getCropInfo(): [number, number, number, number] {
    return this.cropInfo;
  }
}
