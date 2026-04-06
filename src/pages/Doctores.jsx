import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Save, User, Pencil, Trash2, Archive, Stethoscope, MapPin, Award, CreditCard, RefreshCw, AlertTriangle, AlertCircle, Search } from "lucide-react";
import Swal from 'sweetalert2'; 
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAlerts } from '../Components/useAlert'; // Tu nuevo hook para la campanita

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Doctor = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const alertCount = useAlerts(); 

  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [doctores, setDoctores] = useState([]);
  const [verDescontinuados, setVerDescontinuados] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const estadoInicial = {
    nombre: "",
    apellido: "",
    cedula_profesional: "",
    especialidad: "",
    domicilio_consultorio: "",
    estado: true
  };

  const [form, setForm] = useState(estadoInicial);

  // INICIALIZAR AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);

      if (parsedUser.rol !== "Administrador") {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'Solo los administradores pueden gestionar doctores.',
          confirmButtonColor: '#bc004f'
        }).then(() => {
          navigate("/home");
        });
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchDoctores();
  }, [verDescontinuados]);

  const fetchDoctores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Nota: Si en el futuro agregas el filtro inactivos en tu backend, esta URL ya está lista
      const endpoint = verDescontinuados 
        ? `${API_BASE}/api/doctores?inactivos=true` 
        : `${API_BASE}/api/doctores`;

      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error("Error al cargar doctores");
      
      const data = await res.json();
      // Tu backend devuelve { ok: true, doctores: [...] }
      setDoctores(data.doctores || []);
    } catch (err) {
      setError("No se pudo conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const validateForm = () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return false; }
    if (!form.apellido.trim()) { setError("El apellido es obligatorio"); return false; }
    if (!form.cedula_profesional.trim()) { setError("La cédula profesional es obligatoria"); return false; }
    if (!form.especialidad.trim()) { setError("La especialidad es obligatoria"); return false; }
    if (!form.domicilio_consultorio.trim()) { setError("El domicilio del consultorio es obligatorio"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `${API_BASE}/api/doctores/${editingId}`
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

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.msg || data.message || "Error al procesar el doctor");

      setSuccess(isEditing ? "Expediente del doctor actualizado" : "Doctor registrado exitosamente");
      setForm(estadoInicial);
      setIsEditing(false); 
      setEditingId(null);
      
      fetchDoctores();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message); 
      setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc) => {
    setForm({
      nombre: doc.nombre || "",
      apellido: doc.apellido || "",
      cedula_profesional: doc.cedula_profesional || "",
      especialidad: doc.especialidad || "",
      domicilio_consultorio: doc.domicilio_consultorio || "",
      estado: doc.estado !== undefined ? doc.estado : true
    });
    setEditingId(doc.id); 
    setIsEditing(true);
  };

  const handleCancelEdit = async () => {
    const result = await Swal.fire({
      title: '¿Cancelar edición?',
      text: "Los cambios no guardados se perderán.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#bc004f',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Seguir editando'
    });

    if (result.isConfirmed) {
      setForm(estadoInicial);
      setIsEditing(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Dar de baja?',
      text: "El doctor ya no aparecerá en la lista para expedir recetas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FA8072',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, dar de baja',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      // Tu backend usa DELETE para el borrado lógico
      const res = await fetch(`${API_BASE}/api/doctores/${id}`, {
        method: "DELETE", 
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      
      setSuccess("Doctor desactivado correctamente"); 
      fetchDoctores(); 
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) { 
      setError("Error al desactivar doctor"); 
      setTimeout(() => setError(null), 3000); 
    }
  };

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

  // Filtrado de doctores
  const doctoresFiltrados = doctores.filter(doc => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto = `${doc.nombre} ${doc.apellido || ""}`.toLowerCase();
    const cedula = (doc.cedula_profesional || "").toLowerCase();
    return nombreCompleto.includes(termino) || cedula.includes(termino);
  });

  const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent outline-none focus:outline-none focus:ring-0 focus:border-[#FA8072] hover:border-[#FA8072]/50 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#fffbff] flex flex-col overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>
        
        <div className="hidden md:flex gap-6">
          <span onClick={() => navigate("/home")} className="cursor-pointer hover:text-[#bc004f] transition-colors">Inventario</span>
          <span onClick={() => navigate("/ventas")} className="cursor-pointer hover:text-[#bc004f] transition-colors">Ventas</span>
          <span className="text-[#bc004f] font-bold border-b-2 border-[#bc004f]">Directorio Médico</span>
        </div>
        
        <div className="flex items-center gap-4">
          
          {/* HOOK DE ALERTAS */}
          <div className="relative cursor-pointer" onClick={() => navigate("/alerts")}>
            <Bell className="text-[#bc004f] hover:text-pink-700 transition-colors" />
            {alertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                {alertCount}
              </span>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img src={`https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(' ', '+') || 'User'}&background=bc004f&color=fff`} className="w-9 h-9 rounded-full object-cover shadow-sm border border-gray-200" alt="Avatar"/>
            </div>
            
            <div className={`absolute right-0 mt-2 bg-white shadow-xl rounded-xl w-64 p-2 border border-gray-100 transition-all duration-200 transform origin-top-right z-50 ${isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
              <div className="px-3 py-2 border-b border-gray-100 mb-2">
                <p className="font-semibold text-gray-800 truncate">{currentUser?.nombre}</p>
                <p className="text-xs text-gray-500">{currentUser?.rol}</p>
              </div>
              <div className="flex flex-col md:hidden border-b border-gray-100 mb-2 pb-2">
                <button onClick={() => { navigate("/home"); setIsMenuOpen(false); }} className="text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium">Inventario</button>
                <button onClick={() => { navigate("/ventas"); setIsMenuOpen(false); }} className="text-left px-3 py-2 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors font-medium">Ventas</button>
              </div>
              <button onClick={handleLogout} className="flex gap-2 p-2 text-red-500 w-full hover:bg-red-50 rounded-lg transition-colors font-medium">
                <LogOut size={16} /> Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* NOTIFICACIONES TOAST */}
      {error && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-100 text-red-700 p-3 rounded-lg shadow-lg flex items-center gap-2"><AlertCircle size={18}/>{error}</div>}
      {success && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-green-100 text-green-700 p-3 rounded-lg shadow-lg">{success}</div>}

      {/* MAIN */}
      <main className="flex-grow pt-24 sm:pt-28 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        
        <div className="mb-8" data-aos="fade-down">
          <span className="text-xs text-[#bc004f] font-semibold uppercase tracking-wider">
            {isEditing ? "✏️ ACTUALIZAR EXPEDIENTE" : "👨‍⚕️ GESTIÓN MÉDICA"}
          </span>
          <h1 className="text-4xl font-extrabold mt-2 text-gray-900">
            {isEditing ? "Editar Doctor" : "Registro de Doctores"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <section data-aos="fade-right" className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-8 shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[#bc004f]">📋</span> Información del Médico
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nombre *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: María" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Apellido *</label>
                  <div className="relative">
                    <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej: López" className={`pl-4 ${inputClass}`} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Cédula Prof. *</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="cedula_profesional" value={form.cedula_profesional} onChange={handleChange} placeholder="Ej: 12345678" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Especialidad *</label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="especialidad" value={form.especialidad} onChange={handleChange} placeholder="Cardiología" className={inputClass} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Domicilio del Consultorio *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea name="domicilio_consultorio" value={form.domicilio_consultorio} onChange={handleChange} rows="2" placeholder="Av. Principal #123, Centro" className={`pl-10 resize-none ${inputClass}`}></textarea>
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-4">
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 outline-none focus:outline-none">
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#bc004f] text-white rounded-xl font-bold hover:bg-pink-700 disabled:opacity-50 flex justify-center items-center gap-2 outline-none focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all">
                  <Save size={18} /> {isEditing ? "Actualizar Doctor" : "Guardar Doctor"}
                </button>
              </div>
            </form>
          </section>

          {/* COLUMNA DERECHA: DIRECTORIO DE DOCTORES */}
          <aside data-aos="fade-left" className="lg:col-span-7 flex flex-col h-[750px]">
            
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <Stethoscope className="text-[#bc004f]" size={20} /> 
                  Directorio Activo
                </h2>
                
                {/* Botón visual para futuras expansiones (Ver Inactivos) */}
                <button 
                  onClick={() => setVerDescontinuados(!verDescontinuados)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors outline-none focus:outline-none ${
                    verDescontinuados ? 'bg-gray-800 text-white' : 'bg-[#FA8072]/10 text-[#FA8072] hover:bg-[#FA8072]/20'
                  }`}
                >
                  <Archive size={14} />
                  {verDescontinuados ? 'Ver Activos' : 'Ver Bajas'}
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o cédula..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white shadow-sm rounded-xl border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-[#FA8072] transition-colors"
                />
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">
              
              {doctoresFiltrados.length === 0 && !loading && (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">
                    {busqueda ? "No se encontraron doctores con esa búsqueda." : "No hay doctores registrados en el sistema."}
                  </p>
                </div>
              )}

              {doctoresFiltrados.map((doc, index) => (
                <div 
                  key={doc.id} 
                  data-aos="fade-up" 
                  data-aos-delay={(index % 10) * 50} 
                  className="flex items-stretch gap-3"
                >
                  
                  {/* Tarjeta del Doctor */}
                  <div className={`flex-grow group relative p-5 rounded-2xl shadow-sm border flex flex-col justify-center min-h-[120px] transition-all overflow-hidden ${!doc.estado ? 'bg-gray-50 border-gray-300 opacity-80' : 'bg-white border-gray-200 hover:shadow-md hover:border-[#FA8072]/30'}`}>
                    
                    {/* ACCIONES HOVER */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-300 z-10 backdrop-blur-sm rounded-2xl">
                      <button onClick={() => handleEdit(doc)} className="bg-white p-3 rounded-full hover:bg-[#FA8072] hover:text-white transition-colors outline-none focus:outline-none" title="Editar datos">
                        <Pencil size={18}/>
                      </button>
                      
                      {doc.estado && (
                        <button onClick={() => handleDelete(doc.id)} className="bg-white p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors outline-none focus:outline-none" title="Desactivar doctor">
                          <Trash2 size={18}/>
                        </button>
                      )}
                    </div>

                    <div className="relative z-0">
                      <div className="flex justify-between items-start">
                        <div className="pr-4">
                          <h3 className="font-bold text-gray-900 text-lg">
                            Dr(a). {doc.nombre} {doc.apellido}
                          </h3>
                          <span className="inline-block mt-1 bg-pink-100 text-[#bc004f] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                            {doc.especialidad}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-3 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <CreditCard size={14} className="text-[#FA8072]" /> Cédula: {doc.cedula_profesional}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 w-full truncate" title={doc.domicilio_consultorio}>
                          <MapPin size={14} className="text-gray-400 flex-shrink-0" /> {doc.domicilio_consultorio}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </aside>
          
        </div>
      </main>
    </div>
  );
};

export default Doctor;