import React, { useRef, useEffect } from "react";
import { extend, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";

extend({ OrbitControls });

const ControlledOrbitControls = React.forwardRef((props, ref) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  useFrame(() => controlsRef.current.update());

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.mouseButtons = {
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      };
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.25;
      controlsRef.current.screenSpacePanning = false;
      controlsRef.current.maxPolarAngle = Math.PI; // Allow full vertical rotation
      controlsRef.current.minPolarAngle = 0; // Allow full vertical rotation
    }
  }, []);

  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(controlsRef.current);
      } else {
        ref.current = controlsRef.current;
      }
    }
  }, [ref]);

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      {...props}
    />
  );
});

export default ControlledOrbitControls;
