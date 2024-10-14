import React from "react";

interface Props {
  onSolve: () => void;
  processing: boolean;
}

const ControlPanel: React.FC<Props> = ({ onSolve, processing }) => {
  return (
    <div>
      <button onClick={onSolve} disabled={processing}>
        {processing ? "Processing..." : "Solve Maze"}
      </button>
    </div>
  );
};

export default ControlPanel;
