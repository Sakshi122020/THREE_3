// Highlight.js

import React from "react";
import { meshBasicMaterial } from "three";

const gridSize = 1;

const Highlight = ({ position }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[gridSize, gridSize, gridSize]} />
      <meshBasicMaterial color="white" transparent opacity={0.1} />
    </mesh>
  );
};

export default Highlight;
