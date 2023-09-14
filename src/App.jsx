import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import About from './pages/About/About'

function App() {
  return (
    <>
      <Routes>
        <Route path = "/" element={<Landing/>}/>
        <Route path = "/about" element={<About/>}/>
      </Routes>
    </>
  )
}

export default App

