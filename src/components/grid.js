import React from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const Grid = ({ size = 1000, divisions = 1000 }) => {
  const { scene } = useThree();

  React.useEffect(() => {
    const gridHelper = new THREE.GridHelper(size, divisions, "#444", "#222");
    scene.add(gridHelper);

    return () => {
      scene.remove(gridHelper);
    };
  }, [scene, size, divisions]);

  return null;
};

export default Grid;
