import React, { useRef, useEffect, useState } from "react";

interface Props {
  mazeImage: ImageData;
  solution: number[][] | null;
  entrance: [number, number] | null;
  exit: [number, number] | null;
  onPointSelect: (point: [number, number], isEntrance: boolean) => void;
  croppedArea: { x: number; y: number; width: number; height: number } | null;
}

const MazeDisplay: React.FC<Props> = ({
  mazeImage,
  solution,
  entrance,
  exit,
  onPointSelect,
  croppedArea,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectingEntrance, setSelectingEntrance] = useState<boolean>(true);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    const drawMaze = async () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          // Calculate scale to fit the image within 800x600 area
          const maxWidth = 800;
          const maxHeight = 600;
          const scaleX = maxWidth / (croppedArea?.width || mazeImage.width);
          const scaleY = maxHeight / (croppedArea?.height || mazeImage.height);
          const newScale = Math.min(scaleX, scaleY, 1);
          setScale(newScale);

          canvas.width = (croppedArea?.width || mazeImage.width) * newScale;
          canvas.height = (croppedArea?.height || mazeImage.height) * newScale;

          // Clear the canvas before redrawing
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const imageBitmap = await createImageBitmap(mazeImage);

          // Draw the cropped image
          if (croppedArea) {
            ctx.drawImage(
              imageBitmap,
              croppedArea.x,
              croppedArea.y,
              croppedArea.width,
              croppedArea.height,
              0,
              0,
              canvas.width,
              canvas.height
            );
          } else {
            ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
          }

          if (solution) {
            ctx.strokeStyle = "green";
            ctx.lineWidth = 2;
            ctx.beginPath();
            solution.forEach(([y, x]: [number, number], index: number) => {
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
            ctx.fillStyle = "green";
            ctx.beginPath();
            ctx.arc(
              entrance[1] * newScale,
              entrance[0] * newScale,
              5,
              0,
              2 * Math.PI
            );
            ctx.fill();
          }

          if (exit) {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(exit[1] * newScale, exit[0] * newScale, 5, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
    };

    drawMaze();
  }, [mazeImage, solution, entrance, exit, croppedArea]);

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
