import { Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Account from "./pages/Account";
import Home from "./pages/Home";
import Alerts from "./pages/Alerts";
import Agregar from "./pages/Agregar";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registration />} />
      <Route path="/cuenta" element={<Account />} />
      <Route path="/home" element={<Home />} />
      <Route path="/alerts" element={<Alerts />} />
      <Route path="/Agregar" element={<Agregar />} />

    </Routes>
  );
}

export default App;