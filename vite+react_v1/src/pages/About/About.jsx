import React from "react";
import { NavLink } from "react-router-dom";
import './about.css';



function About() {
  return (
    <div className="about">
      <NavLink to="/">
        <button>
          asprino.tech
        </button>
      </NavLink>
      <p>en proceso</p>
    </div>
  );
}

export default About;