import { Routes, Route } from "react-router-dom";

import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Registration from "./pages/Registration";
import Account from "./pages/Account";
import Home from "./pages/home";
import Alerts from "./pages/Alerts";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registration />} />
      <Route path="/cuenta" element={<Account />} />
      <Route path="/home" element={<Home />} />
      <Route path="/alerts" element={<Alerts />} />

    </Routes>
  );
}

export default App;