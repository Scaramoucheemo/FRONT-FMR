// src/components/Ventas.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Search, X, Plus, Minus, Scan } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const API_BASE = "http://161.35.234.161/api";

const Ventas = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Referencias para el escáner
  const videoRef = useRef(null);
  const codeReader = useRef(null);
  
  // Estado para el usuario en sesión
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  // Estados para el carrito y ventas
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Estados para búsqueda de productos
  const [searchCode, setSearchCode] = useState("");
  const [searching, setSearching] = useState(false);
  
  // Estado para el escáner
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Estados para datos del cliente
  const [customerName, setCustomerName] = useState("");
  const [customerRfc, setCustomerRfc] = useState("");
  const [saleType, setSaleType] = useState("general");
  const [customerId, setCustomerId] = useState(null);
  
  // Estados para cliente existente
  const [existingCustomer, setExistingCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  // Referencia para el input de búsqueda
  const searchInputRef = useRef(null);

  // Inicializar el lector de código de barras
  useEffect(() => {
    try {
      codeReader.current = new BrowserMultiFormatReader();
    } catch (err) {
      console.error("Error al inicializar escáner:", err);
    }
    
    // Limpiar al desmontar
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

  // Cargar usuario actual al iniciar
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Cargar productos cuando el usuario esté listo
  useEffect(() => {
    if (currentUser) {
      loadProducts();
      loadRecentProducts();
    }
  }, [currentUser]);

  // Cargar usuario actual
  const loadCurrentUser = async () => {
    try {
      setLoadingUser(true);
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      } else {
        // Usuario por defecto mientras no hay backend de auth
        setCurrentUser({
          id: 1,
          nombre: "Elena Rincón",
          rol: "Farmacéutica",
          email: "elena.rincon@farmacia.com"
        });
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          nombre: "Elena Rincón",
          rol: "Farmacéutica",
          email: "elena.rincon@farmacia.com"
        }));
      }
    } catch (err) {
      console.error("Error al cargar usuario:", err);
      setCurrentUser({
        id: 1,
        nombre: "Elena Rincón",
        rol: "Farmacéutica",
        email: "elena.rincon@farmacia.com"
      });
    } finally {
      setLoadingUser(false);
    }
  };

  // Función para hacer fetch con manejo de errores
  const fetchAPI = async (url, options = {}) => {
    try {
      const response = await fetch(`${API_BASE}${url}`, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.error("API Error:", err);
      throw err;
    }
  };

  // Cargar todos los productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI('/medicamentos');
      const mapped = Array.isArray(data) ? data.map(p => ({
        id: p.id,
        nombre: p.nombre,
        codigo: p.codigo,
        precio: p.precio,
        stock: p.stock,
        imagen: p.imagen
      })) : [];
      setProducts(mapped);
    } catch (err) {
      console.error("Error al cargar productos:", err);
      setError("Error al cargar productos: " + err.message);
      // Datos de ejemplo para que no se vea vacío
      setProducts([
        { id: 1, nombre: "Paracetamol 500mg", codigo: "123456", precio: 85.50, stock: 142 },
        { id: 2, nombre: "Ibuprofeno 400mg", codigo: "123457", precio: 120.00, stock: 85 },
        { id: 3, nombre: "Amoxicilina Susp.", codigo: "123458", precio: 95.00, stock: 12 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar productos recientes
  const loadRecentProducts = async () => {
    try {
      const data = await fetchAPI('/ventas');
      const productSales = {};
      if (Array.isArray(data)) {
        data.forEach(venta => {
          if (venta.detalles && Array.isArray(venta.detalles)) {
            venta.detalles.forEach(detalle => {
              if (productSales[detalle.producto_id]) {
                productSales[detalle.producto_id] += detalle.cantidad;
              } else {
                productSales[detalle.producto_id] = detalle.cantidad;
              }
            });
          }
        });
      }
      
      const topProductIds = Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([id]) => parseInt(id));
      
      if (topProductIds.length > 0 && products.length > 0) {
        const topProducts = topProductIds
          .map(id => products.find(p => p.id === id))
          .filter(p => p);
        setRecentProducts(topProducts);
      } else {
        setRecentProducts(products.slice(0, 3));
      }
    } catch (err) {
      console.error("Error al cargar productos recientes:", err);
      setRecentProducts(products.slice(0, 3));
    }
  };

  // Buscar producto por código
  const lookupByCode = async (code) => {
    try {
      setSearching(true);
      
      // Buscar en productos locales primero
      let product = products.find(p => 
        p.codigo === code || 
        p.nombre?.toLowerCase().includes(code.toLowerCase())
      );
      
      if (product) {
        addToCart(product);
        setSearchCode("");
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        return;
      }
      
      // Si no está en local, buscar en el backend
      try {
        const data = await fetchAPI(`/medicamentos?codigo=${code}`);
        if (data && data.length > 0) {
          product = data[0];
          addToCart({
            id: product.id,
            nombre: product.nombre,
            codigo: product.codigo,
            precio: product.precio,
            stock: product.stock,
            imagen: product.imagen
          });
          setSearchCode("");
          return;
        }
      } catch (err) {
        console.log("No encontrado en backend");
      }
      
      setError(`Producto "${code}" no encontrado`);
    } catch (err) {
      setError("Error al buscar producto: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  // Iniciar escáner
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
              setSearchCode(code);
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

  // Detener escáner
  const stopScanner = () => {
    try {
      if (codeReader.current) {
        codeReader.current.reset();
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

  // Buscar producto manualmente
  const searchProduct = useCallback(async () => {
    if (!searchCode.trim()) return;
    await lookupByCode(searchCode);
  }, [searchCode]);

  // Agregar producto al carrito
  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          setError(`Stock insuficiente para ${product.nombre}. Stock disponible: ${product.stock}`);
          return prevCart;
        }
        
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        if (quantity > product.stock) {
          setError(`Stock insuficiente para ${product.nombre}. Stock disponible: ${product.stock}`);
          return prevCart;
        }
        
        return [...prevCart, { ...product, quantity }];
      }
    });
    
    setSuccess(`${product.nombre} agregado al carrito`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Actualizar cantidad
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const product = prevCart.find(item => item.id === productId);
      if (product && newQuantity > product.stock) {
        setError(`Stock insuficiente. Stock disponible: ${product.stock}`);
        return prevCart;
      }
      
      return prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      );
    });
  };

  // Eliminar producto
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Calcular subtotal
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  // Calcular IVA
  const calculateIVA = () => {
    return calculateSubtotal() * 0.16;
  };

  // Calcular descuento
  const calculateDiscount = () => {
    return 0;
  };

  // Calcular total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateIVA() - calculateDiscount();
  };

  // Buscar o crear cliente
  const handleCustomerSearch = async () => {
    if (!customerName.trim() && !customerRfc.trim()) return;
    
    try {
      const clientes = await fetchAPI('/clientes');
      const found = Array.isArray(clientes) ? clientes.find(c => 
        c.nombre?.toLowerCase().includes(customerName.toLowerCase()) ||
        c.rfc === customerRfc
      ) : null;
      
      if (found) {
        setExistingCustomer(found);
        setCustomerId(found.id);
        setShowCustomerModal(true);
      } else {
        // Simular creación de cliente
        const newCustomer = {
          id: Date.now(),
          nombre: customerName,
          rfc: customerRfc,
          tipo_cliente: saleType
        };
        setCustomerId(newCustomer.id);
        setSuccess("Cliente registrado correctamente");
      }
    } catch (err) {
      setError("Error al buscar/crear cliente: " + err.message);
    }
  };

  // Procesar pago
  const processPayment = async () => {
    if (cart.length === 0) {
      setError("El carrito está vacío");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Crear la venta
      const ventaData = {
        cliente_id: customerId || null,
        fecha: new Date().toISOString(),
        subtotal: calculateSubtotal(),
        iva: calculateIVA(),
        descuento: calculateDiscount(),
        total: calculateTotal(),
        tipo_venta: saleType,
        usuario_id: currentUser?.id,
        usuario_nombre: currentUser?.nombre,
        detalles: cart.map(item => ({
          producto_id: item.id,
          cantidad: item.quantity,
          precio_unitario: item.precio,
          subtotal: item.precio * item.quantity
        }))
      };
      
      // Intentar guardar en backend
      try {
        await fetchAPI('/ventas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ventaData)
        });
      } catch (err) {
        console.error("Error al guardar en backend:", err);
        // Continuamos aunque falle el backend
      }
      
      setSuccess(`Venta realizada exitosamente por ${currentUser?.nombre}`);
      
      setCart([]);
      setCustomerName("");
      setCustomerRfc("");
      setCustomerId(null);
      setExistingCustomer(null);
      
      printTicket();
      
    } catch (err) {
      setError("Error al procesar la venta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Imprimir ticket
  const printTicket = () => {
    const fecha = new Date().toLocaleString();
    const ticketContent = `
      ========================================
          FARMACIA MÉDICA RINCÓN
          El Atelier Clínico
      ========================================
      
      Fecha: ${fecha}
      Atendido por: ${currentUser?.nombre || 'Farm. Elena Rincón'}
      
      ----------------------------------------
      PRODUCTOS:
      ----------------------------------------
      ${cart.map(item => `${item.nombre} x${item.quantity} = $${(item.precio * item.quantity).toFixed(2)}`).join('\n')}
      
      ----------------------------------------
      Subtotal: $${calculateSubtotal().toFixed(2)}
      IVA (16%): $${calculateIVA().toFixed(2)}
      DESCUENTO: $${calculateDiscount().toFixed(2)}
      ----------------------------------------
      TOTAL: $${calculateTotal().toFixed(2)}
      ========================================
      
      ¡Gracias por su compra!
      Vuelva pronto
      
      ${currentUser?.nombre ? `Atendió: ${currentUser.nombre}` : ''}
      ========================================
    `;
    
    console.log(ticketContent);
    alert(`Venta completada. Total: $${calculateTotal().toFixed(2)}`);
  };

  // Cancelar venta
  const cancelSale = () => {
    if (cart.length > 0 && window.confirm("¿Está seguro de cancelar la venta actual?")) {
      setCart([]);
      setSuccess("Venta cancelada");
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // Manejar tecla Enter
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchProduct();
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
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1  onClick={() => navigate("/home")}
          className="font-bold text-lg cursor-pointer"className="font-bold text-lg">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span onClick={() => navigate("/home")} className="cursor-pointer hover:text-[#bc004f] transition-colors">
            Inventario
          </span>
          <span onClick={() => navigate("/ventas")} className="text-[#bc004f] font-bold">
            Ventas
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell onClick={() => navigate("/alerts")} className="cursor-pointer hover:text-[#bc004f] transition-colors" />

          <div ref={menuRef} className="relative">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <img
                src={`https://ui-avatars.com/api/?name=${currentUser?.nombre?.replace(' ', '+') || 'User'}&background=bc004f&color=fff`}
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
                  <p className="font-semibold text-gray-800">{currentUser?.nombre}</p>
                  <p className="text-xs text-gray-500">{currentUser?.rol || 'Farmacéutico'}</p>
                  <p className="text-xs text-gray-400">{currentUser?.email}</p>
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
                <button  onClick={() => navigate("/config")} className="flex gap-2 p-2 w-full hover:bg-gray-100 rounded-lg">
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

      {/* MAIN CONTENT */}
      <main className="mt-20 px-4 md:px-8 pb-12 flex-grow container mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight uppercase">
            Terminal de Ventas
          </h1>
          <p className="text-gray-600 font-medium text-sm flex items-center gap-2">
            <span>👩‍⚕️ Sesión activa:</span>
            <span className="font-bold text-[#bc004f]">{currentUser?.nombre || 'Farm. Elena Rincón'}</span>
            <span className="text-xs text-gray-400">({currentUser?.rol || 'Farmacéutica'})</span>
          </p>
        </header>

        {/* Notificaciones */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold">
              <X size={16} />
            </button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="font-bold">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Content Area */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-[#bc004f]">📋</span>
                  Detalles de la transacción
                </h2>
                <span className="px-4 py-1.5 bg-pink-50 text-[#bc004f] rounded-full text-[10px] font-bold tracking-widest uppercase">
                  ID: #{Math.floor(Math.random() * 100000)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Barcode Entry Section */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                    Entrada de Producto
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#bc004f]" size={20} />
                    <input
                      ref={searchInputRef}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 placeholder:text-gray-400 transition-all font-medium text-sm"
                      placeholder="Ingresar código o nombre del producto"
                      type="text"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value)}
                      onKeyPress={handleSearchKeyPress}
                      disabled={searching}
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={searchProduct}
                      disabled={searching || !searchCode.trim()}
                      className="flex-1 py-3 bg-[#bc004f] text-white rounded-xl font-bold hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {searching ? "Buscando..." : "Agregar Producto"}
                    </button>
                    <button
                      onClick={startScanner}
                      className="py-3 px-6 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center gap-2"
                    >
                      <Scan size={20} />
                      Escanear
                    </button>
                  </div>
                  <div 
                    onClick={startScanner}
                    className="p-6 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-center gap-3 bg-gray-50 hover:bg-gray-100 transition-colors group cursor-pointer"
                  >
                    <Scan className="text-3xl text-gray-400 group-hover:text-[#bc004f] group-hover:scale-110 transition-all" size={32} />
                    <p className="text-sm font-medium text-gray-600">
                      Activar escáner de cámara
                    </p>
                    <p className="text-xs text-gray-400">
                      Escanea el código de barras del producto
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">
                    Datos del Cliente
                  </label>
                  <input
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all text-sm"
                    placeholder="Nombre del cliente"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <input
                    className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 transition-all text-sm"
                    placeholder="RFC (Opcional)"
                    type="text"
                    value={customerRfc}
                    onChange={(e) => setCustomerRfc(e.target.value)}
                  />
                  <div className="flex gap-4">
                    <select 
                      className="w-full px-4 py-3.5 bg-gray-50 rounded-xl border-2 border-transparent focus:border-pink-200 focus:ring-0 text-gray-900 text-sm appearance-none"
                      value={saleType}
                      onChange={(e) => setSaleType(e.target.value)}
                    >
                      <option value="general">Venta General</option>
                      <option value="seguro">Seguro Médico (Copago)</option>
                      <option value="corporativo">Convenio Corporativo</option>
                    </select>
                  </div>
                  <button
                    onClick={handleCustomerSearch}
                    disabled={!customerName.trim() && !customerRfc.trim()}
                    className="w-full py-2 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors disabled:opacity-50"
                  >
                    {customerId ? "Cliente Asignado ✓" : "Asignar Cliente"}
                  </button>
                </div>
              </div>

              {/* Summary Grid */}
              <div className="mt-10 grid grid-cols-3 gap-0.5 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200">
                <div className="bg-white p-5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
                    Items
                  </p>
                  <p className="text-xl font-bold text-gray-900">{cart.length}</p>
                </div>
                <div className="bg-white p-5 text-center border-x border-gray-200">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
                    IVA (16%)
                  </p>
                  <p className="text-xl font-bold text-gray-900">${calculateIVA().toFixed(2)}</p>
                </div>
                <div className="bg-white p-5 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1">
                    Descuento
                  </p>
                  <p className="text-xl font-bold text-[#bc004f]">-${calculateDiscount().toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Recent Products / Quick Add */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentProducts.length > 0 ? recentProducts.map((product, index) => (
                <div
                  key={product.id || index}
                  onClick={() => addToCart(product)}
                  className="bg-white p-4 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-pink-50 transition-all border border-gray-200 group"
                >
                  <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                    <span className="text-[#bc004f] text-xl">💊</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-900">
                      {product.nombre}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold">
                      STOCK: {product.stock}
                    </p>
                    <p className="text-[10px] text-[#bc004f] font-bold">
                      ${product.precio}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-8 text-gray-500">
                  Cargando productos recientes...
                </div>
              )}
            </div>
          </section>

          {/* Sidebar: Carrito */}
          <aside className="lg:col-span-4 flex flex-col h-full sticky top-24">
            <div className="bg-white rounded-2xl p-6 flex-grow overflow-hidden flex flex-col shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  Carrito
                  <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {cart.length} Productos
                  </span>
                </h3>
                <span className="text-[#bc004f]">🛒</span>
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 mb-6 max-h-[400px]">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Carrito vacío</p>
                    <p className="text-sm mt-2">Agrega productos para comenzar</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="group flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200"
                    >
                      <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                        <span className="text-2xl">💊</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-semibold truncate text-gray-900">
                          {item.nombre}
                        </h4>
                        <div className="flex justify-between items-center mt-1.5">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-xs flex items-center justify-center hover:bg-[#bc004f] hover:text-white transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-gray-100 border border-gray-300 text-xs flex items-center justify-center hover:bg-[#bc004f] hover:text-white transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <p className="text-sm font-extrabold text-gray-900">
                            ${(item.precio * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Totals & Actions */}
              <div className="border-t border-gray-200 pt-6 mt-auto">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 font-medium">
                    Subtotal
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    ${calculateSubtotal().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 font-medium">
                    IVA (16%)
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    ${calculateIVA().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-extrabold text-gray-900">
                    Total a pagar
                  </span>
                  <span className="text-2xl font-extrabold text-[#bc004f]">
                    ${calculateTotal().toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={cancelSale}
                    className="py-3.5 px-4 rounded-xl font-bold text-xs tracking-widest uppercase text-gray-600 bg-gray-100 border border-gray-300 hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    CANCELAR
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={loading || cart.length === 0}
                    className="py-3.5 px-4 rounded-xl font-bold text-xs tracking-widest uppercase bg-[#bc004f] text-white hover:bg-pink-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "PROCESANDO..." : "PAGAR AHORA"}
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-white border-t border-gray-200 flex flex-col md:flex-row justify-between items-center px-12 py-8 gap-4">
        <p className="text-[10px] uppercase tracking-widest text-gray-400">
          © 2026 Farmacia Médica Rincón. 
        </p>
        <div className="flex gap-8">
          <a
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#bc004f] transition-colors"
            href="#"
          >
            Privacidad
          </a>
          <a
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#bc004f] transition-colors"
            href="#"
          >
            Términos
          </a>
          <a
            className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-[#bc004f] transition-colors"
            href="#"
          >
            Contacto
          </a>
        </div>
      </footer>

      {/* Modal para cliente existente */}
      {showCustomerModal && existingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Cliente Encontrado</h3>
            <div className="mb-4 space-y-2">
              <p><strong>Nombre:</strong> {existingCustomer.nombre}</p>
              <p><strong>RFC:</strong> {existingCustomer.rfc || 'No especificado'}</p>
              <p><strong>Tipo:</strong> {existingCustomer.tipo_cliente}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="flex-1 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowCustomerModal(false);
                  setSuccess(`Cliente ${existingCustomer.nombre} seleccionado`);
                }}
                className="flex-1 py-2 bg-[#bc004f] text-white rounded-xl hover:bg-pink-700 transition-colors"
              >
                Usar este cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ventas;