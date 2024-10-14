import React, { useRef, useEffect } from "react";

interface Props {
  mazeImage: ImageData;
  solution: number[][] | null;
  entrance: [number, number] | null;
  exit: [number, number] | null;
  onPointSelect: (point: [number, number], isEntrance: boolean) => void;
}

const MazeDisplay: React.FC<Props> = ({
  mazeImage,
  solution,
  entrance,
  exit,
  onPointSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.putImageData(mazeImage, 0, 0);

        if (solution) {
          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
          ctx.beginPath();
          solution.forEach(([y, x], index) => {
            if (index === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          });
          ctx.stroke();
        }

        if (entrance) {
          ctx.fillStyle = "green";
          ctx.beginPath();
          ctx.arc(entrance[1], entrance[0], 5, 0, 2 * Math.PI);
          ctx.fill();
        }

        if (exit) {
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(exit[1], exit[0], 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
    }
  }, [mazeImage, solution, entrance, exit]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      onPointSelect([Math.round(y), Math.round(x)], !entrance);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={mazeImage.width}
      height={mazeImage.height}
      onClick={handleCanvasClick}
    />
  );
};

export default MazeDisplay;
