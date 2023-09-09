// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )

import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';
import './index.css';

function Main() {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Agrega la clase 'appear' después de 1 segundo para que el contenido aparezca gradualmente
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app-container ${showContent ? 'appear' : ''}`}>
      <App />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
