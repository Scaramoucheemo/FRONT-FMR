import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, User, LogOut, Scan, X, Plus, Minus, Save } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const API_BASE = "http://161.35.234.161/api";

const Agregar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;
  const isEditing = location.state?.isEditing || !!product;

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

  const [form, setForm] = useState({
    nombre: product?.name || product?.nombre || "",
    sustancia: product?.sustancia || product?.description || "",
    codigo: product?.code || product?.codigo || "",
    precio: product?.price || product?.precio || "",
    stock: product?.stock || "",
    fecha_vencimiento: product?.expiry || product?.fecha_vencimiento || "",
    lote: product?.lote || "",
    descripcion: product?.description || product?.descripcion || ""
  });

  // Cargar usuario actual
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);
      const savedUser = localStorage.getItem("user");
      
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        try {
          const response = await fetch(`${API_BASE}/user/profile`);
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          } else {
            const defaultUser = {
              id: 1,
              nombre: "Elena Rincón",
              rol: "Farmacéutica",
              email: "elena.rincon@farmacia.com"
            };
            setCurrentUser(defaultUser);
            localStorage.setItem("user", JSON.stringify(defaultUser));
          }
        } catch (err) {
          const defaultUser = {
            id: 1,
            nombre: "Elena Rincón",
            rol: "Farmacéutica",
            email: "elena.rincon@farmacia.com"
          };
          setCurrentUser(defaultUser);
          localStorage.setItem("user", JSON.stringify(defaultUser));
        }
      }
    } catch (err) {
      console.error("Error al cargar usuario:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  // INIT SCANNER
  useEffect(() => {
    try {
      codeReader.current = new BrowserMultiFormatReader();
    } catch (err) {
      console.error("Error al inicializar escáner:", err);
    }
    
    return () => {
      if (codeReader.current) {
        try {
          codeReader.current.reset();
        } catch (err) {
          console.error("Error al resetear escáner:", err);
        }
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try {
          videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        } catch (err) {
          console.error("Error al detener cámara:", err);
        }
      }
    };
  }, []);

  // SCANNER
  const startScanner = () => {
    setIsScannerOpen(true);
    
    setTimeout(() => {
      if (!videoRef.current) {
        console.error("Video ref no disponible");
        return;
      }
      
      if (!codeReader.current) {
        console.error("Code reader no disponible");
        return;
      }
      
      try {
        codeReader.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result, err) => {
            if (result) {
              const code = result.getText();
              stopScanner();
              setForm((f) => ({ ...f, codigo: code }));
              setSuccess(`Código escaneado: ${code}`);
              setTimeout(() => setSuccess(null), 3000);
            }
            if (err && !err.message?.includes("NotFoundException")) {
              console.error("Error en escáner:", err);
            }
          }
        );
      } catch (err) {
        console.error("Error al iniciar escáner:", err);
        setError("Error al iniciar la cámara. Por favor, verifica los permisos.");
        setIsScannerOpen(false);
      }
    }, 300);
  };

  const stopScanner = () => {
    try {
      if (codeReader.current) {
        codeReader.current.reset();
        codeReader.current = new BrowserMultiFormatReader();
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.log("Error cerrando cámara:", e);
    }
    
    setIsScannerOpen(false);
  };

  //  IMAGEN
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError("Por favor, selecciona una imagen válida");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe exceder los 5MB");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Validar formulario
  const validateForm = () => {
    if (!form.nombre.trim()) {
      setError("El nombre del producto es obligatorio");
      return false;
    }
    if (!form.precio || form.precio <= 0) {
      setError("El precio debe ser mayor a 0");
      return false;
    }
    if (!form.stock || form.stock < 0) {
      setError("El stock no puede ser negativo");
      return false;
    }
    if (!form.codigo.trim()) {
      setError("El código de barras es obligatorio");
      return false;
    }
    return true;
  };

  //  GUARDAR
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      
      // Agregar campos del formulario
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          formData.append(k, v);
        }
      });
      
      if (imageFile) formData.append("imagen", imageFile);
      
      const url = isEditing && product?.id
        ? `${API_BASE}/medicamentos/${product.id}`
        : `${API_BASE}/medicamentos`;
      
      const method = isEditing && product?.id ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        body: formData
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || `Error HTTP: ${res.status}`);
      }
      
      const data = await res.json();
      
      setSuccess(isEditing ? "Producto actualizado correctamente" : "Producto guardado correctamente");
      
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (err) {
      console.error("Error al guardar:", err);
      setError(err.message || "Error al guardar el producto");
    } finally {
      setLoading(false);
    }
  };

  // Cancelar y volver
  const handleCancel = () => {
    if (window.confirm("¿Está seguro de cancelar? Los cambios no guardados se perderán.")) {
      navigate("/");
    }
  };

  // Cerrar sesión
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

      {/* NAVBAR - Mejorado */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold text-lg">Farmacia Médica Rincón</h1>

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
            {isEditing ? "Editar Producto" : "Agregar Producto"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell onClick={() => navigate("/alerts")} className="cursor-pointer hover:text-[#bc004f] transition-colors" />

          <div ref={menuRef} className="relative">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img
                src={
                  currentUser?.imagen
                    ? currentUser.imagen
                    : `https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(' ', '+') || 'User'}&background=bc004f&color=fff`
                }
                className="w-9 h-9 rounded-full cursor-pointer object-cover"
                alt="User avatar"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {currentUser?.nombre?.split(' ')[0] || 'Usuario'}
              </span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border">
                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-semibold text-gray-800">{currentUser?.nombre || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{currentUser?.rol || 'Farmacéutico'}</p>
                  <p className="text-xs text-gray-400">{currentUser?.email || "usuario@farmacia.com"}</p>
                </div>
                
                <div className="md:hidden border-b mb-2 pb-2">
                  <button
                    onClick={() => {
                      navigate("/home");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left p-2 hover:bg-gray-100 rounded-lg"
                  >
                    Inventario
                  </button>
                  <button
                    onClick={() => {
                      navigate("/ventas");
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left p-2 hover:bg-gray-100 rounded-lg"
                  >
                    Ventas
                  </button>
                </div>
                
                <button 
                  onClick={() => navigate("/config")} 
                  className="flex gap-2 p-2 w-full hover:bg-gray-100 rounded-lg"
                >
                  <User size={16} /> Configuración
                </button>
                
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
            <button
              onClick={stopScanner}
              className="absolute top-3 right-3 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors"
            >
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
            <button onClick={() => setError(null)} className="font-bold">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-96 max-w-[90%]">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center shadow-lg">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold">
              <X size={16} />
            </button>
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
            {isEditing 
              ? "Actualiza la información del producto en el inventario." 
              : "Registra medicamentos o insumos al inventario."}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            👩‍⚕️ Usuario: <span className="font-medium text-[#bc004f]">{currentUser?.nombre || 'Farm. Elena Rincón'}</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* FORM */}
          <section className="lg:col-span-8 bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="text-[#bc004f]">📋</span>
              Información del Producto
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Nombre comercial *
                </label>
                <input 
                  name="nombre" 
                  value={form.nombre} 
                  onChange={handleChange} 
                  placeholder="Ej: Paracetamol 500mg"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Sustancia activa
                </label>
                <input 
                  name="sustancia" 
                  value={form.sustancia} 
                  onChange={handleChange} 
                  placeholder="Ej: Paracetamol"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Descripción
                </label>
                <input 
                  name="descripcion" 
                  value={form.descripcion} 
                  onChange={handleChange} 
                  placeholder="Descripción del producto"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Precio * (MXN)
                </label>
                <input 
                  type="number"
                  name="precio" 
                  value={form.precio} 
                  onChange={handleChange} 
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Stock * (Unidades)
                </label>
                <input 
                  type="number"
                  name="stock" 
                  value={form.stock} 
                  onChange={handleChange} 
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Fecha de vencimiento
                </label>
                <input 
                  type="date" 
                  name="fecha_vencimiento" 
                  value={form.fecha_vencimiento} 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Lote
                </label>
                <input 
                  name="lote" 
                  value={form.lote} 
                  onChange={handleChange} 
                  placeholder="Número de lote"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                  Código de barras *
                </label>
                <div className="flex gap-3">
                  <input 
                    name="codigo" 
                    value={form.codigo} 
                    onChange={handleChange} 
                    placeholder="Código de barras"
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all"
                  />
                  <button 
                    onClick={startScanner} 
                    className="bg-[#bc004f] text-white px-6 rounded-xl hover:bg-pink-700 transition-colors flex items-center gap-2"
                    type="button"
                  >
                    <Scan size={20} />
                    <span className="hidden sm:inline">Escanear</span>
                  </button>
                </div>
              </div>
              
            </div>
          </section>

          {/* IMAGEN */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-[#bc004f]">🖼️</span>
                Imagen del Producto
              </h2>
              
              <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#bc004f] transition-colors">
                <input 
                  type="file" 
                  onChange={handleImage} 
                  accept="image/*"
                  hidden 
                />
                
                {preview ? (
                  <div className="relative">
                    <img 
                      src={preview} 
                      className="rounded-xl w-full object-cover max-h-64"
                      alt="Preview" 
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setImageFile(null);
                        setPreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
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
                  <img 
                    src={product.imagen} 
                    className="rounded-xl w-full object-cover max-h-32"
                    alt="Current" 
                  />
                </div>
              )}
            </div>
          </aside>
          
        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-10 pb-10">
          <button 
            onClick={handleCancel} 
            className="px-8 py-3 border-2 border-gray-300 rounded-full font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          
          <button 
            onClick={handleSubmit} 
            disabled={loading}
            className="px-8 py-3 bg-[#bc004f] text-white rounded-full font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? "Actualizar Producto" : "Guardar Producto"}
              </>
            )}
          </button>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full mt-auto bg-white border-t border-gray-200 flex flex-col md:flex-row justify-between items-center px-12 py-8 gap-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">
          © 2026 Farmacia Médica Rincón. 
        </p>
        <div className="flex gap-8">
          <a
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#bc004f] transition-colors cursor-pointer"
            href="#"
          >
            Privacidad
          </a>
          <a
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#bc004f] transition-colors cursor-pointer"
            href="#"
          >
            Términos
          </a>
          <a
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#bc004f] transition-colors cursor-pointer"
            href="#"
          >
            Contacto
          </a>
        </div>
      </footer>

    </div>
  );
};

export default Agregar;