import React, { useState, useEffect, useRef } from "react";
import { Bell, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MdAccessTime, MdWarning } from "react-icons/md";
import { IoAdd } from "react-icons/io5";

const API_BASE = import.meta.env.VITE_API_URL;

const Alerts = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [user] = useState({
    nombre: "Elena Rincón",
    rol: "Farmacéutica",
    email: "elena.rincon@farmacia.com"
  });

  // 🔥 Obtener productos del backend
  const fetchAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/medicamentos`);
      const data = await res.json();

      const today = new Date();
      const future = new Date();
      future.setMonth(today.getMonth() + 3);

      const filtered = data.map(p => {
        const exp = new Date(p.fecha_vencimiento || p.fecha);

        let type = null;
        if (exp < today) type = "VENCIDO";
        else if (exp <= future) type = "PROXIMO";

        if (!type) return null;

        return {
          id: p.id,
          type,
          name: p.nombre,
          batch: p.codigo,
          expiryDate: exp.toLocaleDateString(),
          stock: `${p.stock} unidades`,
          raw: p
        };
      }).filter(Boolean);

      setAlerts(filtered);
    } catch (err) {
      console.error("Error al cargar alertas:", err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // 🗑 ELIMINAR
  const handleDelete = async (item) => {
    const confirmDelete = window.confirm(
      `¿Eliminar ${item.name}?`
    );
    if (!confirmDelete) return;

    try {
      await fetch(`${API_BASE}/medicamentos/${item.id}`, {
        method: "DELETE"
      });
      fetchAlerts();
    } catch (err) {
      console.error("Error eliminando:", err);
    }
  };

  // ✏️ EDITAR
  const handleEdit = (item) => {
    navigate("/agregar", {
      state: { product: item.raw, isEditing: true }
    });
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // cerrar menú
  useEffect(() => {
    const close = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span onClick={() => navigate("/home")} className="cursor-pointer hover:text-[#bc004f]">
            Inventario
          </span>
          <span onClick={() => navigate("/ventas")} className="cursor-pointer hover:text-[#bc004f]">
            Ventas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell className="text-[#bc004f]" />

          <div ref={menuRef} className="relative">
            <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 cursor-pointer">
              <img
                src={`https://ui-avatars.com/api/?name=${user.nombre.replace(" ", "+")}`}
                className="w-9 h-9 rounded-full"
              />
              <span className="hidden md:block">{user.nombre.split(" ")[0]}</span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border">
                <button onClick={handleLogout} className="p-2 text-red-500 w-full text-left">
                  <LogOut size={16}/> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="pt-28 px-6 max-w-7xl mx-auto w-full flex-grow">

        <p className="text-xs font-bold text-slate-500 tracking-widest">
          CENTRO DE CONTROL
        </p>

        <h2 className="text-4xl font-black mb-6">
          NOTIFICACIONES
        </h2>

        {/* BANNER */}
        <div className="bg-pink-100 rounded-3xl p-6 mb-8">
          <h3 className="font-bold text-lg">
            Medicamentos próximos a vencer
          </h3>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map(item => {
            const isExpired = item.type === "VENCIDO";

            return (
              <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm">

                <div className="flex justify-between">
                  <div>
                    <p className={`text-xs font-extrabold ${isExpired ? "text-red-500" : "text-pink-500"}`}>
                      {isExpired ? "PRODUCTO VENCIDO" : "PRÓXIMO A VENCER"}
                    </p>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-slate-500">
                      Lote: {item.batch}
                    </p>
                  </div>

                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${isExpired ? "bg-red-100" : "bg-pink-100"}`}>
                    {isExpired ? <MdWarning size={24}/> : <MdAccessTime size={24}/>}
                  </div>
                </div>

                <hr className="my-4"/>

                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-bold">VENCIMIENTO</p>
                    <p className={`font-bold ${isExpired ? "text-red-500" : ""}`}>
                      {item.expiryDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-bold">STOCK</p>
                    <p className="font-bold">{item.stock}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => handleEdit(item)} className="flex-1 bg-slate-100 rounded-xl py-2 font-bold">
                    Editar
                  </button>

                  <button
                    onClick={() => handleDelete(item)}
                    className={`flex-1 rounded-xl py-2 font-bold ${isExpired ? "bg-red-500 text-white" : "bg-red-100 text-red-500"}`}
                  >
                    Eliminar
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* AGREGAR */}
        <div
          onClick={() => navigate("/agregar")}
          className="border-2 border-dashed rounded-3xl p-10 text-center mt-10 cursor-pointer hover:bg-gray-50"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow">
            <IoAdd size={30}/>
          </div>
          <p className="font-bold mt-3">Agregar Medicamento</p>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full mt-auto bg-white border-t flex flex-col md:flex-row justify-between items-center px-12 py-8 gap-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">
          © 2026 Farmacia Médica Rincón
        </p>

        <div className="flex gap-8">
          <span className="text-[10px] text-gray-400 hover:text-[#bc004f] cursor-pointer">
            Privacidad
          </span>
          <span className="text-[10px] text-gray-400 hover:text-[#bc004f] cursor-pointer">
            Términos
          </span>
          <span className="text-[10px] text-gray-400 hover:text-[#bc004f] cursor-pointer">
            Contacto
          </span>
        </div>
      </footer>

    </div>
  );
};

export default Alerts;