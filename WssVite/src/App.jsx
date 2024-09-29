import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { InicioSesion } from './pages/InicioSesion'
import { Trabajador } from './pages/Trabajador'
import { Supervisor } from './pages/Supervisor'
import { Administrador } from './pages/Administrador'
/*

import { Art } from './pages/Art'
<Route path="/art" element={<Art/>}/>

*/

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element={<Navigate to="/inicioSesion"/>}/>
        <Route path ="/inicioSesion" element={<InicioSesion/>}/>
        <Route path ="/trabajador" element={<Trabajador/>}/>
        <Route path ="/supervisor" element={<Supervisor/>}/>
        <Route path ="/Administrador" element={<Administrador/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App