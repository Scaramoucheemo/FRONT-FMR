import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  Plus,
  Scan,
  Pencil,
  Trash2,
  User,
  LogOut,
  X,
  Package,
  Truck,
  Boxes,
  Users,
  Stethoscope,
  RefreshCw,
  Archive
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader } from "@zxing/browser";
import Swal from 'sweetalert2';
import AOS from 'aos'; // IMPORTAMOS AOS
import 'aos/dist/aos.css'; // IMPORTAMOS LOS ESTILOS DE AOS
import { useAlerts } from '../Components/useAlert';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Home = () => {
  const alertCount = useAlerts();
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

  const [verDescontinuados, setVerDescontinuados] = useState(false);

  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabRef = useRef(null);

  const [ventasHoy, setVentasHoy] = useState(0);
  const [gananciasHoy, setGananciasHoy] = useState(0);

  // INICIALIZAR AOS
  useEffect(() => {
    AOS.init({
      duration: 600, // Duración de la animación en ms
      once: true, // Si es true, la animación solo ocurre una vez al bajar
      offset: 50, // Cuántos pixeles debe scrollear para que aparezca
    });
  }, []);

  useEffect(() => {
    const close = e => {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setIsFabOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const endpoint = verDescontinuados
        ? `${API_BASE}/api/productos?inactivos=true`
        : `${API_BASE}/api/productos`;

      const res = await fetch(endpoint, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
      const data = await res.json();

      const mapped = Array.isArray(data) ? data.map((p) => ({
        id: p.id_producto,
        name: p.nombre_comercial,
        code: p.codigo_barras,
        description: p.presentacion || p.sustancia_activa || "Sin descripción",
        price: p.precio_venta,
        fecha: p.fecha_caducidad,
        stock: "N/A",
        image: p.imagen ? `${API_BASE}/uploads/${p.imagen}` : "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"
      })) : [];

      setProducts(mapped);
      setError(null);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [verDescontinuados]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      navigate("/login");
    }
    setLoadingUser(false);
  }, []);

  useEffect(() => {
    try { codeReader.current = new BrowserMultiFormatReader(); } catch (e) { console.error(e); }
    return () => stopScanner();
  }, []);

  const lookupByCode = async (code) => {
    try {
      setLoading(true);
      let product = products.find(p => p.code === code);
      if (product) {
        setNotification(`Producto encontrado: ${product.name}`);
        setSearchTerm(product.code);
        setTimeout(() => setNotification(null), 3000);
        return;
      }

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/productos/scan`, {
        method: 'POST',
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ codigo_barras: code })
      });

      if (res.ok) {
        const data = await res.json();
        setNotification(`Producto encontrado: ${data.nombre_comercial}`);
        setSearchTerm(code);
        setTimeout(() => setNotification(null), 3000);
      } else {
        setError(`Producto con código ${code} no encontrado`);
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Error al buscar producto");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const startScanner = () => {
    setIsScannerOpen(true);
    let yaEscaneado = false;

    setTimeout(() => {
      if (!videoRef.current || !codeReader.current) return;
      try {
        codeReader.current.decodeFromVideoDevice(
          null,
          videoRef.current,
          (result) => {
            if (result && !yaEscaneado) {
              yaEscaneado = true;
              const code = result.getText();
              setSearchTerm(code);
              stopScanner();
              lookupByCode(code);
            }
          }
        );
      } catch (err) {
        console.error(err);
        setError("Error de permisos de cámara.");
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
        videoRef.current.srcObject = null;
      } catch (e) { console.error(e); }
    }
    setIsScannerOpen(false);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: '¿Desactivar producto?',
      text: "El producto pasará a la lista de descontinuados y ya no se mostrará en las ventas.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#FA8072',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/productos/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) {
        setSuccess("Producto desactivado correctamente");
        setTimeout(() => setSuccess(null), 3000);
        fetchProducts();
      } else {
        throw new Error("Error al eliminar");
      }
    } catch (err) {
      console.error(err);
      setError("Error al eliminar el producto");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (id) => {
    const result = await Swal.fire({
      title: '¿Reactivar producto?',
      text: "El producto volverá al catálogo principal de la farmacia.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, reactivar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/api/productos/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ estado: true })
      });

      if (response.ok) {
        setSuccess("Producto reactivado con éxito");
        setTimeout(() => setSuccess(null), 3000);
        fetchProducts();
      } else {
        throw new Error("Error al reactivar");
      }
    } catch (err) {
      console.error(err);
      setError("Error al reactivar el producto");
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    fetch(`${API_BASE}/api/productos/${product.id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => navigate("/agregar", { state: { product: data, isEditing: true } }))
      .catch(() => navigate("/agregar", { state: { product, isEditing: true } }));
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const product = products.find(p => p.code === searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
      if (product) {
        setNotification(`Producto encontrado: ${product.name}`);
        setTimeout(() => setNotification(null), 3000);
      } else {
        lookupByCode(searchTerm);
      }
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

  const handleKeyPress = (e) => { if (e.key === "Enter") handleSearch(); };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.code?.includes(searchTerm)
  );

  const productosPorVencer = products.filter((p) => {
    if (!p.fecha) return false;

    const hoy = new Date();
    const vencimiento = new Date(p.fecha);

    const diff = (vencimiento - hoy) / (1000 * 60 * 60 * 24); // días

    return diff <= 90 && diff > 0; // próximos 3 meses
  });

  useEffect(() => {
    const fetchVentas = async () => {
      try {
        const data = await api.getVentas();

        const hoy = new Date().toISOString().split("T")[0];

        const ventasDelDia = data.filter((v) =>
          v.fecha.startsWith(hoy)
        );

        setVentasHoy(ventasDelDia.length);

        const total = ventasDelDia.reduce(
          (acc, v) => acc + (v.total || 0),
          0
        );

        setGananciasHoy(total);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVentas();
  }, []);

  return (
    <div className="min-h-screen bg-[#fffbff] flex flex-col overflow-x-hidden">

      {/* NAVBAR */}
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
          <span
            onClick={() => navigate("/Clientes")}
            className="cursor-pointer hover:text-[#bc004f] transition-colors"
          >
            Directorio de Clientes
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
                src={`https://ui-avatars.com/api/?name=${user?.nombre?.replace(
                  " ",
                  "+"
                ) || "User"}&background=bc004f&color=fff`}
                className="w-9 h-9 rounded-full object-cover"
                alt="Avatar"
              />
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.nombre?.split(" ")[0] || "Usuario"}
              </span>
            </div>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-64 p-2 border">
                <div className="px-3 py-2 border-b mb-2">
                  <p className="font-semibold text-gray-800">
                    {user?.nombre || "Usuario"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.rol || "Rol no definido"}
                  </p>
                </div>

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

      {/* MODAL SCANNER Y NOTIFICACIONES */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md">
            <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline />
            <button onClick={stopScanner} className="absolute top-3 right-3 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors">✕ Cerrar</button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">Escanea el código</div>
          </div>
        </div>
      )}
      {error && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-red-100 text-red-700 p-3 rounded-lg shadow-lg">{error}</div>}
      {success && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-green-100 text-green-700 p-3 rounded-lg shadow-lg">{success}</div>}
      {notification && <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-blue-100 text-blue-700 p-3 rounded-lg shadow-lg">{notification}</div>}

      {/* MAIN */}
      <main className="pt-28 px-6 max-w-7xl mx-auto flex-grow w-full">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <div data-aos="fade-right">
            <h1 className="text-5xl font-extrabold">{verDescontinuados ? 'Descontinuados' : 'Inventario General'}</h1>
            <p className="text-gray-600 mt-2">
              Sesión activa: <span className="font-bold text-[#bc004f]">{user?.nombre || 'Usuario'}</span>
            </p>
          </div>

          <div className="flex gap-3 flex-wrap" data-aos="fade-left">
            <button
              onClick={() => setVerDescontinuados(!verDescontinuados)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 transition-colors font-bold ${verDescontinuados ? 'bg-gray-800 text-white' : 'bg-pink-100 text-[#bc004f] hover:bg-pink-200'
                }`}
            >
              <Archive size={20} />
              {verDescontinuados ? 'Ver Activos' : 'Ver Descontinuados'}
            </button>

            <div className="flex items-center bg-gray-100 px-4 py-3 rounded-xl">
              <Search className="text-gray-500" />
              <input className="ml-2 bg-transparent outline-none w-48" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} onKeyPress={handleKeyPress} />
            </div>
            <button onClick={startScanner} className="bg-[#bc004f] text-white w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center hover:bg-pink-700 transition-colors">
              <Scan />
            </button>
          </div>
        </div>

        {!verDescontinuados && (
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div data-aos="zoom-in" data-aos-delay="0" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-3xl font-bold">{products.length}</h2>
              <p className="text-xs text-gray-400 uppercase tracking-wider">PRODUCTOS ACTIVOS</p>
            </div>
            <div data-aos="zoom-in" data-aos-delay="100" className="bg-pink-50 p-6 rounded-2xl shadow-sm border border-pink-200">
              <h2 className="text-3xl font-bold text-red-500">
                {productosPorVencer.length}
              </h2>
              <p className="text-xs text-red-500 uppercase tracking-wider">PRODUCTOS POR VENCER</p>
              <p className="text-[10px] text-gray-400 mt-1">Próximos 3 meses</p>
            </div>
            <div data-aos="zoom-in" data-aos-delay="200" className="bg-black text-white p-6 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold">Resumen Diario</h2>
              <p className="text-xs text-gray-300 mt-2">
                Ventas del día: {ventasHoy}
              </p>
              <p className="text-xs text-gray-300">
                Ganancias: ${gananciasHoy}
              </p>
            </div>
          </div>
        )}

        {/* GRID DE PRODUCTOS */}
        {loading && products.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#bc004f]"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p, index) => (
              <div
                key={p.id}
                data-aos="fade-up"
                data-aos-delay={(index % 10) * 50} // Efecto cascada suave que se reinicia cada 10 items
                className={`group bg-white rounded-3xl shadow-sm overflow-hidden relative border transition-all hover:shadow-lg ${verDescontinuados ? 'border-gray-400 opacity-80' : 'border-gray-200'}`}
              >

                <div className="w-full h-52 bg-gray-50 flex items-center justify-center p-4 relative">
                  <img src={p.image} className={`max-w-full max-h-full object-contain mix-blend-multiply ${verDescontinuados ? 'grayscale' : ''}`} alt={p.name} />
                  {verDescontinuados && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <span className="bg-gray-800 text-white font-bold px-4 py-1 rounded-full text-sm">INACTIVO</span>
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all duration-300">

                  {user?.rol === 'Administrador' && (
                    <>
                      <button onClick={() => handleEdit(p)} className="bg-white p-3 rounded-full hover:bg-[#bc004f] hover:text-white transition-colors" title="Editar producto">
                        <Pencil size={18} />
                      </button>

                      {verDescontinuados ? (
                        <button onClick={() => handleReactivate(p.id)} className="bg-white p-3 rounded-full hover:bg-green-500 hover:text-white transition-colors" title="Reactivar producto">
                          <RefreshCw size={18} />
                        </button>
                      ) : (
                        <button onClick={() => handleDelete(p.id)} className="bg-white p-3 rounded-full hover:bg-red-500 hover:text-white transition-colors" title="Descontinuar producto">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </>
                  )}

                  {user?.rol !== 'Administrador' && (
                    <span className="text-white font-bold tracking-widest text-sm">SOLO LECTURA</span>
                  )}

                </div>
                <div className="p-5 border-t border-gray-100">
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{p.description}</p>
                  <p className="text-xs text-gray-400 mt-1">Código: {p.code}</p>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-[#bc004f] font-bold text-2xl">${p.price}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No se encontraron productos {verDescontinuados ? 'inactivos' : 'en el catálogo'}</p>
          </div>
        )}

      </main>

      <footer className="w-full mt-auto bg-white border-t border-gray-200 flex items-center justify-center px-12 py-8 mt-12">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">© 2026 Farmacia Médica Rincón.</p>
      </footer>

      {/* FAB - PROTEGIDO POR ROL */}
      {user?.rol === 'Administrador' && (
        <div ref={fabRef} className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
          <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${isFabOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>

            <button onClick={() => { navigate("/agregar", { state: { tipo: "producto" } }); setIsFabOpen(false); }} className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100">
              <Package size={16} /> Producto
            </button>
            <button onClick={() => { navigate("/Proveedores"); setIsFabOpen(false); }} className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100"> <Truck size={16} /> Proveedor
            </button>
            <button onClick={() => { navigate("/Lotes", { state: { tipo: "lote" } }); setIsFabOpen(false); }} className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100">
              <Boxes size={16} /> Lote
            </button>
            <button onClick={() => { navigate("/Clientes", { state: { tipo: "cliente" } }); setIsFabOpen(false); }} className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100">
              <Users size={16} /> Cliente
            </button>
            <button onClick={() => { navigate("/Doctores", { state: { tipo: "doctor" } }); setIsFabOpen(false); }} className="flex items-center gap-2 bg-white shadow-lg px-4 py-2 rounded-full text-sm hover:bg-gray-100">
              <Stethoscope size={16} /> Doctor
            </button>

          </div>
          <button onClick={() => setIsFabOpen(!isFabOpen)} className={`bg-[#bc004f] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${isFabOpen ? "rotate-45 scale-110" : "hover:scale-110"}`}>
            <Plus size={24} />
          </button>
        </div>
      )}

    </div>
  );
};

export default Home;