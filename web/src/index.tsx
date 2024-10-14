import cv from "@techstark/opencv-js";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";

const renderApp = () => {
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById("root")
  );
};

if (cv.Mat) {
  renderApp();
} else {
  cv.onRuntimeInitialized = renderApp;
}
