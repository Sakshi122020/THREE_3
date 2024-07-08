import React from "react";
import { useDrag } from "react-dnd";

const Cube = ({ id, name, image }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CUBE",
    item: { id, name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        width: "65px",
        height: "50px",
        backgroundImage: `url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "move",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        opacity: isDragging ? 0.5 : 1,
        textAlign: "center",
        fontSize: "12px",
        padding: "5px",
        borderRadius: "5px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          padding: "2px 5px",
          borderRadius: "3px",
        }}
      >
        {name}
      </div>
    </div>
  );
};

export default Cube;
