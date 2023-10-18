import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing/Landing'
import About from './pages/About/About'
import Webs from './pages/webs/webs'
import Test from './pages/test/test'
import Testcards from './pages/testcards/Testcards'

function App() {
  return (
    <>
      <Routes>
        <Route path = "/" element={<Landing/>}/>
        <Route path = "/about" element={<About/>}/>
        <Route path = "/monos" element={<Webs/>}/>
        <Route path = "/test" element={<Test/>}/>
        <Route path = "/test1" element={<Testcards/>}/>
      </Routes>
    </>
  )
}

export default App

