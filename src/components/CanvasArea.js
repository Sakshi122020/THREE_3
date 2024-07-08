import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useDrop } from "react-dnd";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { STLExporter } from "three/examples/jsm/exporters/STLExporter";
import { colors } from "./CubeMesh";

const GRID_SIZE = 1;

const loadSTLGeometries = () => {
  const loader = new STLLoader();
  const geometries = {};

  const loadGeometry = (name, file) => {
    return new Promise((resolve, reject) => {
      loader.load(
        file,
        (geometry) => {
          geometry.center();
          geometry.scale(1 / 30, 1 / 30, 1 / 30);
          geometries[name] = geometry;
          resolve();
        },
        undefined,
        reject
      );
    });
  };

  return Promise.all([
    loadGeometry("default", "30 MM Cube Assembly.stl"),
    loadGeometry("male", "35x17.5_mm_male_box.stl"),
    loadGeometry("female", "35x17.5_mm_female_box.stl"),
    // Add more STL files as needed for other cube types
  ]).then(() => geometries);
};

const ControlledOrbitControls = React.forwardRef((props, ref) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  React.useImperativeHandle(ref, () => ({
    enabled: true,
    setEnabled(value) {
      this.enabled = value;
      if (controlsRef.current) {
        controlsRef.current.enabled = value;
      }
    },
  }));

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
      controlsRef.current.maxPolarAngle = Math.PI / 2;
    }
  }, []);

  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      {...props}
      zoomToCursor={true}
    />
  );
});

const DraggableCubeMesh = ({
  id,
  position,
  colorIndex,
  updateCubePosition,
  orbitControlsRef,
  checkCollision,
  rotateGroup,
  groupId,
  stlGeometries,
  cubeType,
}) => {
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
      setIsDragging(true);
      dragStartPos.current.copy(cubeRef.current.position);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.setEnabled(false);
      }
    } else if (event.button === 2) {
      setIsRotating(true);
      rotationStartPos.current.copy(getMousePosition(event));
      if (orbitControlsRef.current) {
        orbitControlsRef.current.setEnabled(false);
      }
    }
  };

  const dragEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      const currentPosition = cubeRef.current.position.toArray();
      const snappedPosition = [
        Math.round(currentPosition[0]),
        currentPosition[1],
        Math.round(currentPosition[2]),
      ];
      updateCubePosition(id, snappedPosition);
    }
    if (isRotating) {
      setIsRotating(false);
    }
    if (orbitControlsRef.current) {
      orbitControlsRef.current.setEnabled(true);
    }
  };

  const snapToConnector = (newPosition) => {
    const snapDistance = 0.5;
    const nearbyConnectors = cubes.filter(
      (cube) =>
        cube.id !== id &&
        cube.type !== cubeType &&
        Math.abs(cube.position[0] - newPosition[0]) < snapDistance &&
        Math.abs(cube.position[1] - newPosition[1]) < snapDistance &&
        Math.abs(cube.position[2] - newPosition[2]) < snapDistance
    );

    if (nearbyConnectors.length > 0) {
      const closest = nearbyConnectors.reduce((prev, curr) =>
        distance(newPosition, prev.position) < distance(newPosition, curr.position) ? prev : curr
      );
      return closest.position;
    }

    return newPosition;
  };



  const drag = (event) => {
    if (isDragging) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const raycaster = new THREE.Raycaster();
      const mouse = getMousePosition(event);

      raycaster.setFromCamera(mouse, camera);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      const newPosition = [
        Math.round(intersectionPoint.x),
        cubeRef.current.position.y,
        Math.round(intersectionPoint.z),
      ];

      if (!checkCollision(id, newPosition)) {
        cubeRef.current.position.set(
          newPosition[0],
          newPosition[1],
          newPosition[2]
        );
      }
    } else if (isRotating) {
      const currentPos = getMousePosition(event);
      const deltaRotation = currentPos.sub(rotationStartPos.current);

      rotateGroup(groupId, deltaRotation.x * 2, deltaRotation.y * 2);

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
      <mesh>
        {stlGeometries ? (
          <primitive
            object={
              cubeType === "Male"
                ? stlGeometries.male
                : cubeType === "Female"
                ? stlGeometries.female
                : stlGeometries.default
            }
          />
        ) : (
          <boxGeometry args={[1, 1, 1]} />
        )}
        <meshStandardMaterial color={colors[colorIndex]} />
      </mesh>
    </group>
  );
};

