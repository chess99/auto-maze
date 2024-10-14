import React from "react";

interface Props {
  onSolve: () => void;
  hasImage: boolean;
  hasSolution: boolean;
}

const ControlPanel: React.FC<Props> = ({ onSolve, hasImage, hasSolution }) => {
  return (
    <div>
      <button onClick={onSolve} disabled={!hasImage || hasSolution}>
        Solve Maze
      </button>
    </div>
  );
};

export default ControlPanel;
