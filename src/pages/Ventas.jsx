import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Search, X, Plus, Minus, Scan, ShoppingCart, User, Stethoscope, UserPlus, FileText } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import Swal from 'sweetalert2';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAlerts } from '../Components/useAlert';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Ventas = () => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const alertCount = useAlerts();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Escáner
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Búsqueda de Productos
  const [searchCode, setSearchCode] = useState("");
  const [filteredLotes, setFilteredLotes] = useState([]);
  const [showLotesDropdown, setShowLotesDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const dropdownLotesRef = useRef(null);

  // Búsqueda de Clientes
  const [searchCliente, setSearchCliente] = useState("");
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [showClientesDropdown, setShowClientesDropdown] = useState(false);
  const dropdownClientesRef = useRef(null);

  // Catálogos
  const [lotesActivos, setLotesActivos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [doctores, setDoctores] = useState([]);

  // Estado del Carrito y Venta
  const [cart, setCart] = useState([]);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  
  // 🔥 NUEVO: Estado para el folio de la receta
  const [folioReceta, setFolioReceta] = useState("");
  
  useEffect(() => {
    AOS.init({ duration: 600, once: true, offset: 50 });
    try { codeReader.current = new BrowserMultiFormatReader(); } catch (err) {}

    const handleClickOutside = (e) => {
      if (dropdownLotesRef.current && !dropdownLotesRef.current.contains(e.target)) setShowLotesDropdown(false);
      if (dropdownClientesRef.current && !dropdownClientesRef.current.contains(e.target)) setShowClientesDropdown(false);
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (codeReader.current && typeof codeReader.current.reset === 'function') {
        try { codeReader.current.reset(); } catch (e) {}
      }
      if (videoRef.current && videoRef.current.srcObject) {
        try { videoRef.current.srcObject.getTracks().forEach(t => t.stop()); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      fetchCatalogos();
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchCatalogos = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { "Authorization": `Bearer ${token}` };

      const [resLotes, resClientes, resDoctores] = await Promise.all([
        fetch(`${API_BASE}/api/lotes`, { headers }),
        fetch(`${API_BASE}/api/clientes`, { headers }),
        fetch(`${API_BASE}/api/doctores`, { headers })
      ]);

      if (resLotes.ok) {
        const lotes = await resLotes.json();
        setLotesActivos(lotes.filter(l => l.cantidad > 0 || l.stock > 0));
      }
      if (resClientes.ok) setClientes(await resClientes.json());
      if (resDoctores.ok) {
        const dataDocs = await resDoctores.json();
        setDoctores(dataDocs.doctores || []);
      }
    } catch (err) {
      Swal.fire('Error', 'No se pudieron cargar los catálogos.', 'error');
    }
  };

  const extractProductData = (lote) => {
    const prod = lote.Producto || lote.producto || lote;
    const precioBruto = prod.precio_venta || prod.precio || lote.precio || 0;
    const precioLimpio = parseFloat(precioBruto) || 0;
    const esControlado = prod.requiere_receta == true || prod.requiere_receta == 1 || lote.requiere_receta == true || lote.requiere_receta == 1;

    return {
      idReal: lote.id_registro_lote || lote.id_lote || lote.id,
      idProducto: prod.id_producto || prod.id || lote.id_producto,
      nombre: prod.nombre_comercial || prod.nombre || "Producto sin nombre",
      codigoBarras: prod.codigo_barras || prod.codigo || "",
      loteFisico: lote.codigo_lote_fisico || lote.codigo_lote || "S/L",
      precio: precioLimpio,
      requiereReceta: esControlado,
      cantidadDisponible: lote.cantidad || lote.stock || 0
    };
  };

  const handleProductSearch = (e) => {
    const val = e.target.value;
    setSearchCode(val);
    
    if (val.trim()) {
      const termino = val.toLowerCase();
      const resultados = lotesActivos.filter(l => {
        const data = extractProductData(l);
        return data.codigoBarras.toLowerCase().includes(termino) || 
               data.loteFisico.toLowerCase().includes(termino) ||
               data.nombre.toLowerCase().includes(termino);
      });
      setFilteredLotes(resultados);
      setShowLotesDropdown(true);
    } else {
      setShowLotesDropdown(false);
    }
  };

  const selectLoteFromDropdown = (lote) => {
    addToCart(lote);
    setSearchCode("");
    setShowLotesDropdown(false);
    searchInputRef.current?.focus();
  };

  const lookupByCode = (code) => {
    if (!code.trim()) return;
    const termino = code.toLowerCase();
    const loteEncontrado = lotesActivos.find(l => {
      const data = extractProductData(l);
      return data.codigoBarras.toLowerCase() === termino || 
             data.loteFisico.toLowerCase() === termino ||
             data.nombre.toLowerCase().includes(termino);
    });

    if (loteEncontrado) {
      addToCart(loteEncontrado);
      setSearchCode("");
    } else {
      Swal.fire({ icon: 'warning', title: 'No encontrado', text: 'No se encontró inventario para este código.', timer: 2000 });
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') lookupByCode(searchCode);
  };

  const handleClienteSearch = (e) => {
    const val = e.target.value;
    setSearchCliente(val);
    
    if (val.trim()) {
      const termino = val.toLowerCase();
      const resultados = clientes.filter(c => 
        c.nombre?.toLowerCase().includes(termino) || 
        c.apellido?.toLowerCase().includes(termino) ||
        c.identificacion?.toLowerCase().includes(termino)
      );
      setFilteredClientes(resultados);
      setShowClientesDropdown(true);
    } else {
      setShowClientesDropdown(false);
    }
  };

  const selectClienteFromDropdown = (cliente) => {
    setSelectedCliente(cliente);
    setSearchCliente(`${cliente.nombre} ${cliente.apellido || ''}`);
    setShowClientesDropdown(false);
  };

  const removeSelectedCliente = () => {
    setSelectedCliente(null);
    setSearchCliente("");
  };

  const addToCart = (lote, quantity = 1) => {
    const data = extractProductData(lote);

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id_registro_lote === data.idReal);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > data.cantidadDisponible) {
          Swal.fire('Stock insuficiente', `Solo quedan ${data.cantidadDisponible} uds.`, 'warning');
          return prevCart;
        }
        return prevCart.map(item => item.id_registro_lote === data.idReal ? { ...item, quantity: newQuantity } : item);
      } else {
        if (quantity > data.cantidadDisponible) {
          Swal.fire('Stock insuficiente', `Solo quedan ${data.cantidadDisponible} uds.`, 'warning');
          return prevCart;
        }
        return [...prevCart, { 
          id_registro_lote: data.idReal,
          id_producto: data.idProducto,
          nombre: data.nombre,
          codigo_lote: data.loteFisico,
          precio: data.precio,
          requiere_receta: data.requiereReceta,
          stockMax: data.cantidadDisponible,
          quantity 
        }];
      }
    });
  };

  const updateQuantity = (idLote, newQuantity) => {
    if (newQuantity < 1) return removeFromCart(idLote);
    setCart(prevCart => {
      const item = prevCart.find(i => i.id_registro_lote === idLote);
      if (item && newQuantity > item.stockMax) {
        Swal.fire('Límite alcanzado', `No hay más stock en este lote`, 'warning');
        return prevCart;
      }
      return prevCart.map(i => i.id_registro_lote === idLote ? { ...i, quantity: newQuantity } : i);
    });
  };

  const removeFromCart = (idLote) => setCart(prevCart => prevCart.filter(item => item.id_registro_lote !== idLote));

  const startScanner = () => {
    setIsScannerOpen(true);
    let yaEscaneado = false;
    setTimeout(() => {
      if (!videoRef.current || !codeReader.current) return;
      try {
        codeReader.current.decodeFromVideoDevice(null, videoRef.current, (result) => {
            if (result && !yaEscaneado) {
              yaEscaneado = true;
              const code = result.getText();
              stopScanner();
              const loteEncontrado = lotesActivos.find(l => {
                  const data = extractProductData(l);
                  return data.codigoBarras === code;
              });
              
              if(loteEncontrado) {
                addToCart(loteEncontrado);
              } else {
                setSearchCode(code);
                handleProductSearch({target: {value: code}});
              }
            }
          }
        );
      } catch (err) {
        Swal.fire('Error', 'Verifica los permisos de cámara.', 'error');
        setIsScannerOpen(false);
      }
    }, 300);
  };

  const stopScanner = () => {
    if (codeReader.current && typeof codeReader.current.reset === 'function') {
      try { codeReader.current.reset(); } catch (e) {}
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try { videoRef.current.srcObject.getTracks().forEach(track => track.stop()); videoRef.current.srcObject = null; } catch (e) {}
    }
    setIsScannerOpen(false);
  };

  const total = cart.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
  const requiereReceta = cart.some(item => item.requiere_receta);

  const handlePayment = async () => {
    if (cart.length === 0) return;

    // 🔥 VALIDACIÓN ACTUALIZADA: Ahora también bloquea si no escribieron el folio de receta
    if (requiereReceta && (!selectedCliente || !selectedDoctor || !folioReceta.trim())) {
      Swal.fire({
        icon: 'error',
        title: 'Faltan Datos Legales',
        text: 'Detectamos antibióticos en el carrito. Debes seleccionar al Cliente, al Doctor y capturar el Folio de la Receta.',
        confirmButtonColor: '#bc004f'
      });
      return;
    }

    const { value: dineroIngresado } = await Swal.fire({
      title: 'Cobro en Efectivo',
      input: 'number',
      inputLabel: `Total a cobrar: $${total.toFixed(2)}`,
      inputPlaceholder: 'Ingresa la cantidad recibida',
      showCancelButton: true,
      confirmButtonText: 'Procesar Venta',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#9ca3af',
      inputValidator: (value) => {
        if (!value) return 'Debes ingresar una cantidad';
        if (Number(value) < total) return 'El dinero recibido no cubre el total';
      }
    });

    if (dineroIngresado) ejecutarVentaBackend(Number(dineroIngresado));
  };

  const ejecutarVentaBackend = async (dineroRecibido) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      const payload = {
        dinero_recibido: dineroRecibido,
        id_cliente: selectedCliente?.id_cliente || selectedCliente?.id || null,
        id_doctor: selectedDoctor || null,
        tipo_salida: "Venta Mostrador",
        // 🔥 LÓGICA DE DEFAULT: Si escribieron un folio lo manda, si no, manda "S/R"
        folio_receta: folioReceta.trim() ? folioReceta.trim() : "S/R",
        detalles: cart.map(item => ({
          id_producto: item.id_producto,
          id_registro_lote: item.id_registro_lote,
          cantidad: item.quantity
        }))
      };

      const res = await fetch(`${API_BASE}/api/ventas`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al procesar la venta');

      Swal.fire({
        icon: 'success',
        title: '¡Venta Exitosa!',
        html: `Cambio a entregar:<br><b style="font-size: 2rem; color: #bc004f;">$${data.cambio_a_entregar.toFixed(2)}</b>`,
        confirmButtonColor: '#bc004f',
        confirmButtonText: 'Cerrar e Imprimir Ticket'
      });

      // Limpieza de terminal post-venta
      setCart([]);
      removeSelectedCliente();
      setSelectedDoctor("");
      setFolioReceta(""); // Reseteamos el folio
      fetchCatalogos(); 

    } catch (err) {
      Swal.fire('Error en la transacción', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelSale = async () => {
    if (cart.length === 0) return;
    const result = await Swal.fire({
      title: '¿Limpiar terminal?',
      text: "Se borrarán los artículos del carrito.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#bc004f',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Sí, cancelar'
    });

    if (result.isConfirmed) {
      setCart([]);
      removeSelectedCliente();
      setSelectedDoctor("");
      setFolioReceta("");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#fffbff] flex flex-col overflow-x-hidden">
      
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-cart-item { animation: slideInRight 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>

      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 onClick={() => navigate("/home")} className="font-bold text-lg cursor-pointer">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span onClick={() => navigate("/home")} className="cursor-pointer hover:text-[#bc004f] transition-colors">Inventario</span>
          <span className="text-[#bc004f] font-bold border-b-2 border-[#bc004f]">Ventas</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer" onClick={() => navigate("/alerts")}>
            <Bell className="text-[#bc004f] hover:text-pink-700 transition-colors" />
            {alertCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">{alertCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleLogout} title="Cerrar sesión">
             <LogOut className="text-gray-400 hover:text-red-500 transition-colors" size={20}/>
          </div>
        </div>
      </nav>

      {isScannerOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md">
            <video ref={videoRef} className="w-full rounded-xl" autoPlay playsInline />
            <button onClick={stopScanner} className="absolute top-3 right-3 bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600">✕ Cerrar</button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">Escaneando...</div>
          </div>
        </div>
      )}

      <main className="mt-28 px-4 md:px-8 pb-12 flex-grow container mx-auto max-w-7xl">
        <header className="mb-8" data-aos="fade-down">
          <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight">Terminal de Ventas</h1>
          <p className="text-gray-500 font-medium text-sm mt-2 flex items-center gap-2">
            <span>👩‍⚕️ Cajero Activo:</span>
            <span className="font-bold text-[#bc004f]">{currentUser?.nombre}</span>
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* PANEL IZQUIERDO */}
          <section className="lg:col-span-7 flex flex-col gap-6" data-aos="fade-right">
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 relative z-20">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">
                Agregar Medicamentos (Por Lote)
              </label>
              
              <div className="flex gap-3">
                <div className="relative flex-grow" ref={dropdownLotesRef}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    ref={searchInputRef}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:bg-white focus:ring-0 text-gray-900 transition-all font-medium text-sm outline-none"
                    placeholder="Código de barras, Lote o Nombre..."
                    value={searchCode}
                    onChange={handleProductSearch}
                    onKeyPress={handleSearchKeyPress}
                  />
                  
                  {showLotesDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-60 overflow-y-auto custom-scrollbar">
                      {filteredLotes.length > 0 ? (
                        filteredLotes.map(lote => {
                          const data = extractProductData(lote);
                          return (
                            <div 
                              key={data.idReal} 
                              onClick={() => selectLoteFromDropdown(lote)}
                              className="p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50 flex justify-between items-center group"
                            >
                              <div>
                                <p className="font-bold text-gray-800 text-sm group-hover:text-[#bc004f]">{data.nombre}</p>
                                <p className="text-[10px] text-gray-500 tracking-wider">LOTE: {data.loteFisico}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-gray-900">${data.precio.toFixed(2)}</p>
                                <p className="text-[10px] text-emerald-600 font-bold">{data.cantidadDisponible} uds.</p>
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="p-4 text-center text-gray-500 text-sm">No se encontraron lotes con inventario</div>
                      )}
                    </div>
                  )}
                </div>
                
                <button onClick={startScanner} className="px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center gap-2">
                  <Scan size={20} /> <span className="hidden sm:inline">Escanear</span>
                </button>
              </div>
            </div>

            {/* SECCIÓN CONDICIONAL: Aparece suavemente si hay medicamentos controlados */}
            {requiereReceta && (
              <div className="bg-pink-50 rounded-2xl p-6 shadow-sm border border-pink-200 animate-[fadeIn_0.5s_ease-out] relative z-10">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-lg font-bold text-[#bc004f] flex items-center gap-2">
                    <span>⚠️</span> Controles de Receta Médica
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <div className="relative md:col-span-1" ref={dropdownClientesRef}>
                    <div className="relative flex items-center">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                      <input
                        className={`w-full pl-10 pr-10 py-3 bg-white rounded-xl border outline-none text-sm font-medium transition-colors ${!selectedCliente ? 'border-red-400 ring-2 ring-red-100' : 'border-gray-200 focus:border-pink-300'}`}
                        placeholder="Buscar Cliente..."
                        value={searchCliente}
                        onChange={handleClienteSearch}
                        disabled={!!selectedCliente}
                      />
                      {selectedCliente && (
                        <button onClick={removeSelectedCliente} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
                          <X size={16}/>
                        </button>
                      )}
                    </div>

                    {showClientesDropdown && !selectedCliente && (
                      <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 max-h-48 overflow-y-auto custom-scrollbar">
                        {filteredClientes.length > 0 ? (
                          filteredClientes.map(c => (
                            <div key={c.id || c.id_cliente} onClick={() => selectClienteFromDropdown(c)} className="p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50">
                              <p className="font-bold text-gray-800 text-sm">{c.nombre} {c.apellido}</p>
                              {c.identificacion && <p className="text-[10px] text-gray-500">{c.identificacion}</p>}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-gray-500 text-xs mb-3">Cliente no encontrado</p>
                            <button onClick={() => navigate('/clientes')} className="flex items-center justify-center gap-2 w-full py-2 bg-pink-100 text-[#bc004f] rounded-lg text-xs font-bold hover:bg-pink-200 transition-colors">
                              <UserPlus size={14}/> Nuevo Cliente
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative md:col-span-1">
                     <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                    <select
                      value={selectedDoctor}
                      onChange={(e) => setSelectedDoctor(e.target.value)}
                      className={`w-full pl-10 pr-4 py-3 bg-white rounded-xl border outline-none text-sm font-medium appearance-none transition-colors ${!selectedDoctor ? 'border-red-400 ring-2 ring-red-100 text-gray-400' : 'border-gray-200 text-gray-900 focus:border-pink-300'}`}
                    >
                      <option value="">Seleccionar Doctor...</option>
                      {doctores.map(d => <option key={d.id || d.id_doctor} value={d.id || d.id_doctor}>Dr. {d.nombre} {d.apellido}</option>)}
                    </select>
                  </div>

                  {/* 🔥 NUEVO: Input para el Folio de Receta */}
                  <div className="relative md:col-span-1">
                     <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400" size={18} />
                     <input
                        type="text"
                        placeholder="Folio de la Receta"
                        value={folioReceta}
                        onChange={(e) => setFolioReceta(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white rounded-xl border outline-none text-sm font-medium transition-colors ${!folioReceta.trim() ? 'border-red-400 ring-2 ring-red-100 text-gray-400' : 'border-gray-200 text-gray-900 focus:border-pink-300'}`}
                     />
                  </div>

                </div>
                
                <p className="text-xs text-red-600 font-bold mt-4">
                  ⚠️ El cobro está bloqueado hasta que selecciones un Doctor, un Cliente y anotes el Folio de la Receta.
                </p>
              </div>
            )}

          </section>

          {/* PANEL DERECHO: Carrito Fijo */}
          <aside className="lg:col-span-5 h-full relative z-0" data-aos="fade-left">
            <div className="bg-white rounded-2xl flex flex-col shadow-xl border border-gray-200 sticky top-28" style={{ height: 'calc(100vh - 150px)' }}>
              
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-2xl">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-800">
                  <ShoppingCart className="text-[#bc004f]" size={20}/>
                  Ticket Actual
                </h3>
                <span className="text-xs font-bold text-white bg-gray-800 px-3 py-1 rounded-full">
                  {cart.length} Artículos
                </span>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-3 custom-scrollbar overflow-x-hidden">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <ShoppingCart size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">El carrito está vacío</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id_registro_lote} className="animate-cart-item flex flex-col gap-2 p-4 bg-white border border-gray-100 rounded-xl shadow-sm relative group hover:border-pink-200 transition-colors">
                      
                      <div className="flex justify-between items-start pr-6">
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.nombre}</h4>
                          <p className="text-[10px] text-gray-500 font-semibold uppercase mt-1">Lote: {item.codigo_lote}</p>
                          {item.requiere_receta && <p className="text-[10px] text-red-500 font-bold uppercase mt-0.5">Controlado</p>}
                        </div>
                        <p className="text-sm font-black text-gray-900">${(item.precio * item.quantity).toFixed(2)}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                          <button onClick={() => updateQuantity(item.id_registro_lote, item.quantity - 1)} className="w-6 h-6 rounded-md bg-white border flex items-center justify-center hover:bg-[#bc004f] hover:text-white transition-colors"><Minus size={12} /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id_registro_lote, item.quantity + 1)} className="w-6 h-6 rounded-md bg-white border flex items-center justify-center hover:bg-[#bc004f] hover:text-white transition-colors"><Plus size={12} /></button>
                        </div>
                        <p className="text-xs text-gray-400 font-medium">PU: ${item.precio.toFixed(2)}</p>
                      </div>

                      <button onClick={() => removeFromCart(item.id_registro_lote)} className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={16} className="text-red-400 hover:text-red-600" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Totales */}
              <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">Total a pagar</span>
                  <span className="text-3xl font-black text-[#bc004f]">${total.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={cancelSale} disabled={cart.length === 0} className="py-4 rounded-xl font-bold text-xs uppercase text-gray-600 bg-white border-2 border-gray-200 hover:bg-gray-100 transition-all disabled:opacity-50">
                    Cancelar
                  </button>
                  <button 
                    onClick={handlePayment} 
                    disabled={loading || cart.length === 0 || (requiereReceta && (!selectedCliente || !selectedDoctor || !folioReceta.trim()))} 
                    className="py-4 rounded-xl font-bold text-xs uppercase bg-[#10b981] text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:shadow-none"
                  >
                    {loading ? "PROCESANDO..." : "COBRAR TICKET"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Ventas;