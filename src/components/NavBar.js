import React from "react";

const NavBar = () => {
  return (
    <nav
      style={{
        padding: "10px",
        backgroundColor: "black",
        color: "#ffffff",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        WELCOME TO{" "}
        <img
          src="/robot.jpeg"
          alt="Robo"
          style={{
            height: "60px",
            marginLeft: "5px",
            marginRight: "5px",
          }}
        />{" "}
        MAKER WORKSPACE
      </h1>
    </nav>
  );
};

export default NavBar;
