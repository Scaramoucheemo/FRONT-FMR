import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Calendar, 
  Package, 
  Scan,
  User,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png';

const Home = () => {

  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [visibleProducts, setVisibleProducts] = useState(3);

  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [userProfile] = useState(() => {
    return localStorage.getItem('userProfile') 
      || 'https://ui-avatars.com/api/?name=Usuario&background=f4c2d7&color=bc004f';
  });

  const [products] = useState([
    {
      id: 1,
      name: "Amoxicilina Duo",
      description: "Amoxicilina + Ácido Clavulánico",
      expiry: "2025-12-15",
      price: "450.00",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"
    },
    {
      id: 2,
      name: "Tussin Relief",
      description: "Dextrometorfano Jarabe",
      expiry: "2024-08-20",
      price: "185.50",
      image: "https://images.unsplash.com/photo-1563306406-e66174fa3787"
    },
    {
      id: 3,
      name: "Paracetamol 500mg",
      description: "Acetaminofén",
      expiry: "2027-05-10",
      price: "45.00",
      image: "https://images.unsplash.com/photo-1550572566-9592774028b0"
    },
    {
      id: 4,
      name: "Ibuprofeno 400mg",
      description: "Antiinflamatorio",
      expiry: "2026-03-01",
      price: "78.50",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88"
    }
  ]);

  const totalProducts = products.length;

  const calculateExpiringSoon = () => {
    const today = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(today.getMonth() + 3);

    return products.filter(product => {
      const expiryDate = new Date(product.expiry);
      return expiryDate <= threeMonthsLater && expiryDate >= today;
    }).length;
  };

  const expiringSoon = calculateExpiringSoon();

  const startScanner = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsScannerOpen(true);
    } catch {
      alert('No se pudo acceder a la cámara');
    }
  };

  const stopScanner = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setIsScannerOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/welcome');
  };

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, visibleProducts);

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex flex-col">

      {/* NAVBAR */}
      <nav className="fixed top-0 w-full bg-white border-b px-6 py-3 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">
            <img src={logoImage} className="w-10 h-10"/>
            <h1 className="font-semibold">Farmacia Médica Rincón</h1>
          </div>

          {/* DESKTOP */}
          <div className="hidden md:flex items-center gap-6">

            <button className="font-semibold border-b-2 border-[#bc004f] pb-1">
              Inventario
            </button>

            <button 
              onClick={()=>navigate('/ventas')}
              className="text-gray-500 hover:text-black"
            >
              Ventas
            </button>

            <div className="flex items-center bg-gray-100 px-3 py-1 rounded-full w-72">
              <Search className="w-4 h-4 text-gray-400"/>
              <input
                type="text"
                placeholder="Nombre o código..."
                className="bg-transparent outline-none ml-2 w-full text-sm"
                onChange={(e)=>setSearchTerm(e.target.value)}
              />
            </div>

          </div>

          {/* MOBILE BUTTON */}
          <button 
            onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            ☰
          </button>

          {/* DERECHA */}
          <div className="flex items-center gap-4">

            <button onClick={()=>navigate('/alerts')}>
              <Bell className="w-5 h-5 text-gray-600"/>
            </button>

            <div className="relative" ref={menuRef}>
              <img 
                src={userProfile} 
                className="w-9 h-9 rounded-full cursor-pointer"
                onClick={()=>setIsMenuOpen(!isMenuOpen)}
              />

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border p-2">
                  
                  <button 
                    onClick={()=>navigate('/config')}
                    className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-lg"
                  >
                    <User className="w-4 h-4"/>
                    Configuración
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4"/>
                    Cerrar sesión
                  </button>

                </div>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* MOBILE DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b px-6 py-4 space-y-4 mt-16">

          <button className="block w-full text-left font-semibold">
            Inventario
          </button>

          <button 
            onClick={()=>navigate('/ventas')}
            className="block w-full text-left text-gray-600"
          >
            Ventas
          </button>

          <button 
            onClick={()=>navigate('/alerts')}
            className="block w-full text-left text-gray-600"
          >
            Alertas
          </button>

          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
            <Search className="w-4 h-4 text-gray-400"/>
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent outline-none ml-2 w-full"
              onChange={(e)=>setSearchTerm(e.target.value)}
            />
          </div>

        </div>
      )}

      {/* MAIN */}
      <main className="pt-24 px-6 max-w-7xl mx-auto flex-1">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-10 gap-6">

          <div>
            <span className="text-xs bg-pink-100 text-[#bc004f] px-3 py-1 rounded-full">
              GESTIÓN DE STOCK
            </span>

            <h1 className="text-5xl font-bold mt-4">
              Inventario General
            </h1>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center bg-white border rounded-xl px-4 py-2 w-72">
              <Search className="w-4 h-4 text-gray-400"/>
              <input
                type="text"
                placeholder="Buscar medicamento..."
                className="ml-2 outline-none w-full"
                onChange={(e)=>setSearchTerm(e.target.value)}
              />
            </div>

            <button 
              onClick={startScanner}
              className="bg-[#bc004f] text-white px-5 rounded-xl flex items-center"
            >
              <Scan/>
            </button>
          </div>

        </div>

        {/* CARDS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-6 rounded-2xl border flex items-center gap-4">
            <Package className="text-[#bc004f]"/>
            <div>
              <p className="text-xs text-gray-500">PRODUCTOS TOTALES</p>
              <h2 className="text-3xl font-bold">{totalProducts}</h2>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border flex items-center gap-4">
            <Calendar className="text-red-500"/>
            <div>
              <p className="text-xs text-gray-500">PRÓXIMOS A VENCER</p>
              <h2 className="text-3xl font-bold text-red-500">{expiringSoon}</h2>
            </div>
          </div>

          <div className="bg-black text-white p-6 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs opacity-70">REPORTES</p>
              <h2>Resumen Diario</h2>
            </div>
            →
          </div>

        </div>

        {/* PRODUCTOS */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-2xl border overflow-hidden">
              <img src={product.image} className="h-44 w-full object-cover"/>
              <div className="p-4">
                <h3 className="font-bold">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
                <div className="flex justify-between mt-4">
                  <span>{new Date(product.expiry).toLocaleDateString()}</span>
                  <span className="text-[#bc004f] font-bold">${product.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* LOAD MORE */}
        {visibleProducts < products.length && (
          <div className="text-center mt-8">
            <button 
              onClick={()=>setVisibleProducts(v => v + 3)}
              className="px-6 py-2 border rounded-xl hover:bg-gray-100"
            >
              Cargar más
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t text-center py-4 text-sm text-gray-500">
        © 2026 Farmacia Médica Rincón — Sistema de Inventario
      </footer>

      {/* SCANNER */}
      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg overflow-hidden w-full max-w-md">
            <video ref={videoRef} className="w-full h-80 object-cover" autoPlay/>
            <button onClick={stopScanner} className="p-3 bg-red-500 text-white w-full">
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* FLOAT BUTTON */}
      <button 
        onClick={() => navigate('/agregar')}
        className="fixed bottom-20 right-6 md:bottom-6 md:right-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 bg-[#bc004f] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
      >
        <Plus/>
      </button>

    </div>
  );
};

export default Home;