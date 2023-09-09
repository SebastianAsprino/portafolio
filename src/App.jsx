import { useState } from 'react'
import reactLogo from './assets/react.svg'
import test from './assets/test.jpg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <h1>Sebastian Asprino</h1>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>

        <a href="https://github.com/SebastianAsprino" target="_blank">
          <img src={test} className="logo test" alt="test" />
        </a>



        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <p className="read-the-docs">
        en desarrollo
      </p>
    </>
  )
}

export default App
