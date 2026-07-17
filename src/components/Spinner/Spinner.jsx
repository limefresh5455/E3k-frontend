import React from "react";
import "./Spinner.css";

export function Spinner({ size = 32 }) {
  const borderThickness = size / 8;

  return (
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        border: `${borderThickness}px solid #e2e8f0`,
        borderTop: `${borderThickness}px solid #3b82f6`,
      }}
    />
  );
}

export default Spinner;
