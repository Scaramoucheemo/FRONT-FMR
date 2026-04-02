// src/components/AgregarDoctor.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Save, X, Stethoscope } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Doctor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const doctor = location.state?.doctor;
  const isEditing = !!doctor;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const menuRef = useRef(null);

  // Estado del formulario para DOCTOR según el diagrama
  const [form, setForm] = useState({
    nombre: doctor?.nombre || "",
    apellido: doctor?.apellido || "",
    cedula_profesional: doctor?.cedula_profesional || "",
    especialidad: doctor?.especialidad || "",
    domicilio_consultorio: doctor?.domicilio_consultorio || "",
    estado: doctor?.estado !== undefined ? doctor.estado : true
  });

  // Cargar usuario actual
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);

      // Solo administradores pueden gestionar doctores
      if (parsedUser.rol !== "Administrador") {
        alert("Acceso denegado. Solo los administradores pueden gestionar doctores.");
        navigate("/home");
      }
    } else {
      navigate("/login");
    }
    setLoadingUser(false);
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Validar formulario
  const validateForm = () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return false; }
    if (!form.apellido.trim()) { setError("El apellido es obligatorio"); return false; }
    if (!form.cedula_profesional.trim()) { setError("La cédula profesional es obligatoria"); return false; }
    if (!form.especialidad.trim()) { setError("La especialidad es obligatoria"); return false; }
    if (!form.domicilio_consultorio.trim()) { setError("El domicilio del consultorio es obligatorio"); return false; }
    return true;
  };

  // GUARDAR
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `${API_BASE}/api/doctores/${doctor.id_doctor}`
        : `${API_BASE}/api/doctores`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Error HTTP: ${res.status}`);
      }

      setSuccess(isEditing ? "Doctor actualizado correctamente" : "Doctor guardado correctamente");
      setTimeout(() => navigate("/home"), 1500);

    } catch (err) {
      console.error("Error al guardar:", err);
      setError(err.message || "Error al guardar el doctor");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("¿Está seguro de cancelar? Los cambios no guardados se perderán.")) {
      navigate("/home");
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Está seguro de cerrar sesión?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

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

  if (loadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bc004f] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fffbff] flex flex-col">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span onClick={() => navigate("/home")} className="cursor-pointer hover:text-[#bc004f] transition-colors">Inventario</span>
          <span onClick={() => navigate("/ventas")} className="cursor-pointer hover:text-[#bc004f] transition-colors">Ventas</span>
          <span className="text-[#bc004f] font-bold border-b-2 border-[#bc004f]">
            {isEditing ? "Editar Doctor" : "Agregar Doctores"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell onClick={() => navigate("/alerts")} className="cursor-pointer hover:text-[#bc004f] transition-colors" />

          <div ref={menuRef} className="relative">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img src={`https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(" ", "+") || "User"}&background=bc004f&color=fff`} className="w-9 h-9 rounded-full object-cover" alt="Avatar" />
              <span className="hidden md:block text-sm font-medium text-gray-700">{currentUser?.nombre?.split(" ")[0] || "Usuario"}</span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border">
                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-semibold text-gray-800">{currentUser?.nombre || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{currentUser?.rol || "Rol no definido"}</p>
                </div>

                <div className="flex flex-col md:hidden border-b mb-2 pb-2">
                  <button onClick={() => { navigate("/home"); setIsMenuOpen(false); }} className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg">Inventario</button>
                  <button onClick={() => { navigate("/ventas"); setIsMenuOpen(false); }} className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg">Ventas</button>
                </div>

                <button onClick={handleLogout} className="flex gap-2 p-2 text-red-500 w-full hover:bg-red-50 rounded-lg">
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Notificaciones */}
      {error && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-96 max-w-[90%]">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center shadow-lg">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold"><X size={16} /></button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-96 max-w-[90%]">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center shadow-lg">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold"><X size={16} /></button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="flex-grow pt-28 px-6 max-w-7xl mx-auto w-full">

        {/* HEADER */}
        <div className="mb-10">
          <span className="text-xs text-[#bc004f] font-semibold uppercase tracking-wider">
            {isEditing ? "✏️ EDITAR DOCTOR" : "👨‍⚕️ NUEVO DOCTOR"}
          </span>
          <h1 className="text-4xl font-extrabold mt-2 text-gray-900">
            {isEditing ? "Editar Doctor" : "Agregar Doctor"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isEditing ? "Actualiza la información del doctor." : "Registra nuevos doctores en el sistema."}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* FORMULARIO DOCTOR */}
          <section className="lg:col-span-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[#bc004f]">📋</span> Información del Doctor
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Nombre *
                </label>
                <input
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: María"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Apellido *
                </label>
                <input
                  name="apellido"
                  value={form.apellido}
                  onChange={handleChange}
                  placeholder="Ej: López"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Cédula Profesional *
                </label>
                <input
                  name="cedula_profesional"
                  value={form.cedula_profesional}
                  onChange={handleChange}
                  placeholder="Ej: 12345678"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Especialidad *
                </label>
                <input
                  name="especialidad"
                  value={form.especialidad}
                  onChange={handleChange}
                  placeholder="Ej: Cardiología"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Domicilio del Consultorio *
                </label>
                <textarea
                  name="domicilio_consultorio"
                  value={form.domicilio_consultorio}
                  onChange={handleChange}
                  placeholder="Ej: Av. Principal #123, Colonia Centro"
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3 mt-2 bg-pink-50 p-4 rounded-xl border border-pink-100">
                <input
                  type="checkbox"
                  id="estado"
                  name="estado"
                  checked={form.estado}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#bc004f] rounded focus:ring-[#bc004f]"
                />
                <label htmlFor="estado" className="font-bold text-gray-700 cursor-pointer">
                  Doctor activo
                </label>
              </div>

            </div>
          </section>

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-10 pb-10">
          <button onClick={handleCancel} className="px-8 py-3 border-2 border-gray-300 rounded-full font-bold text-gray-700 hover:bg-gray-50" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-[#bc004f] text-white rounded-full font-bold hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={18} />}
            {isEditing ? "Actualizar Doctor" : "Guardar Doctor"}
          </button>
        </div>

      </main>

      <footer className="w-full mt-auto bg-white border-t border-gray-200 flex items-center justify-center px-12 py-8 mt-12">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">© 2026 Farmacia Médica Rincón.</p>
      </footer>
    </div>
  );
};

export default Doctor;