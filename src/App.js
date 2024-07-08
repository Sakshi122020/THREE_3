import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import NavBar from "./components/NavBar";
import Toolkit from "./components/Toolkit";
import CanvasArea from "./components/CanvasArea";
import "./App.css";

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <NavBar />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          //width: "50vh",
        }}
      >
        <div className="content">
          <Toolkit className="toolkit" />
          <CanvasArea className="canvas" />
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
