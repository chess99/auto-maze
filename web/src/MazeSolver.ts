export class MazeSolver {
  private maze: number[][];
  private start: [number, number];
  private end: [number, number];

  constructor(
    maze: number[][],
    start: [number, number],
    end: [number, number]
  ) {
    this.maze = maze;
    this.start = start;
    this.end = end;
  }

  solve(): number[][] {
    // 这里实现 A* 算法
    // 为简单起见，这里返回一个虚拟路径
    return [this.start, this.end];
  }
}
