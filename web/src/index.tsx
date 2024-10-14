import cv from "@techstark/opencv-js";
import React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

cv.onRuntimeInitialized = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
};
