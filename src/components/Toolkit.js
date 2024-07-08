import React, { useState } from "react";
import Cube from "./Cube";
import "./Toolkit.css";

const Toolkit = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const cubes = [
    { id: 1, name: "Power", category: "Power", image: "/power.jpg" },
    { id: 2, name: "Battery", category: "Power", image: "/battery.jpg" },
    { id: 3, name: "LED", category: "Output", image: "/led.png" },
    { id: 4, name: "IR", category: "Input", image: "/ir.jpg" },
    { id: 5, name: "Switch", category: "Input", image: "/switch.jpg" },
    { id: 6, name: "LDR", category: "Input", image: "/ldr.png" },
    { id: 7, name: "Speaker", category: "Output", image: "/speaker1.jpeg" },
    { id: 8, name: "AND", category: "Logic", image: "/and2.jpg" },
    { id: 9, name: "OR", category: "Logic", image: "/or.png" },
    { id: 10, name: "NOT", category: "Logic", image: "/not.png" },
    { id: 11, name: "Input", category: "Input", image: "/input.jpg" },
    { id: 12, name: "Wires", category: "Accessory", image: "/wires.jpg" },
    { id: 13, name: "Touch", category: "Input", image: "/touch.jpg" },
    {
      id: 14,
      name: "Potentiometer",
      category: "Input",
      image: "/potentiometer.jpg",
    },
    { id: 15, name: "IC", category: "Accessory", image: "/ic.jpg" },
    { id: 16, name: "DC", category: "Power", image: "/dc.jpg" },
    { id: 17, name: "Servo", category: "Output", image: "/servo.jpeg" },
    { id: 18, name: "Male", category: "Connectors", image: "/male.jpeg" },
    { id: 19, name: "Female", category: "Connectors", image: "/female.jpeg" },
  ];

  const filteredCubes = cubes.filter(
    (cube) =>
      cube.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cube.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get categories only for filtered cubes
  const categories = [...new Set(filteredCubes.map((cube) => cube.category))];

  return (
    <div className="toolkit-container">
      <input
        type="text"
        placeholder="Search components..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-bar"
      />
      <div className="categories-container">
        {categories.map((category) => (
          <div key={category} className="category">
            <h3>{category}</h3>
            <div className="cubes-container">
              {filteredCubes
                .filter((cube) => cube.category === category)
                .map((cube) => (
                  <Cube
                    key={cube.id}
                    id={cube.id}
                    name={cube.name}
                    image={cube.image}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Toolkit;
