import React, { useEffect, useRef, useState } from "react";

interface Props {
  mazeImage: ImageData;
  solution: number[][] | null;
  entrance: [number, number] | null;
  exit: [number, number] | null;
  cropInfo: [number, number, number, number] | null;
  onPointSelect: (point: [number, number], isEntrance: boolean) => void;
}

const MazeDisplay: React.FC<Props> = ({
  mazeImage,
  solution,
  entrance,
  exit,
  cropInfo,
  onPointSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectingEntrance, setSelectingEntrance] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    drawMaze();
  }, [mazeImage, solution, entrance, exit, cropInfo]);

  const drawMaze = async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const maxWidth = 800;
        const maxHeight = 600;
        const scaleX = maxWidth / mazeImage.width;
        const scaleY = maxHeight / mazeImage.height;
        const newScale = Math.min(scaleX, scaleY, 1);
        setScale(newScale);

        canvas.width = mazeImage.width * newScale;
        canvas.height = mazeImage.height * newScale;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const imageBitmap = await createImageBitmap(mazeImage);
        ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

        if (solution) {
          ctx.strokeStyle = "green";
          ctx.lineWidth = 2;
          ctx.beginPath();
          solution.forEach(([y, x], index) => {
            const scaledX = x * newScale;
            const scaledY = y * newScale;
            if (index === 0) {
              ctx.moveTo(scaledX, scaledY);
            } else {
              ctx.lineTo(scaledX, scaledY);
            }
          });
          ctx.stroke();
        }

        if (entrance) {
          drawPoint(ctx, entrance, "green", newScale);
        }

        if (exit) {
          drawPoint(ctx, exit, "red", newScale);
        }
      }
    }
  };

  const drawPoint = (
    ctx: CanvasRenderingContext2D,
    point: [number, number],
    color: string,
    scale: number
  ) => {
    const [y, x] = point;
    const [cropTop, , cropLeft] = cropInfo || [0, 0, 0, 0];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc((x - cropLeft) * scale, (y - cropTop) * scale, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const originalX = Math.round(x / scale);
      const originalY = Math.round(y / scale);
      onPointSelect([originalY, originalX], selectingEntrance);
      setSelectingEntrance(!selectingEntrance);
    }
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ border: "1px solid black" }}
      />
      <p>Click to select: {selectingEntrance ? "Entrance" : "Exit"}</p>
    </div>
  );
};

export default MazeDisplay;
