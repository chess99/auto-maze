import cv from "@techstark/opencv-js";
import React, { useState } from "react";
import { ImageProcessor } from "./ImageProcessor";
import { MazeSolver } from "./MazeSolver";
import ControlPanel from "./components/ControlPanel";
import ImageUploader from "./components/ImageUploader";
import MazeDisplay from "./components/MazeDisplay";
import { createImageData } from "./utils/imageUtils";

const App: React.FC = () => {
  const [mazeImage, setMazeImage] = useState<ImageData | null>(null);
  const [mazeArray, setMazeArray] = useState<number[][] | null>(null);
  const [solution, setSolution] = useState<number[][] | null>(null);
  const [entrance, setEntrance] = useState<[number, number] | null>(null);
  const [exit, setExit] = useState<[number, number] | null>(null);
  const [cropInfo, setCropInfo] = useState<
    [number, number, number, number] | null
  >(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleImageUpload = async (file: File) => {
    setProcessing(true);
    const imageData = await createImageData(file);
    setMazeImage(imageData);

    await new Promise((resolve) => {
      if (cv.Mat) resolve(null);
      else cv.onRuntimeInitialized = () => resolve(null);
    });
    const imageProcessor = new ImageProcessor(imageData);
    const processedMaze = imageProcessor.processImage();
    setMazeArray(processedMaze);
    setEntrance(imageProcessor.getEntrance());
    setExit(imageProcessor.getExit());
    setCropInfo(imageProcessor.getCropInfo());

    setProcessing(false);
  };

  const handleSolveMaze = () => {
    if (mazeArray && entrance && exit) {
      setProcessing(true);
      const solver = new MazeSolver(mazeArray, entrance, exit);
      const path = solver.solve();
      if (path && cropInfo) {
        const adjustedPath = path.map(([y, x]) => [
          y + cropInfo[0],
          x + cropInfo[2],
        ]);
        setSolution(adjustedPath);
      } else {
        console.error("No path found");
      }
      setProcessing(false);
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
            cropInfo={cropInfo}
          />
          <ControlPanel onSolve={handleSolveMaze} processing={processing} />
        </>
      )}
    </div>
  );
};

export default App;
