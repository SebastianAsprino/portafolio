import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import reactLogo from '../../image/react.svg'
import githubWhite from '../../image/github-mark-white.svg'
import githubDark from '../../image/github-mark.svg'
import viteLogo from '../../image/vite.svg'
import './Landing.css';

function Landing() {

  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
  );

  useEffect(() => {
    const darkModeListener = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeListener.addListener(handleChange);
    return () => darkModeListener.removeListener(handleChange);
  }, []);

  return (
    <div >
      <h1>Sebastian Asprino</h1>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://github.com/SebastianAsprino" target="_blank">
          <img src={isDarkMode ? githubDark : githubWhite} className="logo github" alt="Github" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div>
        <NavLink to="/about">
          <button>
            Sobre mi
          </button>
        </NavLink>
      </div>
      <p className="read-the-docs">en desarrollo asprino.tech</p>
    </div>
  );
}

export default Landing;

// import React, { useState, useEffect } from 'react';

// function Landing() {
//   const [isDarkMode, setIsDarkMode] = useState(
//     window.matchMedia('(prefers-color-scheme: dark)').matches
//   );

//   useEffect(() => {
//     const darkModeListener = (event) => {
//       setIsDarkMode(event.matches);
//     };

//     const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
//     darkModeMediaQuery.addListener(darkModeListener);

//     return () => {
//       darkModeMediaQuery.removeListener(darkModeListener);
//     };
//   }, []);

//   return (
//     <div>
//       <a href="https://vitejs.dev" target="_blank">
//         <div className={`logo test ${isDarkMode ? 'dark' : 'light'}`} />
//       </a>
//     </div>
//   );
// }

// export default Landing;