const Highlight = ({ position }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[GRID_SIZE, GRID_SIZE, GRID_SIZE]} />
      <meshBasicMaterial color="white" transparent opacity={0.1} />
    </mesh>
  );
};

const CameraController = ({ orbitControlsRef }) => {
  const { camera, gl } = useThree();
  const [isDraggingCamera, setIsDraggingCamera] = useState(false);
  const lastMousePosition = useRef(new THREE.Vector2());
  const spherical = useRef(new THREE.Spherical());

  useEffect(() => {
    const handleMouseDown = (event) => {
      if (
        event.target.tagName === "CANVAS" &&
        orbitControlsRef.current &&
        orbitControlsRef.current.enabled
      ) {
        setIsDraggingCamera(true);
        lastMousePosition.current.set(event.clientX, event.clientY);
        if (orbitControlsRef.current) {
          orbitControlsRef.current.enabled = false;
        }
        spherical.current.setFromVector3(camera.position);
      }
    };

    const handleMouseMove = (event) => {
      if (isDraggingCamera) {
        const deltaX = event.clientX - lastMousePosition.current.x;
        const deltaY = event.clientY - lastMousePosition.current.y;

        const rotationSpeed = 0.003;

        spherical.current.theta -= deltaX * rotationSpeed;
        spherical.current.phi -= deltaY * rotationSpeed;
        spherical.current.phi = Math.max(
          0.01,
          Math.min(Math.PI - 0.01, spherical.current.phi)
        );

        camera.position.setFromSpherical(spherical.current);
        camera.lookAt(0, 0, 0);

        lastMousePosition.current.set(event.clientX, event.clientY);
      }
    };

    const handleMouseUp = () => {
      setIsDraggingCamera(false);
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = true;
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [camera, gl, isDraggingCamera, orbitControlsRef]);

  return null;
};

const CanvasArea = () => {
  const [cubes, setCubes] = useState([]);
  const [highlightPositions, setHighlightPositions] = useState([]);
  const [groups, setGroups] = useState({});
  const [stlGeometries, setStlGeometries] = useState(null);
  const orbitControlsRef = useRef();
  const cameraRef = useRef(
    new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
  );

  // New state for undo/redo functionality
  const [history, setHistory] = useState([]);
  const [currentStep, setCurrentStep] = useState(-1);

  useEffect(() => {
    loadSTLGeometries().then(setStlGeometries).catch(console.error);
  }, []);

  const checkCollision = (id, newPosition) => {
    const [x, y, z] = newPosition;
    return cubes.some(
      (cube) =>
        cube.id !== id &&
        Math.abs(cube.position[0] - x) < GRID_SIZE &&
        Math.abs(cube.position[1] - y) < GRID_SIZE &&
        Math.abs(cube.position[2] - z) < GRID_SIZE
    );
  };

  const updateCubePosition = (id, newPosition) => {
    if (!checkCollision(id, newPosition)) {
      const newCubes = cubes.map((cube) =>
        cube.id === id ? { ...cube, position: newPosition } : cube
      );
      setCubes(newCubes);
      updateGroups();

      // Add to history
      const newHistory = history.slice(0, currentStep + 1);
      newHistory.push(newCubes);
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    }
  };

  const [, drop] = useDrop({
    accept: "CUBE",
    hover: (item, monitor) => {
      const delta = monitor.getClientOffset();
      if (delta) {
        updateHighlightPositions(cubes, delta);
      }
    },
    drop: (item, monitor) => {
      const delta = monitor.getClientOffset();
      if (delta) {
        addCube(delta, item);
      }
    },
  });

  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  useEffect(() => {
    updateHighlightPositions(cubes);
    updateGroups();
  }, [cubes]);

  const addCube = (delta, item) => {
    if (!item) return;

    const initialPosition = calculateNewPosition(delta);
    let newPosition = [...initialPosition];

    const generateOffsets = () => {
      const offsets = [];
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          for (let z = -1; z <= 1; z++) {
            if (x !== 0 || y !== 0 || z !== 0) {
              offsets.push([x, y, z]);
            }
          }
        }
      }
      return offsets.sort(() => Math.random() - 0.5);
    };

    const offsets = generateOffsets();

    let i = 0;
    while (checkCollision(null, newPosition) && i < offsets.length) {
      newPosition = [
        initialPosition[0] + offsets[i][0] * GRID_SIZE,
        initialPosition[1],
        initialPosition[2] + offsets[i][2] * GRID_SIZE,
      ];
      i++;
    }

    if (!checkCollision(null, newPosition)) {
      const newCube = {
        id: Date.now(),
        position: newPosition,
        colorIndex: item.id % colors.length,
        type: item.name,
      };
      const newCubes = [...cubes, newCube];
      setCubes(newCubes);

      // Add to history
      const newHistory = history.slice(0, currentStep + 1);
      newHistory.push(newCubes);
      setHistory(newHistory);
      setCurrentStep(newHistory.length - 1);
    } else {
      console.log("No available nearby positions to add a cube");
    }
  };

  const calculateNewPosition = (delta) => {
    const x = (delta.x / window.innerWidth) * 2 - 1;
    const y = -(delta.y / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(cameraRef.current);
    const dir = vector.sub(cameraRef.current.position).normalize();
    const distance = -cameraRef.current.position.z / dir.z;
    const pos = new THREE.Vector3()
      .copy(cameraRef.current.position)
      .add(dir.multiplyScalar(distance));

    return [Math.round(pos.x), 0, Math.round(pos.z)];
  };

  const updateHighlightPositions = (currentCubes) => {
    const positions = [];
    currentCubes.forEach((cube) => {
      const adjacentPositions = [
        [cube.position[0] + GRID_SIZE, 0, cube.position[2]],
        [cube.position[0] - GRID_SIZE, 0, cube.position[2]],
        [cube.position[0], 0, cube.position[2] + GRID_SIZE],
        [cube.position[0], 0, cube.position[2] - GRID_SIZE],
      ];

      adjacentPositions.forEach((pos) => {
        const isOccupied = currentCubes.some(
          (existingCube) =>
            existingCube.position[0] === pos[0] &&
            existingCube.position[1] === pos[1] &&
            existingCube.position[2] === pos[2]
        );
        if (
          !isOccupied &&
          !positions.some(
            (p) => p[0] === pos[0] && p[1] === pos[1] && p[2] === pos[2]
          )
        ) {
          positions.push(pos);
        }
      });
    });
    setHighlightPositions(positions);
  };

  const updateGroups = () => {
    const newGroups = {};
    let groupId = 0;

    const findGroup = (cube, visited = new Set()) => {
      visited.add(cube.id);
      const group = [cube];

      cubes.forEach((neighbor) => {
        if (
          !visited.has(neighbor.id) &&
          isAdjacent(cube.position, neighbor.position)
        ) {
          group.push(...findGroup(neighbor, visited));
        }
      });

      return group;
    };

    cubes.forEach((cube) => {
      if (
        !Object.values(newGroups)
          .flat()
          .some((c) => c.id === cube.id)
      ) {
        const group = findGroup(cube);
        newGroups[groupId] = group;
        groupId++;
      }
    });

    setGroups(newGroups);
  };

  const isAdjacent = (pos1, pos2) => {
    const [x1, y1, z1] = pos1;
    const [x2, y2, z2] = pos2;
    return (
      Math.abs(x1 - x2) <= GRID_SIZE &&
      Math.abs(y1 - y2) <= GRID_SIZE &&
      Math.abs(z1 - z2) <= GRID_SIZE &&
      (x1 !== x2 || y1 !== y2 || z1 !== z2)
    );
  };

  const rotateGroup = (groupId, deltaX, deltaY) => {
    const group = groups[groupId];
    if (!group) return;

    const centerOfMass = calculateCenterOfMass(group);
    const rotationMatrix = new THREE.Matrix4()
      .makeRotationY(deltaX)
      .multiply(new THREE.Matrix4().makeRotationX(deltaY));

    const updatedCubes = cubes.map((cube) => {
      if (group.some((groupCube) => groupCube.id === cube.id)) {
        const relativePosition = new THREE.Vector3(
          cube.position[0] - centerOfMass[0],
          cube.position[1] - centerOfMass[1],
          cube.position[2] - centerOfMass[2]
        );
        relativePosition.applyMatrix4(rotationMatrix);
        const newPosition = [
          centerOfMass[0] + relativePosition.x,
          centerOfMass[1] + relativePosition.y,
          centerOfMass[2] + relativePosition.z,
        ];
        return { ...cube, position: newPosition };
      }
      return cube;
    });

    setCubes(updatedCubes);

    // Add to history
    const newHistory = history.slice(0, currentStep + 1);
    newHistory.push(updatedCubes);
    setHistory(newHistory);
    setCurrentStep(newHistory.length - 1);
  };

  const calculateCenterOfMass = (group) => {
    const sum = group.reduce(
      (acc, cube) => [
        acc[0] + cube.position[0],
        acc[1] + cube.position[1],
        acc[2] + cube.position[2],
      ],
      [0, 0, 0]
    );
    return sum.map((coord) => coord / group.length);
  };

  const exportSTL = () => {
    const exporter = new STLExporter();
    const scene = new THREE.Scene();

    cubes.forEach((cube) => {
      let geometry;
      switch (cube.type) {
        case "Male":
          geometry = stlGeometries.male;
          break;
        case "Female":
          geometry = stlGeometries.female;
          break;
        default:
          geometry = stlGeometries.default;
      }
      const cubeMesh = new THREE.Mesh(
        geometry,
        new THREE.MeshBasicMaterial({ color: colors[cube.colorIndex] })
      );
      cubeMesh.position.set(...cube.position);
      scene.add(cubeMesh);
    });

    const stlString = exporter.parse(scene, { binary: true });
    const blob = new Blob([stlString], { type: "application/octet-stream" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "30 MM Cube Assembly.stl";
    link.click();
  };

  const undo = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCubes(history[currentStep - 1]);
    }
  };

  const redo = () => {
    if (currentStep < history.length - 1) {
      setCurrentStep(currentStep + 1);
      setCubes(history[currentStep + 1]);
    }
  };

  return (
    <div
      ref={drop}
      style={{
        width: "calc(100% - 250px)",
        height: "100%",
        backgroundColor: "#2a2a2a",
        position: "relative",
      }}
    >
      <Canvas
        camera={{ position: [10, 10, 10], fov: 50 }}
        style={{ background: "#2a2a2a" }}
      >
        <CameraController orbitControlsRef={orbitControlsRef} />
        <ControlledOrbitControls ref={orbitControlsRef} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <directionalLight position={[0, 10, 10]} intensity={0.5} />
        <spotLight
          position={[0, 0, 10]}
          angle={Math.PI / 6}
          penumbra={0.5}
          intensity={1}
        />
        <hemisphereLight
          skyColor="#ffffff"
          groundColor="#404040"
          intensity={0.5}
        />
        <Suspense fallback={null}>
          {cubes.map((cube) => {
            const groupId = Object.entries(groups).find(([, group]) =>
              group.some((groupCube) => groupCube.id === cube.id)
            )?.[0];
            return (
              <DraggableCubeMesh
                key={cube.id}
                id={cube.id}
                position={cube.position}
                colorIndex={cube.colorIndex}
                updateCubePosition={updateCubePosition}
                orbitControlsRef={orbitControlsRef}
                checkCollision={checkCollision}
                rotateGroup={rotateGroup}
                groupId={groupId}
                stlGeometries={stlGeometries}
                cubeType={cube.type}
              />
            );
          })}
          {highlightPositions.map((pos, index) => (
            <Highlight key={index} position={pos} />
          ))}
        </Suspense>
      </Canvas>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={undo}
          disabled={currentStep <= 0}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            opacity: currentStep <= 0 ? 0.5 : 1,
          }}
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={currentStep >= history.length - 1}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            opacity: currentStep >= history.length - 1 ? 0.5 : 1,
          }}
        >
          Redo
        </button>
      </div>
    </div>
  );
};

export default CanvasArea;
