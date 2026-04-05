import React, { useState, useEffect, useRef } from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MdAccessTime, MdWarning } from "react-icons/md";
import { IoAdd } from "react-icons/io5";
import Swal from 'sweetalert2'; 
import AOS from 'aos';
import 'aos/dist/aos.css';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Alerts = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // INICIALIZAR AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      offset: 50,
    });
  }, []);

  // CARGAR USUARIO REAL
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // 🔥 OBTENER DATOS REALES DE LOTES
  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem("token");
      
      const res = await fetch(`${API_BASE}/api/lotes`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Error al obtener datos");
      const data = await res.json();

      if (!Array.isArray(data)) return;

      const today = new Date();
      const future = new Date();
      future.setMonth(today.getMonth() + 3);

      const filtered = data.map(lote => {
        if (!lote.fecha_caducidad) return null;
        
        const exp = new Date(lote.fecha_caducidad);

        let type = null;
        if (exp < today) type = "VENCIDO";
        else if (exp <= future) type = "PROXIMO";

        if (!type) return null;

        return {
          id: lote.id_registro_lote || lote.id_lote || lote.id,
          type,
          name: lote.Producto?.nombre_comercial || "Producto Desconocido",
          batch: lote.codigo_lote_fisico,
          expiryDate: exp.toLocaleDateString(),
          stock: `${lote.cantidad} unidades`,
          raw: lote
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

  // 🗑 SWEETALERT: ELIMINAR 
  const handleDelete = async (item) => {
    const isExpired = item.type === "VENCIDO";
    
    const result = await Swal.fire({
      title: isExpired ? '¿Desechar lote vencido?' : '¿Eliminar lote del inventario?',
      text: "Esta acción eliminará el registro permanentemente.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: isExpired ? '#dc2626' : '#FA8072',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/api/lotes/${item.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      Swal.fire({
        title: '¡Eliminado!',
        text: 'El lote ha sido removido del sistema.',
        icon: 'success',
        confirmButtonColor: '#bc004f',
        timer: 2000,
        showConfirmButton: false
      });
      
      fetchAlerts();
    } catch (err) {
      console.error("Error eliminando:", err);
      Swal.fire('Error', 'No se pudo eliminar el registro.', 'error');
    }
  };

  // ✏️ EDITAR
  const handleEdit = () => {
    navigate("/Lotes"); 
  };

  // 🚪 SWEETALERT: LOGOUT
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar sesión?',
      text: "Tendrás que volver a ingresar tus credenciales.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#bc004f',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Cerrar sesión',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // Cerrar menú
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
    <div className="min-h-screen bg-slate-50 flex flex-col overflow-x-hidden">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span onClick={() => navigate("/home")} className="cursor-pointer hover:text-[#bc004f] transition-colors">
            Inventario
          </span>
          <span onClick={() => navigate("/ventas")} className="cursor-pointer hover:text-[#bc004f] transition-colors">
            Ventas
          </span>
          <span className="text-[#bc004f] font-bold border-b-2 border-[#bc004f]">
            Alertas
          </span>
        </div>

        <div className="flex items-center gap-4">
          
          <div className="relative cursor-pointer" onClick={() => navigate("/alerts")}>
            <Bell className="text-[#bc004f] hover:text-pink-700 transition-colors" />
            
            {alerts.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                {alerts.length}
              </span>
            )}
          </div>

          <div ref={menuRef} className="relative">
            <div onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center gap-2 cursor-pointer">
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(" ", "+") || "User"}&background=bc004f&color=fff`}
                className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-200"
                alt="Avatar"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {currentUser?.nombre?.split(" ")[0] || "Usuario"}
              </span>
            </div>

            {/* 🎬 MENÚ DESPLEGABLE CON ANIMACIÓN SUAVE */}
            <div className={`absolute right-0 mt-2 bg-white shadow-xl rounded-xl w-64 p-2 border border-gray-100 transition-all duration-200 transform origin-top-right z-50 ${isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
              <div className="px-3 py-2 border-b border-gray-100 mb-2">
                <p className="font-semibold text-gray-800 truncate">{currentUser?.nombre}</p>
                <p className="text-xs text-gray-500">{currentUser?.rol}</p>
              </div>

              <div className="flex flex-col md:hidden border-b border-gray-100 mb-2 pb-2">
                <button onClick={() => { navigate("/home"); setIsMenuOpen(false); }} className="text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium">
                  Inventario
                </button>
                <button onClick={() => { navigate("/ventas"); setIsMenuOpen(false); }} className="text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium">
                  Ventas
                </button>
              </div>

              <button onClick={handleLogout} className="flex gap-2 p-2 text-red-500 w-full hover:bg-red-50 rounded-lg transition-colors font-medium">
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="pt-28 px-6 max-w-7xl mx-auto w-full flex-grow">

        <div data-aos="fade-down">
          <p className="text-xs font-bold text-slate-500 tracking-widest">
            CENTRO DE CONTROL
          </p>
          <h2 className="text-4xl font-black mb-6 text-gray-900">
            NOTIFICACIONES
          </h2>
        </div>

        {/* BANNER */}
        <div data-aos="fade-right" className="bg-pink-100 rounded-3xl p-6 mb-8 border border-pink-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg text-[#bc004f]">
              Medicamentos Críticos
            </h3>
            <p className="text-sm text-pink-700">Lotes próximos a vencer o ya caducados detectados en el sistema.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm text-pink-700 font-bold">
            {alerts.length} alertas
          </div>
        </div>

        {/* GRID DE ALERTAS */}
        {alerts.length === 0 ? (
          <div data-aos="zoom-in" className="text-center py-20 bg-white rounded-3xl border border-gray-200">
            <span className="text-6xl mb-4 block">✨</span>
            <h3 className="text-xl font-bold text-gray-800">Todo en orden</h3>
            <p className="text-gray-500 mt-2">No hay lotes próximos a caducar en este momento.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alerts.map((item, index) => {
              const isExpired = item.type === "VENCIDO";

              return (
                <div 
                  key={item.id} 
                  data-aos="fade-up" 
                  data-aos-delay={(index % 10) * 50}
                  className={`rounded-3xl p-5 shadow-sm border transition-all hover:shadow-md ${isExpired ? 'bg-red-50 border-red-100' : 'bg-white border-gray-100'}`}
                >

                  <div className="flex justify-between">
                    <div>
                      <p className={`text-[10px] font-black tracking-widest uppercase mb-1 ${isExpired ? "text-red-500" : "text-orange-500"}`}>
                        {isExpired ? "🔴 PRODUCTO VENCIDO" : "⚠️ PRÓXIMO A VENCER"}
                      </p>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight mb-1">{item.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Lote: {item.batch}
                      </p>
                    </div>

                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl flex-shrink-0 ${isExpired ? "bg-red-100 text-red-500" : "bg-orange-100 text-orange-500"}`}>
                      {isExpired ? <MdWarning size={24} /> : <MdAccessTime size={24} />}
                    </div>
                  </div>

                  <hr className={`my-4 ${isExpired ? 'border-red-200' : 'border-gray-100'}`} />

                  <div className="flex justify-between mb-5">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">VENCIMIENTO</p>
                      <p className={`font-bold ${isExpired ? "text-red-600" : "text-gray-800"}`}>
                        {item.expiryDate}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">STOCK ACTUAL</p>
                      <p className="font-bold text-gray-800">{item.stock}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => handleEdit(item)} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-2.5 font-bold transition-colors shadow-sm text-sm">
                      Revisar Lote
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      className={`flex-1 rounded-xl py-2.5 font-bold transition-colors shadow-sm text-sm ${isExpired ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"}`}
                    >
                      Desechar
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* AGREGAR */}
        <div
          data-aos="fade-up"
          onClick={() => navigate("/Lotes")}
          className="border-2 border-dashed border-gray-300 rounded-3xl p-10 text-center mt-10 cursor-pointer hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 transition-all text-gray-500 group"
        >
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm group-hover:shadow-md transition-all mb-3 text-gray-400 group-hover:text-pink-500">
            <IoAdd size={30} />
          </div>
          <p className="font-bold">Ingresar Nuevo Lote al Inventario</p>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="w-full mt-auto bg-white border-t border-gray-200 flex items-center justify-center px-12 py-8 mt-12">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">© 2026 Farmacia Médica Rincón.</p>
      </footer>

    </div>
  );
};

export default Alerts;