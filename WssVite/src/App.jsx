import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import { InicioSesion } from './pages/InicioSesion'
import { Trabajador } from './pages/Trabajador'
import { Supervisor } from './pages/Supervisor'
import { Administrador } from './pages/Administrador'
import { FormularioART } from './pages/Art'
/*

*/

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element={<Navigate to="/InicioSesion"/>}/>
        <Route path ="/InicioSesion" element={<InicioSesion/>}/>
        <Route path ="/Trabajador/:userRut" element={<Trabajador/>}/>
        <Route path ="/Supervisor/:userRut" element={<Supervisor/>}/>
        <Route path ="/Administrador/:userRut" element={<Administrador/>}/>
        <Route path="/art" element={<FormularioART/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App