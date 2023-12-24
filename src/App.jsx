import { Route, Routes } from 'react-router-dom'

import Pagina from './pages/pagina/pagina'



function App() {
  return (
    <>
      <Routes>
        <Route path = "/" element={<Pagina/>}/>
      </Routes>
    </>
  )
}

export default App

