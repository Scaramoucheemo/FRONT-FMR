import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, LogOut, Save, Package, Truck, Calendar, Hash,
  ClipboardList, AlertCircle, Pencil, Trash2, Archive,
  AlertTriangle, PlusCircle, ChevronDown
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- COMPONENTE SELECT PERSONALIZADO ---
const CustomDropdown = ({ value, options, onChange, onAddNew, placeholder, addNewText, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(o => o.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 text-left flex justify-between items-center outline-none focus:outline-none focus:ring-0 transition-all duration-300 ${isOpen ? "border-[#FA8072] bg-white" : "border-transparent hover:border-[#FA8072]/50"
          }`}
      >
        <div className="flex items-center gap-2 truncate">
          <Icon className="absolute left-3 text-gray-400" size={18} />
          <span className={selectedOption ? "text-gray-900" : "text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <div className={`absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 transform origin-top ${isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-95 pointer-events-none"
        }`}>
        <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => { onChange(opt.id); setIsOpen(false); }}
              className="group flex flex-col p-3 rounded-xl hover:bg-[#FA8072]/10 cursor-pointer transition-colors"
            >
              <span className="font-bold text-gray-800 group-hover:text-[#FA8072]">{opt.label}</span>
              {opt.subLabel && <span className="text-xs text-gray-400">{opt.subLabel}</span>}
            </div>
          ))}
          {options.length === 0 && <p className="text-sm text-gray-400 p-3 text-center">No hay opciones disponibles</p>}
        </div>

        <div className="border-t border-gray-100 bg-gray-50 p-2">
          <button
            type="button"
            onClick={() => { onAddNew(); setIsOpen(false); }}
            className="flex items-center justify-center gap-2 w-full p-3 text-[#bc004f] hover:bg-[#bc004f]/10 rounded-xl font-bold transition-colors"
          >
            <PlusCircle size={18} /> {addNewText}
          </button>
        </div>
      </div>
    </div>
  );
};
// -------------------------------------------------------------

const Lotes = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [lotes, setLotes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);

  // AHORA ESTA VARIABLE CONTROLA SI VEMOS ACTIVOS O AGOTADOS (CANTIDAD 0)
  const [verAgotados, setVerAgotados] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const estadoInicial = {
    id_producto: "",
    id_proveedor: "",
    codigo_lote_fisico: "",
    cantidad: "",
    fecha_caducidad: "",
    factura: "",
    observaciones: ""
  };

  const [form, setForm] = useState(estadoInicial);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      if (parsedUser.rol !== "Administrador") {
        alert("Acceso denegado.");
        navigate("/home");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchDatos();
  }, [verAgotados]);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      // Cambiamos a la query "agotados"
      const endpointLotes = verAgotados
        ? `${API_BASE}/api/lotes?agotados=true`
        : `${API_BASE}/api/lotes`;

      const [resLotes, resProductos, resProveedores] = await Promise.all([
        fetch(endpointLotes, { headers }),
        fetch(`${API_BASE}/api/productos`, { headers }),
        fetch(`${API_BASE}/api/proveedores`, { headers })
      ]);

      if (resLotes.ok) setLotes(await resLotes.json());
      if (resProductos.ok) setProductos(await resProductos.json());
      if (resProveedores.ok) setProveedores(await resProveedores.json());

    } catch (err) {
      setError("Error al cargar la información del servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validateForm = () => {
    if (!form.id_producto) { setError("Selecciona un producto"); return false; }
    if (!form.id_proveedor) { setError("Selecciona un proveedor"); return false; }
    if (!form.codigo_lote_fisico.trim()) { setError("El código físico es obligatorio"); return false; }
    if (form.cantidad === "") { setError("La cantidad es obligatoria"); return false; }
    if (!isEditing && form.cantidad <= 0) { setError("La cantidad de un lote nuevo debe ser mayor a 0"); return false; }
    if (!form.fecha_caducidad) { setError("La fecha de caducidad es obligatoria"); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true); setError(null);

    try {
      const token = localStorage.getItem("token");
      const url = isEditing ? `${API_BASE}/api/lotes/${editingId}` : `${API_BASE}/api/lotes`;

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ ...form, cantidad: parseInt(form.cantidad) })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || "Error al registrar el lote");

      setSuccess(isEditing ? "Lote actualizado" : "Lote ingresado al inventario con éxito");
      setForm(estadoInicial);
      setIsEditing(false); setEditingId(null);

      fetchDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message); setTimeout(() => setError(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lote) => {
    setForm({
      id_producto: lote.id_producto || "",
      id_proveedor: lote.id_proveedor || "",
      codigo_lote_fisico: lote.codigo_lote_fisico || "",
      cantidad: lote.cantidad?.toString() || "0",
      fecha_caducidad: lote.fecha_caducidad ? lote.fecha_caducidad.split('T')[0] : "",
      factura: lote.factura || "",
      observaciones: lote.observaciones || ""
    });

    // BLINDAJE: Atrapamos la PK no importa cómo la haya mapeado Sequelize
    const idReal = lote.id_registro_lote || lote.id_lote || lote.id;
    setEditingId(idReal);
    setIsEditing(true);
  };

  // ELIMINACIÓN PERMANENTE (Solo disponible si está agotado)
  const handleHardDelete = async (id) => {
    if (!window.confirm("⚠️ ¿Eliminar el lote PERMANENTEMENTE del historial? Esta acción destruirá el registro para siempre.")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/lotes/${id}`, {
        method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      setSuccess("Registro de lote destruido exitosamente");
      fetchDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message); setTimeout(() => setError(null), 5000);
    }
  };

  const handleLogout = () => {
    if (window.confirm("¿Cerrar sesión?")) {
      localStorage.clear(); navigate("/login");
    }
  };

  const getEstadoCaducidad = (fechaStr) => {
    const caducidad = new Date(fechaStr);
    const hoy = new Date();
    const diferenciaMeses = (caducidad - hoy) / (1000 * 60 * 60 * 24 * 30);
    if (diferenciaMeses < 0) return { texto: "CADUCADO", color: "bg-red-600 text-white" };
    if (diferenciaMeses <= 3) return { texto: "PRÓXIMO A VENCER", color: "bg-orange-500 text-white" };
    return { texto: "VIGENTE", color: "bg-green-500 text-white" };
  };

  // Preparamos las opciones para nuestros Dropdowns 
  // Ahora muestra TODOS los productos, sin restricciones.
  const opcionesProductos = productos.map(p => ({
    id: p.id_producto,
    label: p.nombre_comercial,
    subLabel: `Código: ${p.codigo_barras}`
  }));

  const opcionesProveedores = proveedores.map(p => ({
    id: p.id_proveedor,
    label: p.razon_social,
    subLabel: p.telefono
  }));

  // Input Base unificado sin bordes azules nativos
  const inputClass = "w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent outline-none focus:outline-none focus:ring-0 focus:border-[#FA8072] hover:border-[#FA8072]/50 transition-all duration-300";

  return (
    <div className="min-h-screen bg-[#fffbff] flex flex-col">
    
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>

        {/* Opciones en pantallas medianas en adelante */}
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
            Registro de Lotes
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell
            onClick={() => navigate("/alerts")}
            className="cursor-pointer hover:text-[#bc004f] transition-colors"
          />

          <div ref={menuRef} className="relative">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(" ", "+") || "User"}&background=bc004f&color=fff`}
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

                {/* Opciones SOLO en móvil */}
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

                {/* Cerrar sesión */}
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
      <main className="flex-grow pt-28 px-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <span className="text-xs text-[#bc004f] font-semibold uppercase tracking-wider">
            {isEditing ? "✏️ GESTIÓN DE CORRECCIONES" : "📦 GESTIÓN DE INVENTARIO"}
          </span>
          <h1 className="text-4xl font-extrabold mt-2 text-gray-900">
            {isEditing ? "Editar Registro de Lote" : "Ingreso de Lotes"}
          </h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-full">

          {/* FORMULARIO */}
          <section className="lg:col-span-5 bg-white rounded-2xl p-8 shadow-sm border border-gray-200 h-fit">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[#bc004f]">📋</span> Datos de la Mercancía
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Producto Vinculado *</label>
                <CustomDropdown
                  icon={Package}
                  value={form.id_producto}
                  options={opcionesProductos}
                  onChange={(val) => setForm(f => ({ ...f, id_producto: val }))}
                  onAddNew={() => navigate("/agregar", { state: { tipo: "producto" } })}
                  placeholder="Seleccione un producto..."
                  addNewText="Agregar nuevo producto al catálogo"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Proveedor *</label>
                <CustomDropdown
                  icon={Truck}
                  value={form.id_proveedor}
                  options={opcionesProveedores}
                  onChange={(val) => setForm(f => ({ ...f, id_proveedor: val }))}
                  onAddNew={() => navigate("/proveedores")}
                  placeholder="Seleccione un proveedor..."
                  addNewText="Registrar nuevo proveedor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Código Lote *</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input name="codigo_lote_fisico" value={form.codigo_lote_fisico} onChange={handleChange} placeholder="Ej: L-8899" className={inputClass} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Cantidad *</label>
                  <div className="relative">
                    <input type="number" min="0" name="cantidad" value={form.cantidad} onChange={handleChange} placeholder="Unidades" className={inputClass} />
                  </div>
                  {isEditing && <p className="text-[10px] text-gray-400 mt-1">Guardar en 0 pasará al historial</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Fecha de Caducidad *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="date" name="fecha_caducidad" value={form.fecha_caducidad} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Folio de Factura (Opcional)</label>
                <div className="relative">
                  <input name="factura" value={form.factura} onChange={handleChange} placeholder="Número de factura" className={`pl-4 ${inputClass}`} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Observaciones (Opcional)</label>
                <textarea name="observaciones" value={form.observaciones} onChange={handleChange} rows="2" placeholder="Detalles de la entrega..." className={`pl-4 resize-none ${inputClass}`}></textarea>
              </div>

              <div className="flex justify-end mt-2 gap-4">
                {isEditing && (
                  <button type="button" onClick={() => { setForm(estadoInicial); setIsEditing(false); }} className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-50 outline-none focus:outline-none">
                    Cancelar
                  </button>
                )}
                <button type="submit" disabled={loading} className="w-full py-3 bg-[#bc004f] text-white rounded-xl font-bold hover:bg-pink-700 disabled:opacity-50 flex justify-center items-center gap-2 outline-none focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all">
                  <Save size={18} /> {isEditing ? "Actualizar Lote" : "Ingresar Lote"}
                </button>
              </div>
            </form>
          </section>

          {/* TARJETAS DE LOTES */}
          <aside className="lg:col-span-7 flex flex-col h-[750px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                <ClipboardList className="text-[#bc004f]" size={20} />
                {verAgotados ? "Historial de Lotes Agotados" : "Lotes Activos en Inventario"}
              </h2>
              <button
                onClick={() => setVerAgotados(!verAgotados)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors outline-none focus:outline-none ${verAgotados ? 'bg-gray-800 text-white' : 'bg-[#FA8072]/10 text-[#FA8072] hover:bg-[#FA8072]/20'
                  }`}
              >
                <Archive size={14} />
                {verAgotados ? 'Ver Inventario Activo' : 'Ver Agotados'}
              </button>
            </div>

            <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar pb-10">

              {lotes.length === 0 && !loading && (
                <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                  <p className="text-gray-500">
                    {verAgotados ? "No hay registros históricos de lotes agotados." : "El inventario de lotes está vacío."}
                  </p>
                </div>
              )}

              {lotes.map(lote => {
                const imgSource = lote.Producto?.imagen
                  ? `${API_BASE}/uploads/${lote.Producto.imagen}`
                  : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae";

                const estado = getEstadoCaducidad(lote.fecha_caducidad);

                return (
                  <div key={lote.id_registro_lote || lote.id} className={`group relative p-4 rounded-2xl shadow-sm border flex items-center gap-5 transition-all overflow-hidden ${verAgotados ? 'bg-gray-50 border-gray-300 opacity-80' : 'bg-white border-gray-200 hover:shadow-md hover:border-[#FA8072]/30'}`}>

                    {/* ACCIONES HOVER */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-opacity duration-300 z-10 backdrop-blur-sm">
                      <button onClick={() => handleEdit(lote)} className="bg-white p-3 rounded-full hover:bg-[#FA8072] hover:text-white transition-colors outline-none focus:outline-none" title="Editar / Corregir Cantidad">
                        <Pencil size={18} />
                      </button>

                      {verAgotados && (
                        <button onClick={() => handleHardDelete(lote.id_registro_lote || lote.id)} className="bg-white p-3 rounded-full hover:bg-red-600 hover:text-white transition-colors outline-none focus:outline-none" title="Eliminar del historial permanentemente">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>

                    <div className="w-24 h-24 bg-white rounded-xl flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 relative z-0">
                      <img src={imgSource} className={`max-w-full max-h-full object-contain mix-blend-multiply ${verAgotados ? 'grayscale' : ''}`} alt="Producto" />
                    </div>

                    <div className="flex-grow min-w-0 relative z-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-900 text-base truncate pr-2">
                          {lote.Producto?.nombre_comercial || "Producto desconocido"}
                        </h3>
                        {verAgotados ? (
                          <span className="bg-gray-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">AGOTADO</span>
                        ) : (
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${estado.color}`}>{estado.texto}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Hash size={14} className="text-gray-400" /> <span className="font-semibold">Lote:</span> {lote.codigo_lote_fisico}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Package size={14} className={verAgotados ? "text-gray-400" : "text-[#FA8072]"} />
                          <span className={`font-semibold ${verAgotados ? "text-gray-400" : "text-gray-800"}`}>
                            {lote.cantidad} uds
                          </span>
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Calendar size={14} className="text-gray-400" /> <span className="font-semibold">Caduca:</span> {new Date(lote.fecha_caducidad).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 truncate" title={lote.Proveedor?.razon_social}>
                          <Truck size={14} className="text-gray-400" /> <span className="font-semibold">Prov:</span> {lote.Proveedor?.razon_social || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
};

export default Lotes;