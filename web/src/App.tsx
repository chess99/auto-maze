import React, { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import MazeDisplay from "./components/MazeDisplay";
import ControlPanel from "./components/ControlPanel";
import { processImage } from "./services/imageProcessor";
import { solveMaze } from "./services/mazeSolver";
import { createImageData } from "./utils/imageUtils";

const App: React.FC = () => {
  const [mazeImage, setMazeImage] = useState<ImageData | null>(null);
  const [mazeArray, setMazeArray] = useState<number[][] | null>(null);
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [entrance, setEntrance] = useState<[number, number] | null>(null);
  const [exit, setExit] = useState<[number, number] | null>(null);
  const [croppedArea, setCroppedArea] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");

  const handleImageUpload = async (file: File) => {
    setProcessing(true);
    setStatus("Processing image...");
    const imageData = await createImageData(file);
    setMazeImage(imageData);
    const { mazeArray, entrance, exit, croppedArea } = await processImage(
      imageData
    );
    setMazeArray(mazeArray);
    setEntrance(entrance);
    setExit(exit);
    setCroppedArea(croppedArea);
    setSolution(null);
    setProcessing(false);
    setStatus("");
  };

  const handleSolveMaze = async () => {
    if (mazeArray && entrance && exit) {
      setProcessing(true);
      setStatus("Solving maze...");
      let dotCount = 0;
      const path = await solveMaze(mazeArray, entrance, exit, () => {
        dotCount = (dotCount + 1) % 4;
        setStatus(`Solving maze${".".repeat(dotCount)}`);
      });
      setSolution(path);
      setProcessing(false);
      setStatus(path.length > 0 ? "Maze solved!" : "No solution found.");
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
            croppedArea={croppedArea}
          />
          <ControlPanel
            onSolve={handleSolveMaze}
            hasImage={!!mazeImage}
            hasSolution={!!solution}
            entrance={entrance}
            exit={exit}
            processing={processing}
          />
          {status && <p>{status}</p>}
        </>
      )}
    </div>
  );
};

export default App;
