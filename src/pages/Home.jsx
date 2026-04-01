import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Plus,
  Scan,
  Menu,
  Pencil,
  Trash2,
  User,
  LogOut,
  X,
  Package,
  Truck,
  Boxes,
  Users,
  Stethoscope
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader } from "@zxing/browser";

const API_BASE = import.meta.env.VITE_API_URL;

const Home = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const menuRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [notification, setNotification] = useState(null);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabRef = useRef(null);

  useEffect(() => {
  const close = e => {
    if (fabRef.current && !fabRef.current.contains(e.target)) {
      setIsFabOpen(false);
    }
  };
  document.addEventListener("mousedown", close);
  return () => document.removeEventListener("mousedown", close);
  }, []);
  

  //  FETCH PRODUCTOS
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/medicamentos`);
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();

      const mapped = Array.isArray(data) ? data.map((p, i) => ({
        id: p.id || i,
        name: p.nombre,
        code: p.codigo,
        description: p.descripcion || "Sin descripción",
        expiry: p.fecha_vencimiento || p.fecha,
        price: p.precio,
        stock: p.stock,
        image: p.imagen || "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"
      })) : [];

      setProducts(mapped);
      setError(null);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos: " + err.message);
      // Datos de ejemplo
      setProducts([
        { id: 1, name: "Paracetamol 500mg", code: "123456", description: "Analgésico y antipirético", expiry: "2025-12-31", price: 85.50, stock: 142, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae" },
        { id: 2, name: "Ibuprofeno 400mg", code: "123457", description: "Antiinflamatorio", expiry: "2025-10-15", price: 120.00, stock: 85, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae" },
        { id: 3, name: "Amoxicilina Susp.", code: "123458", description: "Antibiótico", expiry: "2025-08-20", price: 95.00, stock: 12, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  //  USER (avatar dinámico)
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);
      const savedUser = localStorage.getItem("user");
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Intentar obtener del backend
        try {
          const response = await fetch(`${API_BASE}/user/profile`);
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            localStorage.setItem("user", JSON.stringify(data));
          } else {
            // Usuario por defecto
            const defaultUser = {
              id: 1,
              nombre: "Elena Rincón",
              rol: "Farmacéutica",
              email: "elena.rincon@farmacia.com"
            };
            setUser(defaultUser);
            localStorage.setItem("user", JSON.stringify(defaultUser));
          }
        } catch (err) {
          const defaultUser = {
            id: 1,
            nombre: "Elena Rincón",
            rol: "Farmacéutica",
            email: "elena.rincon@farmacia.com"
          };
          setUser(defaultUser);
          localStorage.setItem("user", JSON.stringify(defaultUser));
        }
      }
    } catch (err) {
      console.error("Error al cargar usuario:", err);
    } finally {
      setLoadingUser(false);
    }
  };

  //  INIT SCANNER
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

  //  SCANNER BACKEND
  const lookupByCode = async (code) => {
    try {
      setLoading(true);
      
      // Buscar en productos locales primero
      let product = products.find(p => p.code === code);
      
      if (product) {
        setNotification(`Producto encontrado: ${product.name}`);
        setSearchTerm(product.code);
        setTimeout(() => setNotification(null), 3000);
        return;
      }
      
      // Buscar en el backend
      try {
        const res = await fetch(`${API_BASE}/medicamentos?codigo=${code}`);
        const data = await res.json();
        
        if (data && data.length > 0) {
          setNotification(`Producto encontrado: ${data[0].nombre}`);
          setSearchTerm(code);
          setTimeout(() => setNotification(null), 3000);
        } else {
          setError(`Producto con código ${code} no encontrado`);
          setTimeout(() => setError(null), 3000);
        }
      } catch (err) {
        setError("Error al buscar producto en el servidor");
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error("Error en lookup:", err);
      setError("Error al buscar producto");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

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
              setSearchTerm(code);
              stopScanner();
              lookupByCode(code);
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

  //  FIX SCANNER
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
    } catch (err) {
      console.error("Error al cerrar scanner:", err);
    }
    
    setIsScannerOpen(false);
  };

  // 🗑 DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este producto?"
    );
    if (!confirmDelete) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/medicamentos/${id}`, {
        method: "DELETE"
      });
      
      if (response.ok) {
        setSuccess("Producto eliminado correctamente");
        setTimeout(() => setSuccess(null), 3000);
        fetchProducts();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el producto");
      setTimeout(() => setError(null), 3000);
      // Eliminar localmente si falla el backend
      setProducts(prev => prev.filter(p => p.id !== id));
    } finally {
      setLoading(false);
    }
  };

  // EDIT
  const handleEdit = (product) => {
    navigate("/agregar", { state: { product, isEditing: true } });
  };

  //  Buscar producto manualmente
  const handleSearch = () => {
    if (searchTerm.trim()) {
      const product = products.find(p => 
        p.code === searchTerm || 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (product) {
        setNotification(`Producto encontrado: ${product.name}`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        lookupByCode(searchTerm);
      }
    }
  };

  //  Cerrar sesión
  const handleLogout = () => {
    if (window.confirm("¿Está seguro de cerrar sesión?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  //  Manejar tecla Enter en búsqueda
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.includes(searchTerm)
  );

  const totalProducts = products.length;

  const expiringSoon = products.filter(p => {
    if (!p.expiry) return false;
    const today = new Date();
    const future = new Date();
    future.setMonth(today.getMonth() + 3);
    const exp = new Date(p.expiry);
    return exp >= today && exp <= future;
  }).length;

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
            className="text-[#bc004f] font-bold cursor-pointer border-b-2 border-[#bc004f]"
          >
            Inventario
          </span>
          <span 
            onClick={() => navigate("/ventas")} 
            className="cursor-pointer hover:text-[#bc004f] transition-colors"
          >
            Ventas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell onClick={() => navigate("/alerts")} className="cursor-pointer hover:text-[#bc004f] transition-colors" />

          {/* USER */}
          <div ref={menuRef} className="relative">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img
                src={
                  user?.imagen
                    ? user.imagen
                    : `https://ui-avatars.com/api/?name=${user?.nombre?.replace(' ', '+') || 'User'}&background=bc004f&color=fff`
                }
                className="w-9 h-9 rounded-full cursor-pointer object-cover"
                alt="User avatar"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.nombre?.split(' ')[0] || 'Usuario'}
              </span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border">
                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-semibold text-gray-800">{user?.nombre || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{user?.rol || 'Farmacéutico'}</p>
                  <p className="text-xs text-gray-400">{user?.email || "usuario@farmacia.com"}</p>
                </div>
                
                <div className="md:hidden border-b mb-2 pb-2">
                  <button
                    onClick={() => {
                      navigate("/");
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

      {/* SCANNER */}
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
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {success && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-96 max-w-[90%]">
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
      
      {notification && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 w-96 max-w-[90%]">
          <div className="p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg flex justify-between items-center">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="font-bold">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="pt-28 px-6 max-w-7xl mx-auto flex-grow">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div>
            <h1 className="text-5xl font-extrabold">Inventario General</h1>
            <p className="text-gray-600 mt-2">
              👩‍⚕️ Sesión activa: <span className="font-bold text-[#bc004f]">{user?.nombre || 'Farm. Elena Rincón'}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full">
              <Search className="text-gray-500" />
              <input
                className="ml-2 bg-transparent outline-none w-48 md:w-64"
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>

            <button 
              onClick={startScanner} 
              className="bg-[#bc004f] text-white w-14 h-14 rounded-xl flex items-center justify-center hover:bg-pink-700 transition-colors"
              disabled={loading}
            >
              <Scan />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-3xl font-bold">{totalProducts}</h2>
            <p className="text-xs text-gray-400 uppercase tracking-wider">PRODUCTOS TOTALES</p>
          </div>

          <div className="bg-pink-50 p-6 rounded-2xl shadow-sm border border-pink-200">
            <h2 className="text-3xl font-bold text-red-500">{expiringSoon}</h2>
            <p className="text-xs text-red-500 uppercase tracking-wider">PRODUCTOS POR VENCER</p>
            <p className="text-[10px] text-gray-400 mt-1">Próximos 3 meses</p>
          </div>

          <div className="bg-black text-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-2xl font-bold">Resumen Diario</h2>
            <p className="text-xs text-gray-300 mt-2">Ventas del día: --</p>
            <p className="text-xs text-gray-300">Ganancias: --</p>
          </div>
        </div>

        {/* GRID */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bc004f]"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(p => (
              <div key={p.id} className="group bg-white rounded-3xl shadow-sm overflow-hidden relative border border-gray-200 transition-all hover:shadow-lg">
                
                <img src={p.image} className="w-full h-52 object-cover" alt={p.name} />
                
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  Stock: {p.stock}
                </div>
                
                {p.stock < 10 && p.stock > 0 && (
                  <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Bajo Stock
                  </div>
                )}
                
                {p.stock === 0 && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Agotado
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-300">
                  <button 
                    onClick={() => handleEdit(p)} 
                    className="bg-white p-3 rounded-full hover:bg-[#bc004f] hover:text-white transition-colors"
                    title="Editar producto"
                  >
                    <Pencil size={18}/>
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(p.id)} 
                    className="bg-white p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                    title="Eliminar producto"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Código: {p.code}</p>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-500">
                      {p.expiry ? new Date(p.expiry).toLocaleDateString() : 'Sin fecha'}
                    </span>
                    <span className="text-[#bc004f] font-bold text-xl">${p.price}</span>
                  </div>
                </div>
                
              </div>
            ))}
          </div>
        )}
        
        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No se encontraron productos</p>
            <button 
              onClick={() => navigate("/agregar")}
              className="mt-4 bg-[#bc004f] text-white px-6 py-2 rounded-full hover:bg-pink-700 transition-colors"
            >
              Agregar nuevo producto
            </button>
          </div>
        )}

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

      

      {/* FAB */}
      <div ref={fabRef} className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">

  {/* OPCIONES */}
 {/* FAB */}
