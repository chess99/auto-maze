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
  const [croppedMazeImage, setCroppedMazeImage] = useState<ImageData | null>(
    null
  );

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
    setEntrance(null);
    setExit(null);
    setSolution(null);
    setCropInfo(imageProcessor.getCropInfo());
    setCroppedMazeImage(imageProcessor.getCroppedImage());

    setProcessing(false);
  };

  const handleSolveMaze = () => {
    if (mazeArray && entrance && exit) {
      setProcessing(true);
      const [cropTop, , cropLeft] = cropInfo || [0, 0, 0, 0];
      const adjustedEntrance: [number, number] = [
        entrance[0] - cropTop,
        entrance[1] - cropLeft,
      ];
      const adjustedExit: [number, number] = [
        exit[0] - cropTop,
        exit[1] - cropLeft,
      ];
      const solver = new MazeSolver(mazeArray, adjustedEntrance, adjustedExit);
      const path = solver.solve();
      if (path) {
        const adjustedPath = path.map(([y, x]) => [y + cropTop, x + cropLeft]);
        setSolution(adjustedPath);
      } else {
        console.error("No path found");
      }
      setProcessing(false);
    }
  };

  const handlePointSelect = (point: [number, number], isEntrance: boolean) => {
    if (cropInfo) {
      const [cropTop, , cropLeft] = cropInfo;
      const adjustedPoint: [number, number] = [
        point[0] + cropTop,
        point[1] + cropLeft,
      ];
      if (isEntrance) {
        setEntrance(adjustedPoint);
      } else {
        setExit(adjustedPoint);
      }
    }
  };

  return (
    <div>
      <h1>Maze Solver Web</h1>
      <ImageUploader onUpload={handleImageUpload} />
      {croppedMazeImage && (
        <>
          <MazeDisplay
            mazeImage={croppedMazeImage}
            solution={solution}
            entrance={entrance}
            exit={exit}
            cropInfo={cropInfo}
            onPointSelect={handlePointSelect}
          />
          <ControlPanel onSolve={handleSolveMaze} processing={processing} />
        </>
      )}
    </div>
  );
};

export default App;
