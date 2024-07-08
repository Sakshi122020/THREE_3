import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const mountRef = useRef(null);
  const [snap, setSnap] = useState(false);

  useEffect(() => {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube1 = new THREE.Mesh(geometry, material);
    const cube2 = new THREE.Mesh(geometry, material);
    cube2.position.x = 2;
    scene.add(cube1);
    scene.add(cube2);

    const snapDistance = 1.5;

    const checkSnap = () => {
      const distance = cube1.position.distanceTo(cube2.position);
      if (distance < snapDistance) {
        setSnap(true);
      } else {
        setSnap(false);
      }
    };

    const animate = () => {
      requestAnimationFrame(animate);

      checkSnap();

      if (snap) {
        cube2.position.x = cube1.position.x + 1;
        cube2.position.y = cube1.position.y;
        cube2.position.z = cube1.position.z;
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [snap]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh" }}
      onClick={() => setSnap(false)}
    />
  );
};

export default ThreeScene;
