import { Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Login from "./pages/Auth";
import Account from "./pages/Account";
import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import Agregar from "./pages/Agregar";
import Auth from "./pages/Auth";
import Ventas from "./pages/Ventas";
import Proveedores from "./pages/Proveedores";



function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/config" element={<Account />} />
      <Route path="/home" element={<Home />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/Agregar" element={<Agregar />} />
      <Route path="/Ventas" element={<Ventas />} />
      <Route path="/Proveedores" element={<Proveedores />} />

    </Routes>
  );
}

export default App;