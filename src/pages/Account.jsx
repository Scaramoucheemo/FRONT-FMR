import React, { useState, useRef, useEffect } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://161.35.234.161/api";

const Account = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const [alerts, setAlerts] = useState(true);

  const sectionsRef = {
    personal: useRef(null),
    security: useRef(null),
    preferences: useRef(null),
    danger: useRef(null)
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // cerrar menú
  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  //  scroll interno
  const scrollTo = (section) => {
    sectionsRef[section].current?.scrollIntoView({ behavior: "smooth" });
  };

  //  eliminar cuenta
  const handleDeleteAccount = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar tu cuenta?")) return;

    try {
      const res = await fetch(`${API_BASE}/user`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("Cuenta eliminada correctamente");
        handleLogout();
      } else {
        alert("Error al eliminar cuenta");
      }
    } catch (err) {
      console.error(err);
      alert("Error del servidor");
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col">

      {/*  NAVBAR EXACTO */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span onClick={() => navigate("/home")} className="cursor-pointer hover:text-[#bc004f]">Inventario</span>
          <span onClick={() => navigate("/ventas")} className="cursor-pointer hover:text-[#bc004f]">Ventas</span>
        </div>

        <div className="flex items-center gap-4">
          <Bell onClick={() => navigate("/alerts")} className="cursor-pointer hover:text-[#bc004f]" />

          <div ref={menuRef} className="relative">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img
                src={`https://ui-avatars.com/api/?name=${user?.nombre || "User"}&background=bc004f&color=fff`}
                className="w-9 h-9 rounded-full"
              />
              <span className="hidden md:block text-sm">
                {user?.nombre?.split(" ")[0] || "Usuario"}
              </span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border">

                {/*  MOBILE NAV */}
                <div className="md:hidden border-b mb-2 pb-2">
                  <button onClick={() => navigate("/home")} className="block w-full text-left p-2 hover:bg-gray-100 rounded-lg">
                    Inventario
                  </button>
                  <button onClick={() => navigate("/ventas")} className="block w-full text-left p-2 hover:bg-gray-100 rounded-lg">
                    Ventas
                  </button>
                </div>

                <button onClick={() => navigate("/config")} className="flex gap-2 p-2 w-full hover:bg-gray-100 rounded-lg">
                  <User size={16}/> Configuración
                </button>

                <button onClick={handleLogout} className="flex gap-2 p-2 text-red-500 w-full hover:bg-red-50 rounded-lg">
                  <LogOut size={16}/> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="pt-28 px-6 max-w-6xl mx-auto w-full flex-grow">

        <h1 className="text-4xl font-extrabold mb-8">Account Settings</h1>

        <div className="grid lg:grid-cols-12 gap-10">

          {/* SIDEBAR */}
          <aside className="hidden lg:block col-span-3 space-y-2">
            <div onClick={() => scrollTo("personal")} className="bg-[#ffe4e7] text-[#bc004f] px-4 py-3 rounded-xl cursor-pointer">
              Personal info
            </div>
            <div onClick={() => scrollTo("security")} className="px-4 py-3 hover:bg-white rounded-xl cursor-pointer">
              Security
            </div>
            <div onClick={() => scrollTo("preferences")} className="px-4 py-3 hover:bg-white rounded-xl cursor-pointer">
              Preferences
            </div>
            <div onClick={() => scrollTo("danger")} className="px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer">
              Danger Zone
            </div>
          </aside>

          {/* CONTENT */}
          <div className="col-span-9 space-y-10">

            {/* PERSONAL */}
            <section ref={sectionsRef.personal} className="bg-white p-8 rounded-2xl">
              <h2 className="font-bold mb-4">Personal Information</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <input className="bg-gray-100 p-3 rounded-lg" defaultValue={user?.nombre || ""} placeholder="Nombre" />
                <input className="bg-gray-100 p-3 rounded-lg" placeholder="Cargo" />
                <input className="bg-gray-100 p-3 rounded-lg" placeholder="Teléfono" />
                <input type="date" className="bg-gray-100 p-3 rounded-lg" />

                <div className="md:col-span-2 text-sm text-gray-500">
                  Aquí podrás gestionar información adicional de tu perfil en futuras versiones.
                </div>
              </div>
            </section>

            {/* SECURITY */}
            <section ref={sectionsRef.security} className="bg-white p-8 rounded-2xl">
              <h2 className="font-bold mb-4">Security</h2>
              <p className="text-gray-500 text-sm">
                Aquí podrás cambiar tu contraseña y gestionar accesos próximamente.
              </p>
            </section>

            {/* PREFERENCES */}
            <section ref={sectionsRef.preferences} className="bg-white p-8 rounded-2xl">
              <h2 className="font-bold mb-4">Preferences</h2>

              <div className="flex justify-between items-center">
                <span>Inventory Low-Stock Alerts</span>

                <div
                  onClick={() => setAlerts(!alerts)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                    alerts ? "bg-[#bc004f]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-5 h-5 rounded-full shadow transform ${
                      alerts ? "translate-x-6" : ""
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* DANGER */}
            <section ref={sectionsRef.danger} className="border border-red-300 bg-red-50 p-6 rounded-xl">
              <h2 className="text-red-500 font-bold mb-2">Danger Zone</h2>
              <p className="text-sm text-gray-600 mb-4">
                Eliminar tu cuenta borrará todos tus datos permanentemente.
              </p>

              <button
                onClick={handleDeleteAccount}
                className="border border-red-500 text-red-500 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white"
              >
                Desactivar Cuenta
              </button>
            </section>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t py-6 text-center text-sm text-gray-500">
        © 2026 Farmacia Médica Rincón
      </footer>
    </div>
  );
};

export default Account;