<div ref={fabRef} className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">

  {/* OPCIONES */}
  <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${
    isFabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
  }`}>

    <button
      onClick={() => { navigate("/agregar", { state: { tipo: "producto" } }); setIsFabOpen(false); }}
      className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100"
    >
      <Package size={16} /> Producto
    </button>

    <button
      onClick={() => { navigate("/agregar", { state: { tipo: "proveedor" } }); setIsFabOpen(false); }}
      className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100"
    >
      <Truck size={16} /> Proveedor
    </button>

    <button
      onClick={() => { navigate("/agregar", { state: { tipo: "lote" } }); setIsFabOpen(false); }}
      className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100"
    >
      <Boxes size={16} /> Lote
    </button>

    <button
      onClick={() => { navigate("/agregar", { state: { tipo: "cliente" } }); setIsFabOpen(false); }}
      className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100"
    >
      <Users size={16} /> Cliente
    </button>

    <button
      onClick={() => { navigate("/agregar", { state: { tipo: "doctor" } }); setIsFabOpen(false); }}
      className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100"
    >
      <Stethoscope size={16} /> Doctor
    </button>

  </div>

  {/* BOTÓN */}
  <button
    onClick={() => setIsFabOpen(!isFabOpen)}
    className={`bg-[#bc004f] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
      isFabOpen ? "rotate-45 scale-110" : "hover:scale-110"
    }`}
  >
    <Plus size={24} />
  </button>

</div>

  {/* BOTÓN PRINCIPAL */}
  <button
    onClick={() => setIsFabOpen(!isFabOpen)}
    className={`bg-[#bc004f] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
      isFabOpen ? "rotate-45 scale-110" : "hover:scale-110"
    }`}
  >
    <Plus size={24} />
  </button>

</div>

    </div>
  );
};

export default Home;