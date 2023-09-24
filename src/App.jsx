import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import About from './pages/About/About'
import Webs from './pages/webs/webs'

function App() {
  return (
    <>
      <Routes>
        <Route path = "/" element={<Landing/>}/>
        <Route path = "/about" element={<About/>}/>
        <Route path = "/monos" element={<Webs/>}/>
      </Routes>
    </>
  )
}

export default App

