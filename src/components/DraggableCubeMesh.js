import React, { useState, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import CubeMesh from "./CubeMesh";

const GRID_SIZE = 1;

const DraggableCubeMesh = ({ position, colorIndex, updateCubePosition }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const { camera, gl } = useThree();
  const cubeRef = useRef();
  const dragStartPos = useRef(new THREE.Vector3());
  const rotationStartPos = useRef(new THREE.Vector2());

  useFrame(() => {
    if (isDragging || isRotating) {
      gl.domElement.style.cursor = "grabbing";
    } else {
      gl.domElement.style.cursor = "grab";
    }
  });

  const getMousePosition = (event) => {
    const rect = gl.domElement.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  };

  const dragStart = (event) => {
    if (event.button === 0) {
      // Left mouse button
      setIsDragging(true);
      dragStartPos.current.copy(cubeRef.current.position);
    } else if (event.button === 2) {
      // Right mouse button
      setIsRotating(true);
      rotationStartPos.current.copy(getMousePosition(event));
    }
  };

  const dragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      // Snap to grid
      const snappedPosition = cubeRef.current.position
        .toArray()
        .map((coord) => Math.round(coord / GRID_SIZE) * GRID_SIZE);
      updateCubePosition(snappedPosition);
    }
    if (isRotating) {
      setIsRotating(false);
    }
  };

  const drag = (event) => {
    if (isDragging) {
      const plane = new THREE.Plane();
      const raycaster = new THREE.Raycaster();
      const mouse = getMousePosition(event);

      raycaster.setFromCamera(mouse, camera);
      plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(plane.normal),
        dragStartPos.current
      );

      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      cubeRef.current.position.copy(intersectionPoint);
    } else if (isRotating) {
      const currentPos = getMousePosition(event);
      const deltaRotation = currentPos.sub(rotationStartPos.current);

      cubeRef.current.rotation.y += deltaRotation.x * 2;
      cubeRef.current.rotation.x += deltaRotation.y * 2;

      rotationStartPos.current.copy(currentPos);
    }
  };

  return (
    <group
      ref={cubeRef}
      position={position}
      onPointerDown={dragStart}
      onPointerUp={dragEnd}
      onPointerMove={drag}
      onPointerOut={dragEnd}
    >
      <CubeMesh colorIndex={colorIndex} />
    </group>
  );
};

export default DraggableCubeMesh;
