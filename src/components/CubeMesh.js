import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Define the vibrant colors for the cubes
export const colors = [
  "#ff6347",
  "#7fff00",
  "#00bfff",
  "#ffd700",
  "#ff69b4",
  "#00ffff",
];

// Function to create a texture with smaller boxes and black borders
const createFaceTexture = (color) => {
  const size = 256;
  const boxSize = size / 3;
  const borderSize = 5;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  context.fillStyle = "black";
  context.fillRect(0, 0, size, size);

  context.fillStyle = color;
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      context.fillRect(
        x * boxSize + borderSize,
        y * boxSize + borderSize,
        boxSize - borderSize * 2,
        boxSize - borderSize * 2
      );
    }
  }

  return new THREE.CanvasTexture(canvas);
};

const CubeMesh = ({ position, colorIndex }) => {
  const mesh = useRef();
  const color = colors[colorIndex % colors.length];
  const texture = createFaceTexture(color);

  // useFrame(() => {
  //   if (mesh.current) {
  //     mesh.current.rotation.x += 0.01;
  //     mesh.current.rotation.y += 0.01;
  //   }
  // });

  return (
    <mesh ref={mesh} position={position}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        attach="material"
        map={texture}
        color={color}
        roughness={0.3}
        metalness={0.5}
      />
    </mesh>
  );
};

export default CubeMesh;
