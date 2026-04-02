import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Scan, X, Save } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Agregar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;
  const isEditing = !!product;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const menuRef = useRef(null);

  // 1. Estado alineado EXACTAMENTE con el modelo de Sequelize
  const [form, setForm] = useState({
    codigo_barras: product?.codigo_barras || "",
    nombre_comercial: product?.nombre_comercial || "",
    sustancia_activa: product?.sustancia_activa || "",
    precio_costo: product?.precio_costo || "",
    precio_venta: product?.precio_venta || "",
    presentacion: product?.presentacion || "",
    requiere_receta: product?.requiere_receta || false
  });

  // Cargar usuario actual (simplificado para leer del localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoadingUser(false);
  }, []);

  // INIT SCANNER
  useEffect(() => {
    try {
      codeReader.current = new BrowserMultiFormatReader();
    } catch (err) {
      console.error("Error al inicializar escáner:", err);
    }

    return () => {
      if (codeReader.current) {
        try { codeReader.current.reset(); } catch (e) { console.error(e); }
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try { videoRef.current.srcObject.getTracks().forEach(track => track.stop()); } catch (e) { }
      }
    };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);

      // Si el rol no es Administrador, lo pateamos de vuelta al Home
      if (parsedUser.rol !== "Administrador") {
        alert("Acceso denegado. Solo los administradores pueden gestionar productos.");
        navigate("/home");
      }
    } else {
      navigate("/login");
    }
    setLoadingUser(false);
  }, [navigate]);

  // SCANNER
  const startScanner = () => {
    setIsScannerOpen(true);
    let yaEscaneado = false; // 🔒 Nuestro candado

    setTimeout(() => {
      if (!videoRef.current || !codeReader.current) return;
      try {
        codeReader.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err) => {
            // Solo entra si hay resultado Y el candado está abierto
            if (result && !yaEscaneado) {
              yaEscaneado = true; // 🔒 Cerramos el candado inmediatamente
              const code = result.getText();
              console.error(err);
              setForm((f) => ({ ...f, codigo_barras: code }));
              setSuccess(`Código escaneado: ${code}`);
              setTimeout(() => setSuccess(null), 3000);

              stopScanner();
            }
          }
        );
      } catch (err) {
        console.error(err);
        setError("Error al iniciar la cámara. Verifica los permisos.");
        setIsScannerOpen(false);
      }
    }, 300);
  };

  const stopScanner = () => {
    if (codeReader.current && typeof codeReader.current.reset === 'function') {
      try { codeReader.current.reset(); } catch (e) { console.error(e); }
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null; // Liberar la memoria de video
      } catch (e) { console.error(e); }
    }
    setIsScannerOpen(false);
  };

  // IMAGEN
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Por favor, selecciona una imagen válida");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe exceder los 5MB");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // Validar formulario
  const validateForm = () => {
    if (!form.codigo_barras.trim()) { setError("El código de barras es obligatorio"); return false; }
    if (!form.nombre_comercial.trim()) { setError("El nombre comercial es obligatorio"); return false; }
    if (!form.presentacion.trim()) { setError("La presentación es obligatoria"); return false; }
    if (!form.precio_costo || form.precio_costo <= 0) { setError("El precio de costo debe ser mayor a 0"); return false; }
    if (!form.precio_venta || form.precio_venta <= 0) { setError("El precio de venta debe ser mayor a 0"); return false; }
    return true;
  };

  // GUARDAR
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();

      // Agregar campos del formulario a FormData
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.append(k, v);
        }
      });

      if (imageFile) formData.append("imagen", imageFile);

      // Asegúrate de que tu ruta base sea /api/productos en el backend
      const url = isEditing
        ? `${API_BASE}/api/productos/${product.id_producto}`
        : `${API_BASE}/api/productos`;

      const method = isEditing ? "PUT" : "POST";
      const token = localStorage.getItem('token');

      const res = await fetch(url, {
        method,
        // OJO: No definimos Content-Type porque el navegador lo asigna automáticamente al usar FormData
        headers: {
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Error HTTP: ${res.status}`);
      }

      setSuccess(isEditing ? "Producto actualizado correctamente" : "Producto guardado correctamente");
      setTimeout(() => navigate("/home"), 1500);

    } catch (err) {
      console.error("Error al guardar:", err);
      setError(err.message || "Error al guardar el producto");
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
            {isEditing ? "Editar Producto" : "Agregar Productos"}
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

                {/* 🔽 Opciones SOLO en móvil */}
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

      {/* SCANNER MODAL */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md">
            <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline />
            <button onClick={stopScanner} className="absolute top-3 right-3 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors">
              ✕ Cerrar
            </button>
            <div className="absolute inset-0 border-2 border-white/30 rounded-xl pointer-events-none"></div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              Escanea el código de barras del producto
            </div>
          </div>
        </div>
      )}

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
            {isEditing ? "✏️ EDITAR PRODUCTO" : "➕ NUEVO PRODUCTO"}
          </span>
          <h1 className="text-4xl font-extrabold mt-2 text-gray-900">
            {isEditing ? "Editar Producto" : "Agregar Producto"}
          </h1>
          <p className="text-gray-500 mt-2">
            {isEditing ? "Actualiza la información del producto." : "Registra medicamentos al catálogo."}
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* FORMULARIO ADAPTADO AL MODELO */}
          <section className="lg:col-span-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[#bc004f]">📋</span> Información del Producto
            </h2>

            <div className="grid md:grid-cols-2 gap-6">

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Código de barras *
                </label>
                <div className="flex gap-3">
                  <input
                    name="codigo_barras"
                    value={form.codigo_barras}
                    onChange={handleChange}
                    placeholder="Ej: 7501234567890"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                  />
                  <button onClick={startScanner} className="bg-[#bc004f] text-white px-6 rounded-xl hover:bg-pink-700 transition-colors flex items-center gap-2" type="button">
                    <Scan size={20} /> <span className="hidden sm:inline">Escanear</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Nombre comercial *
                </label>
                <input
                  name="nombre_comercial"
                  value={form.nombre_comercial}
                  onChange={handleChange}
                  placeholder="Ej: Aspirina"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Sustancia activa
                </label>
                <input
                  name="sustancia_activa"
                  value={form.sustancia_activa}
                  onChange={handleChange}
                  placeholder="Ej: Ácido Acetilsalicílico"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Presentación *
                </label>
                <input
                  name="presentacion"
                  value={form.presentacion}
                  onChange={handleChange}
                  placeholder="Ej: Caja con 20 tabletas"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Precio Costo * (MXN)
                </label>
                <input
                  type="number"
                  name="precio_costo"
                  value={form.precio_costo}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Precio Venta * (MXN)
                </label>
                <input
                  type="number"
                  name="precio_venta"
                  value={form.precio_venta}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-3 mt-2 bg-pink-50 p-4 rounded-xl border border-pink-100">
                <input
                  type="checkbox"
                  id="receta"
                  name="requiere_receta"
                  checked={form.requiere_receta}
                  onChange={handleChange}
                  className="w-5 h-5 text-[#bc004f] rounded focus:ring-[#bc004f]"
                />
                <label htmlFor="receta" className="font-bold text-gray-700 cursor-pointer">
                  Este medicamento requiere receta médica para su venta (Antibióticos, controlados, etc.)
                </label>
              </div>

            </div>
          </section>

          {/* SECCIÓN IMAGEN INTACTA */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-[#bc004f]">🖼️</span> Imagen del Producto
              </h2>

              <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#bc004f] transition-colors">
                <input type="file" onChange={handleImage} accept="image/*" hidden />

                {preview ? (
                  <div className="relative">
                    <img src={preview} className="rounded-xl w-full object-cover max-h-64" alt="Preview" />
                    <button onClick={(e) => { e.preventDefault(); setImageFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600">
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500 py-12">
                    <div className="text-5xl mb-3">📷</div>
                    <p className="mt-2 text-sm">Haz clic para subir una imagen</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF (max 5MB)</p>
                  </div>
                )}
              </label>

              {!preview && product?.imagen && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Imagen actual:</p>
                  <img src={product.imagen} className="rounded-xl w-full object-cover max-h-32" alt="Current" />
                </div>
              )}
            </div>
          </aside>

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-10 pb-10">
          <button onClick={handleCancel} className="px-8 py-3 border-2 border-gray-300 rounded-full font-bold text-gray-700 hover:bg-gray-50" disabled={loading}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-[#bc004f] text-white rounded-full font-bold hover:bg-pink-700 disabled:opacity-50 flex items-center gap-2">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={18} />}
            {isEditing ? "Actualizar Producto" : "Guardar Producto"}
          </button>
        </div>

      </main>

      <footer className="w-full mt-auto bg-white border-t border-gray-200 flex items-center justify-center px-12 py-8 mt-12">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">© 2026 Farmacia Médica Rincón.</p>
      </footer>
    </div>
  );
};

export default Agregar;