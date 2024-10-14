import React from "react";

interface Props {
  onSolve: () => void;
  hasImage: boolean;
  hasSolution: boolean;
  entrance: [number, number] | null;
  exit: [number, number] | null;
  processing: boolean;
}

const ControlPanel: React.FC<Props> = ({
  onSolve,
  hasImage,
  hasSolution,
  entrance,
  exit,
  processing,
}) => {
  return (
    <div>
      <button
        onClick={onSolve}
        disabled={!hasImage || hasSolution || !entrance || !exit || processing}
      >
        {processing ? "Processing..." : "Solve Maze"}
      </button>
      {!entrance && <p>Please select an entrance point</p>}
      {!exit && <p>Please select an exit point</p>}
    </div>
  );
};

export default ControlPanel;
