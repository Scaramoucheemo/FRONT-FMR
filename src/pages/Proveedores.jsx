import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Save, Truck, Pencil, Trash2, Building2, Phone, Mail, MapPin, Archive, RefreshCw, AlertTriangle } from "lucide-react";
import Swal from 'sweetalert2'; 
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAlerts } from "../Components/useAlert";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Proveedores = () => {
  const alertCount = useAlerts();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [proveedores, setProveedores] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [verDescontinuados, setVerDescontinuados] = useState(false);

  const estadoInicial = {
    razon_social: "",
    telefono: "",
    correo: "",
    domicilio: ""
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
        // SWEETALERT: Acceso Denegado
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'Solo administradores pueden gestionar proveedores.',
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
    fetchProveedores();
  }, [verDescontinuados]);

  const fetchProveedores = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = verDescontinuados
        ? `${API_BASE}/api/proveedores?inactivos=true`
        : `${API_BASE}/api/proveedores`;

      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar proveedores");
      const data = await res.json();
      setProveedores(data);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con la base de datos.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateForm = () => {
    if (!form.razon_social.trim()) { setError("La razón social es obligatoria"); return false; }
    if (!form.telefono.trim()) { setError("El teléfono es obligatorio"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing
        ? `${API_BASE}/api/proveedores/${editingId}`
        : `${API_BASE}/api/proveedores`;

      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.error || "Error al guardar el proveedor");
      }

      setSuccess(isEditing ? "Proveedor actualizado" : "Proveedor registrado");
      setForm(estadoInicial);
      setIsEditing(false);
      setEditingId(null);

      if (verDescontinuados) setVerDescontinuados(false);
      else fetchProveedores();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prov) => {
    setForm({
      razon_social: prov.razon_social || "",
      telefono: prov.telefono || "",
      correo: prov.correo || "",
      domicilio: prov.domicilio || ""
    });
    setEditingId(prov.id_proveedor || prov.id);
    setIsEditing(true);
  };

  // SWEETALERT: Cancelar Edición
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

  // SWEETALERT: Dar de Baja
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Dar de baja?',
      text: "El proveedor pasará al directorio de inactivos.",
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
      const res = await fetch(`${API_BASE}/api/proveedores/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al dar de baja");

      setSuccess("Proveedor dado de baja");
      fetchProveedores();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.log(err)
      setError("Error al eliminar proveedor");
      setTimeout(() => setError(null), 3000);
    }
  };

  // SWEETALERT: Reactivar
  const handleReactivate = async (id) => {
    const result = await Swal.fire({
      title: '¿Restaurar proveedor?',
      text: "El proveedor volverá al directorio activo.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#10b981', // Verde
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/proveedores/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: true })
      });

      if (!res.ok) throw new Error("Error al reactivar");

      setSuccess("Proveedor reactivado con éxito");
      fetchProveedores();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.log(err)
      setError("Error al reactivar proveedor");
      setTimeout(() => setError(null), 3000);
    }
  };

  // SWEETALERT: Eliminar Permanente
  const handleHardDelete = async (id) => {
    const result = await Swal.fire({
      title: '¡ADVERTENCIA CRÍTICA!',
      text: "Estás a punto de eliminar permanentemente a este proveedor. Esta acción no se puede deshacer.",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // Rojo fuerte
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, ELIMINAR',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/proveedores/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error("Error al eliminar permanentemente");

      setSuccess("Proveedor eliminado de forma definitiva");
      fetchProveedores();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.log(err)
      setError("Error al eliminar proveedor permanentemente");
      setTimeout(() => setError(null), 3000);
    }
  };

  // SWEETALERT: Logout
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

  return (
    <div className="min-h-screen bg-[#fffbff] flex flex-col overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>

        {/* Desktop */}
        <div className="hidden md:flex gap-6">
          <span
            onClick={() => navigate("/home")}
            className="cursor-pointer hover:text-[#bc004f] transition-colors"
          >
            Inventario
          </span>

          <span
            onClick={() => navigate("/ventas")}
            className="cursor-pointer hover:text-[#bc004f] transition-colors"
          >
            Ventas
          </span>

          <span className="text-[#bc004f] font-bold border-b-2 border-[#bc004f]">
            Proveedores
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => navigate("/alerts")}>
                      <Bell className="text-[#bc004f] hover:text-pink-700 transition-colors" />
                      
                      {alertCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-pulse">
                          {alertCount}
                        </span>
                      )}
                    </div>

          <div ref={menuRef} className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(" ", "+") || "User"
                  }&background=bc004f&color=fff`}
                className="w-9 h-9 rounded-full object-cover"
                alt="Avatar"
              />

              <span className="hidden md:block text-sm font-medium text-gray-700">
                {currentUser?.nombre?.split(" ")[0] || "Usuario"}
              </span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border">

                {/* Info usuario */}
                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-semibold text-gray-800">
                    {currentUser?.nombre || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentUser?.rol || "Rol no definido"}
                  </p>
                </div>

                {/* Móvil */}
                <div className="flex flex-col md:hidden border-b mb-2 pb-2">
                  <button
                    onClick={() => {
                      navigate("/home");
                      setIsMenuOpen(false);
                    }}
                    className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Inventario
                  </button>

                  <button
                    onClick={() => {
                      navigate("/ventas");
                      setIsMenuOpen(false);
                    }}
                    className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Ventas
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex gap-2 p-2 text-red-500 w-full hover:bg-red-50 rounded-lg"
                >
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* NOTIFICACIONES */}
      {error && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-100 text-red-700 p-3 rounded-lg shadow-lg"><AlertTriangle className="inline-block mr-2" size={18}/>{error}</div>}
      {success && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-green-100 text-green-700 p-3 rounded-lg shadow-lg">{success}</div>}

      {/* MAIN */}
      <main className="flex-grow pt-28 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-8" data-aos="fade-down">
          <span className="text-xs text-[#bc004f] font-semibold uppercase tracking-wider">
            {isEditing ? "✏️ EDITAR PROVEEDOR" : "🏢 GESTIÓN DE PROVEEDORES"}
          </span>
          <h1 className="text-4xl font-extrabold mt-2 text-gray-900">
            {isEditing ? "Actualizar Datos" : "Registrar Proveedor"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-full">

          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <section data-aos="fade-right" className="lg:col-span-7 bg-white rounded-2xl p-8 shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[#bc004f]">📋</span> Información de la Empresa
            </h2>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Razón Social *</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="razon_social" value={form.razon_social} onChange={handleChange} placeholder="Ej: Distribuidora Médica S.A. de C.V." className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Teléfono *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 449 123 4567" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="Ej: ventas@distribuidora.com" className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none transition-all" />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Domicilio</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <textarea name="domicilio" value={form.domicilio} onChange={handleChange} rows="3" placeholder="Calle, Número, Colonia, Ciudad..." className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 outline-none transition-all resize-none"></textarea>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} className="px-6 py-3 border-2 border-gray-300 rounded-full font-bold text-gray-700 hover:bg-gray-50">
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={loading} className="px-8 py-3 bg-[#bc004f] text-white rounded-full font-bold hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2">
                  <Save size={18} /> {isEditing ? "Actualizar Proveedor" : "Guardar Proveedor"}
                </button>
              </div>
            </form>
          </section>

          {/* COLUMNA DERECHA: TARJETAS CON SCROLL INDEPENDIENTE */}
          <aside data-aos="fade-left" className="lg:col-span-5 flex flex-col h-[650px]">
            {/* ENCABEZADO CON BOTÓN DE TOGGLE */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <Truck className="text-[#bc004f]" size={20} />
                {verDescontinuados ? "Directorio de Bajas" : "Directorio Activo"}
              </h2>
              <button
                onClick={() => setVerDescontinuados(!verDescontinuados)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${verDescontinuados ? 'bg-gray-800 text-white' : 'bg-pink-100 text-[#bc004f] hover:bg-pink-200'
                  }`}
              >
                <Archive size={14} />
                {verDescontinuados ? 'Ver Activos' : 'Ver Bajas'}
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">

              {proveedores.length === 0 && !loading && (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">
                    {verDescontinuados ? "No hay proveedores dados de baja." : "Aún no hay proveedores registrados."}
                  </p>
                </div>
              )}

              {proveedores.map((prov, index) => (
                <div 
                  key={prov.id_proveedor || prov.id} 
                  data-aos="fade-up" 
                  data-aos-delay={(index % 10) * 50} 
                  className={`group relative p-5 rounded-2xl shadow-sm border hover:shadow-md transition-all overflow-hidden flex flex-col justify-center min-h-[120px] ${verDescontinuados ? 'bg-gray-50 border-gray-300 opacity-80' : 'bg-white border-gray-200'}`}
                >

                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-300 z-10 backdrop-blur-sm">
                    <button onClick={() => handleEdit(prov)} className="bg-white p-3 rounded-full hover:bg-[#bc004f] hover:text-white transition-colors" title="Editar">
                      <Pencil size={18} />
                    </button>

                    {verDescontinuados ? (
                      <>
                        <button onClick={() => handleReactivate(prov.id_proveedor || prov.id)} className="bg-white p-3 rounded-full hover:bg-green-500 hover:text-white transition-colors" title="Restaurar proveedor">
                          <RefreshCw size={18} />
                        </button>
                        <button onClick={() => handleHardDelete(prov.id_proveedor || prov.id)} className="bg-white p-3 rounded-full hover:bg-red-900 hover:text-white transition-colors" title="Eliminar de forma permanente">
                          <AlertTriangle size={18} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleDelete(prov.id_proveedor || prov.id)} className="bg-white p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors" title="Dar de baja">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="relative z-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-lg truncate pr-8">{prov.razon_social}</h3>
                      {verDescontinuados && <span className="bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">INACTIVO</span>}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 mt-2 pt-2 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                        <Phone size={14} className="text-gray-400" /> {prov.telefono}
                      </p>
                      {prov.correo && (
                        <p className="text-sm text-gray-600 flex items-center gap-1 truncate max-w-[200px]">
                          <Mail size={14} className="text-gray-400" /> {prov.correo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

        </div>
      </main>

      <footer className="w-full mt-auto bg-white border-t border-gray-200 flex items-center justify-center px-12 py-8 mt-12">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">© 2026 Farmacia Médica Rincón.</p>
      </footer>
    </div>
  );
};

export default Proveedores;