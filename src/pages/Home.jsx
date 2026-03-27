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
  LogOut
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BrowserMultiFormatReader } from "@zxing/browser";

const API_BASE = "http://161.35.234.161/api";

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

  // 🔥 FETCH PRODUCTOS
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/medicamentos`);
      const data = await res.json();

      const mapped = data.map((p, i) => ({
        id: p.id || i,
        name: p.nombre,
        code: p.codigo,
        description: p.descripcion,
        expiry: p.fecha,
        price: p.precio,
        stock: p.stock,
        image:
          p.imagen ||
          "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae"
      }));

      setProducts(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔥 USER (avatar dinámico)
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));

    if (savedUser) {
      setUser(savedUser);
    } else {
      fetch(`${API_BASE}/user/profile`)
        .then(res => res.json())
        .then(data => {
          setUser(data);
          localStorage.setItem("user", JSON.stringify(data));
        })
        .catch(() => {});
    }
  }, []);

  // 🔧 INIT SCANNER
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
  }, []);

  // 🔴 SCANNER BACKEND
  const lookupByCode = async (code) => {
    try {
      const res = await fetch(`${API_BASE}/medicamentos?codigo=${code}`);
      const data = await res.json();

      if (data && data.length > 0) {
        alert("Producto encontrado: " + data[0].nombre);
      } else {
        alert("No existe en backend");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startScanner = () => {
    setIsScannerOpen(true);

    setTimeout(() => {
      if (!videoRef.current) return;

      codeReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result) => {
          if (result) {
            const code = result.getText();
            setSearchTerm(code);
            stopScanner();
            lookupByCode(code);
          }
        }
      );
    }, 300);
  };

  // 🔥 FIX REAL DEL SCANNER
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

  // 🔥 limpiar al desmontar
  useEffect(() => {
    return () => stopScanner();
  }, []);

  // 🗑 DELETE
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar este producto?"
    );
    if (!confirmDelete) return;

    try {
      await fetch(`${API_BASE}/medicamentos/${id}`, {
        method: "DELETE"
      });

      alert("Eliminado correctamente");
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code?.includes(searchTerm)
  );

  const totalProducts = products.length;

  const expiringSoon = products.filter(p => {
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

  return (
    <div className="min-h-screen bg-[#fffbff]">

      {/* NAV */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span className="text-[#bc004f] font-bold border-b-2 border-[#bc004f]">
            Inventario
          </span>
          <span onClick={()=>navigate("/ventas")} className="cursor-pointer">
            Ventas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell />

          {/* USER */}
          <div ref={menuRef} className="relative">
            <img
              src={
                user?.imagen
                  ? user.imagen
                  : `https://ui-avatars.com/api/?name=${user?.nombre || "User"}`
              }
              className="w-9 h-9 rounded-full cursor-pointer object-cover"
              onClick={()=>setIsMenuOpen(!isMenuOpen)}
            />

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-48 p-2">

                {/* MOBILE NAV */}
                <div className="md:hidden border-b pb-2 mb-2">
                  <button onClick={()=>navigate("/")} className="block w-full text-left p-2">
                    Inventario
                  </button>
                  <button onClick={()=>navigate("/ventas")} className="block w-full text-left p-2">
                    Ventas
                  </button>
                </div>

                <button onClick={()=>navigate("/config")} className="flex gap-2 p-2 w-full">
                  <User size={16}/> Configuración
                </button>
                <button onClick={()=>navigate("/welcome")} className="flex gap-2 p-2 text-red-500 w-full">
                  <LogOut size={16}/> Cerrar sesión
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
            <video ref={videoRef} className="w-full rounded-xl" />
            <button
              onClick={stopScanner}
              className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MAIN */}
      <main className="pt-28 px-6 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
          <h1 className="text-5xl font-extrabold">Inventario General</h1>

          <div className="flex gap-3">
            <div className="flex items-center bg-gray-100 px-4 py-3 rounded-full">
              <Search />
              <input
                className="ml-2 bg-transparent outline-none"
                placeholder="Buscar..."
                onChange={(e)=>setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={startScanner} className="bg-[#bc004f] text-white w-14 h-14 rounded-xl flex items-center justify-center">
              <Scan />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-3xl font-bold">{totalProducts}</h2>
            <p className="text-xs text-gray-400">PRODUCTOS</p>
          </div>

          <div className="bg-pink-50 p-6 rounded-2xl">
            <h2 className="text-3xl font-bold text-red-500">{expiringSoon}</h2>
            <p className="text-xs text-red-500">POR VENCER</p>
          </div>

          <div className="bg-black text-white p-6 rounded-2xl">
            Resumen Diario
          </div>
        </div>

        {/* GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(p => (
            <div key={p.id} className="group bg-white rounded-3xl shadow overflow-hidden relative">

              <img src={p.image} className="w-full h-52 object-cover" />

              <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-xs font-bold">
                Stock: {p.stock}
              </div>

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                <button onClick={()=>navigate("/agregar", { state: { product: p } })} className="bg-white p-3 rounded-full">
                  <Pencil size={18}/>
                </button>

                <button onClick={()=>handleDelete(p.id)} className="bg-white p-3 rounded-full hover:bg-red-500 hover:text-white">
                  <Trash2 size={18}/>
                </button>
              </div>

              <div className="p-5">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.description}</p>

                <div className="flex justify-between mt-4">
                  <span>{new Date(p.expiry).toLocaleDateString()}</span>
                  <span className="text-[#bc004f] font-bold">${p.price}</span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </main>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3">
        <span className="hidden md:block bg-black text-white text-xs px-3 py-1 rounded-full shadow">
          Nuevo
        </span>

        <button
          onClick={()=>navigate("/agregar")}
          className="bg-[#bc004f] w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-110 transition"
        >
          <Plus />
        </button>
      </div>

      {/* FOOTER */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t">
        © 2026 Farmacia Médica Rincón
      </footer>

    </div>
  );
};

export default Home;