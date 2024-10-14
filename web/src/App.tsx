import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import MazeDisplay from "./components/MazeDisplay";
import ControlPanel from "./components/ControlPanel";
import { processImage } from "./services/imageProcessor";
import { solveMaze } from "./services/mazeSolver";

const App: React.FC = () => {
  const [mazeImage, setMazeImage] = useState<ImageData | null>(null);
  const [mazeArray, setMazeArray] = useState<number[][] | null>(null);
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [entrance, setEntrance] = useState<[number, number] | null>(null);
  const [exit, setExit] = useState<[number, number] | null>(null);

  const handleImageUpload = async (file: File) => {
    const imageData = await createImageData(file);
    setMazeImage(imageData);
    const { mazeArray, entrance, exit } = await processImage(imageData);
    setMazeArray(mazeArray);
    setEntrance(entrance);
    setExit(exit);
  };

  const handleSolveMaze = () => {
    if (mazeArray && entrance && exit) {
      const path = solveMaze(mazeArray, entrance, exit);
      setSolution(path);
    }
  };

  const handleManualSelection = (
    point: [number, number],
    isEntrance: boolean
  ) => {
    if (isEntrance) {
      setEntrance(point);
    } else {
      setExit(point);
    }
  };

  return (
    <div>
      <h1>Maze Solver Web</h1>
      <ImageUploader onUpload={handleImageUpload} />
      {mazeImage && (
        <>
          <MazeDisplay
            mazeImage={mazeImage}
            solution={solution}
            entrance={entrance}
            exit={exit}
            onPointSelect={handleManualSelection}
          />
          <ControlPanel
            onSolve={handleSolveMaze}
            hasImage={!!mazeImage}
            hasSolution={!!solution}
          />
        </>
      )}
    </div>
  );
};

export default App;
