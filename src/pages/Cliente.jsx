import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAlerts } from "../Components/useAlert";
import Swal from 'sweetalert2';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  Bell, LogOut, Save, Users, CreditCard, Phone, Mail,
  User, Pencil, Trash2, Archive, RefreshCw, AlertTriangle,
  AlertCircle, Search, ClipboardList, X
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";



const Clientes = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const alertCount = useAlerts();
  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [verDescontinuados, setVerDescontinuados] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [busqueda, setBusqueda] = useState("");

  const estadoInicial = {
    nombre: "",
    apellido: "",
    identificacion: "",
    telefono: "",
    correo: ""
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
      if (parsedUser.rol !== "Administrador" && parsedUser.rol !== "Vendedor") {
        Swal.fire({
          icon: 'error',
          title: 'Acceso Denegado',
          text: 'No tienes los permisos necesarios para acceder a este módulo.',
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
    fetchClientes();
  }, [verDescontinuados]);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const endpoint = verDescontinuados
        ? `${API_BASE}/api/clientes?inactivos=true`
        : `${API_BASE}/api/clientes`;

      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al cargar clientes");
      const data = await res.json();
      setClientes(data);
    } catch (err) {
      setError("No se pudo conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateForm = () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return false; }
    if (!form.identificacion.trim()) { setError("La CURP / Identificación es obligatoria"); return false; }
    if (form.correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.correo)) { setError("Ingrese un correo válido"); return false; }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true); setError(null);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing ? `${API_BASE}/api/clientes/${editingId}` : `${API_BASE}/api/clientes`;
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form)
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Error al procesar el cliente");

      setSuccess(isEditing ? "Expediente actualizado" : "Cliente registrado exitosamente");
      setForm(estadoInicial);
      setIsEditing(false); setEditingId(null);
      if (verDescontinuados) setVerDescontinuados(false); else fetchClientes();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message); setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cliente) => {
    setForm({
      nombre: cliente.nombre || "",
      apellido: cliente.apellido || "",
      identificacion: cliente.identificacion || "",
      telefono: cliente.telefono || "",
      correo: cliente.correo || ""
    });
    setEditingId(cliente.id_cliente || cliente.id);
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
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Dar de baja?',
      text: "El cliente pasará al directorio de inactivos.",
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
      const res = await fetch(`${API_BASE}/api/clientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ estado: false })
      });
      if (!res.ok) throw new Error();
      setSuccess("Cliente dado de baja"); fetchClientes(); setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError("Error al desactivar cliente"); setTimeout(() => setError(null), 3000); }
  };

  const handleReactivate = async (id) => {
    const result = await Swal.fire({
      title: '¿Restaurar cliente?',
      text: "El cliente volverá al directorio activo.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/clientes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ estado: true })
      });
      if (!res.ok) throw new Error();
      setSuccess("Cliente restaurado"); fetchClientes(); setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError("Error al restaurar"); setTimeout(() => setError(null), 3000); }
  };

  const handleHardDelete = async (id) => {
    const result = await Swal.fire({
      title: '¡ADVERTENCIA CRÍTICA!',
      text: "Estás a punto de eliminar permanentemente a este cliente. Esta acción no se puede deshacer.",
      icon: 'error',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, ELIMINAR',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/clientes/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al eliminar");
      setSuccess("Expediente destruido"); fetchClientes(); setTimeout(() => setSuccess(null), 3000);
    } catch (err) { setError(err.message); setTimeout(() => setError(null), 5000); }
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

  const clientesFiltrados = clientes.filter(cli => {
    const termino = busqueda.toLowerCase();
    const nombreCompleto = `${cli.nombre} ${cli.apellido || ""}`.toLowerCase();
    const curp = (cli.identificacion || "").toLowerCase();
    return nombreCompleto.includes(termino) || curp.includes(termino);
  });

  // --- COMPONENTE: HISTORIAL VISUAL (Conectado al Backend) ---
  const HistorialDropdown = ({ clienteId, clienteNombre }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [historial, setHistorial] = useState([]);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Función para obtener el historial real del cliente al abrir el dropdown
    const fetchHistorialCliente = async () => {
      if (isOpen) {
        setIsOpen(false);
        return;
      }

      setIsOpen(true);
      if (historial.length > 0) return; // Si ya lo cargamos, no lo volvemos a pedir

      setCargandoHistorial(true);
      try {
        const token = localStorage.getItem("token");
        // Traemos TODAS las ventas
        const res = await fetch(`${API_BASE}/api/ventas`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al obtener ventas");
        const todasLasVentas = await res.json();

        // Filtramos: 
        // 1. Que la venta sea de este cliente
        // 2. Extraemos solo los detalles de productos controlados
        const historialControlado = [];


        todasLasVentas.forEach(venta => {
          const detalles = venta.DetalleVentas || venta.detalle_ventas || venta.DetalleVenta || [];
          if (venta.id_cliente === clienteId && detalles.length > 0) {
            detalles.forEach(detalle => {
              // Si el detalle tiene requiere_control en true, lo agregamos al historial
              if (detalle.requiere_control) {
                historialControlado.push({
                  fecha: new Date(venta.fecha_venta).toLocaleDateString(),
                  folio_receta: venta.folio_receta || "S/R",
                  doctor: venta.Doctor ? `Dr. ${venta.Doctor.nombre} ${venta.Doctor.apellido}` : "Desconocido",
                  producto: detalle.Producto?.nombre_comercial || "Producto desconocido",
                  cantidad: detalle.cantidad
                });
              }
            });
          }
        });

        setHistorial(historialControlado);
      } catch (err) {
        console.error("Error cargando historial:", err);
      } finally {
        setCargandoHistorial(false);
      }
    };

    return (
      <div className="relative h-full w-full" ref={dropdownRef}>
        <button
          onClick={fetchHistorialCliente}
          className={`h-full w-full flex flex-col items-center justify-center gap-1 rounded-2xl border-2 transition-all duration-300 outline-none focus:outline-none ${isOpen
              ? "bg-[#FA8072] text-white border-[#FA8072] shadow-md"
              : "bg-white text-gray-400 border-dashed border-gray-200 hover:border-[#FA8072] hover:text-[#FA8072] hover:bg-[#FA8072]/5"
            }`}
        >
          <ClipboardList size={28} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-center mt-1">
            Historial
          </span>
        </button>

        <div className={`absolute right-0 top-full z-50 w-80 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-200 transform origin-top-right ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}>
          <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-2">
              <ClipboardList size={14} /> Historial de Antibióticos
            </span>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={16} /></button>
          </div>

          <div className="max-h-64 overflow-y-auto p-4 custom-scrollbar">
            {cargandoHistorial ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#bc004f] mx-auto mb-2"></div>
                <p className="text-xs text-gray-500">Consultando recetas...</p>
              </div>
            ) : historial.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500 mb-3">Aún no hay compras de antibióticos registradas para <b>{clienteNombre}</b>.</p>
                <div className="w-16 h-1 bg-gray-200 rounded-full mx-auto"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {historial.map((item, idx) => (
                  <div key={idx} className="bg-pink-50 p-3 rounded-xl border border-pink-100">
                    <p className="font-bold text-sm text-[#bc004f]">{item.producto} <span className="text-gray-500 font-normal text-xs">(x{item.cantidad})</span></p>
                    <div className="mt-2 text-xs text-gray-600 grid grid-cols-2 gap-1">
                      <p><b>Fecha:</b> {item.fecha}</p>
                      <p><b>Folio:</b> {item.folio_receta}</p>
                      <p className="col-span-2"><b>Atendió:</b> {item.doctor}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  // -----------------------------------------------

  const isAdmin = currentUser?.rol === "Administrador";
  const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent outline-none focus:outline-none focus:ring-0 focus:border-[#FA8072] hover:border-[#FA8072]/50 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#fffbff] flex flex-col overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-4 sm:px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-sm sm:text-lg truncate">
          Farmacia Médica Rincón
        </h1>

        {/* DESKTOP */}
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
            Directorio de Clientes
          </span>
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* ALERTAS */}
          <div
            className="relative cursor-pointer"
            onClick={() => navigate("/alerts")}
          >
            <Bell className="text-[#bc004f]" />
            {alertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {alertCount}
              </span>
            )}
          </div>

          {/* USER */}
          <div ref={menuRef} className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(
                  " ",
                  "+"
                ) || "User"}&background=bc004f&color=fff`}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full"
              />

              <span className="hidden md:block text-sm">
                {currentUser?.nombre?.split(" ")[0] || "Usuario"}
              </span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border z-50">

                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-semibold">{currentUser?.nombre}</p>
                  <p className="text-xs text-gray-500">{currentUser?.rol}</p>
                </div>

                {/* MOBILE MENU */}
                <div className="flex flex-col md:hidden border-b mb-2 pb-2">
                  <button
                    onClick={() => { navigate("/home"); setIsMenuOpen(false); }}
                    className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Inventario
                  </button>

                  <button
                    onClick={() => { navigate("/ventas"); setIsMenuOpen(false); }}
                    className="text-left px-3 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    Ventas
                  </button>
                </div>

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
      {error && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-100 text-red-700 p-3 rounded-lg shadow-lg flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
      {success && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-green-100 text-green-700 p-3 rounded-lg shadow-lg">{success}</div>}

      {/* MAIN */}
      <main className="flex-grow pt-24 sm:pt-28 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="mb-8" data-aos="fade-down">
          <span className="text-xs text-[#bc004f] font-semibold uppercase tracking-wider">
            {isEditing ? "✏️ ACTUALIZAR EXPEDIENTE" : "👤 GESTIÓN DE CLIENTES"}
          </span>
          <h1 className="text-4xl font-extrabold mt-2 text-gray-900">
            {isEditing ? "Editar Cliente" : "Registro de Clientes"}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* COLUMNA IZQUIERDA: FORMULARIO */}
          <section data-aos="fade-right" className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-8 ... shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[#bc004f]">📋</span> Datos Personales
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Nombre(s) *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Juan" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Apellido(s)</label>
                  <div className="relative">
                    <input name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej: Pérez" className={`pl-4 ${inputClass}`} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">CURP / Identificación *</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="identificacion" value={form.identificacion} onChange={handleChange} placeholder="Ej: VECJ991202..." className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Teléfono</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input name="telefono" value={form.telefono} onChange={handleChange} placeholder="Ej: 449 123 4567" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="email" name="correo" value={form.correo} onChange={handleChange} placeholder="Ej: cliente@correo.com" className={inputClass} />
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-4">
                {isEditing && (
                  <button type="button" onClick={handleCancelEdit} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 outline-none focus:outline-none">
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#bc004f] text-white rounded-xl font-bold hover:bg-pink-700 disabled:opacity-50 flex justify-center items-center gap-2 outline-none focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all">
                  <Save size={18} /> {isEditing ? "Actualizar Cliente" : "Guardar Cliente"}
                </button>
              </div>
            </form>
          </section>

          {/* COLUMNA DERECHA: DIRECTORIO */}
          <aside data-aos="fade-left" className="lg:col-span-7 flex flex-col h-[750px]">

            <div className="flex flex-col gap-4 mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <Users className="text-[#bc004f]" size={20} />
                  {verDescontinuados ? "Directorio de Bajas" : "Directorio Activo"}
                </h2>

                <button
                  onClick={() => setVerDescontinuados(!verDescontinuados)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors outline-none focus:outline-none ${verDescontinuados ? 'bg-gray-800 text-white' : 'bg-[#FA8072]/10 text-[#FA8072] hover:bg-[#FA8072]/20'
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
                  placeholder="Buscar por nombre o CURP..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white shadow-sm rounded-xl border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-[#FA8072] transition-colors"
                />
              </div>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">

              {clientesFiltrados.length === 0 && !loading && (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">
                    {busqueda ? "No se encontraron clientes con esa búsqueda." : (verDescontinuados ? "No hay clientes dados de baja." : "No hay clientes registrados en el sistema.")}
                  </p>
                </div>
              )}

              {clientesFiltrados.map((cli, index) => (
                <div
                  key={cli.id_cliente || cli.id}
                  data-aos="fade-up"
                  data-aos-delay={(index % 10) * 50}
                  className="flex items-stretch gap-3"
                >

                  {/* BLOQUE IZQUIERDO: Tarjeta Principal */}
                  <div className={`flex-grow group relative p-5 rounded-2xl shadow-sm border flex flex-col justify-center min-h-[120px] transition-all overflow-hidden ${verDescontinuados ? 'bg-gray-50 border-gray-300 opacity-80' : 'bg-white border-gray-200 hover:shadow-md hover:border-[#FA8072]/30'}`}>

                    {/* ACCIONES HOVER (Solo visibles para el Administrador) */}
                    {isAdmin && (
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-300 z-10 backdrop-blur-sm rounded-2xl">
                        <button onClick={() => handleEdit(cli)} className="bg-white p-3 rounded-full hover:bg-[#FA8072] hover:text-white transition-colors outline-none focus:outline-none" title="Editar expediente">
                          <Pencil size={18} />
                        </button>

                        {verDescontinuados ? (
                          <>
                            <button onClick={() => handleReactivate(cli.id_cliente || cli.id)} className="bg-white p-3 rounded-full hover:bg-green-500 hover:text-white transition-colors outline-none focus:outline-none" title="Restaurar cliente">
                              <RefreshCw size={18} />
                            </button>
                            <button onClick={() => handleHardDelete(cli.id_cliente || cli.id)} className="bg-white p-3 rounded-full hover:bg-red-900 hover:text-white transition-colors outline-none focus:outline-none" title="Eliminar de forma permanente">
                              <AlertTriangle size={18} />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleDelete(cli.id_cliente || cli.id)} className="bg-white p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors outline-none focus:outline-none" title="Dar de baja">
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="relative z-0">
                      <div className="flex justify-between items-start">
                        <div className="pr-4">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {cli.nombre} {cli.apellido}
                          </h3>
                          {verDescontinuados && <span className="inline-block mt-1 bg-gray-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">INACTIVO</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 mt-3 pt-3 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                          <CreditCard size={14} className="text-[#FA8072]" /> {cli.identificacion}
                        </p>
                        {cli.telefono && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone size={14} className="text-gray-400" /> {cli.telefono}
                          </p>
                        )}
                        {cli.correo && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 truncate max-w-[200px]">
                            <Mail size={14} className="text-gray-400" /> {cli.correo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* BLOQUE DERECHO: Botón Historial adaptado a la altura */}
                  <div className="w-28 flex-shrink-0">
                    <HistorialDropdown
                      clienteId={cli.id_cliente || cli.id}
                      clienteNombre={`${cli.nombre} ${cli.apellido || ''}`}
                    />
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

export default Clientes;