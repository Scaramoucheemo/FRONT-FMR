import React, { useState } from 'react';
import { 
  Search, 
  Maximize, 
  Bell, 
  User, 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Package, 
  BarChart2, 
  ChevronRight,
  LogOut,
  Settings
} from 'lucide-react';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const products = [
    {
      id: 1,
      name: "Amoxicilina Duo",
      description: "Amoxicilina + Ácido Clavulánico",
      stock: 24,
      expiry: "Dic 2025",
      price: "450.00",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Tussin Relief",
      description: "Dextrometorfano Jarabe",
      stock: 8,
      expiry: "Ago 2024",
      price: "185.50",
      image: "https://images.unsplash.com/photo-1563306406-e66174fa3787?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Paracetamol 500mg",
      description: "Acetaminofén",
      stock: 156,
      expiry: "May 2027",
      price: "45.00",
      image: "https://images.unsplash.com/photo-1550572566-9592774028b0?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "DermoCare Plus",
      description: "Hidrocortisona 1%",
      stock: 12,
      expiry: "Nov 2026",
      price: "320.00",
      image: "https://images.unsplash.com/photo-1626716493137-b67fe9501e76?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 5,
      name: "Lantus Solostar",
      description: "Insulina Glargina",
      stock: 5,
      expiry: "Feb 2025",
      price: "1,890.00",
      image: "https://images.unsplash.com/photo-1615461066159-fea0960485d5?q=80&w=300&auto=format&fit=crop"
    },
    {
      id: 6,
      name: "VitaComplex B12",
      description: "Complejo B Forte",
      stock: 42,
      expiry: "Sep 2026",
      price: "215.00",
      image: "https://images.unsplash.com/photo-1614859324967-bdf24c6ea47a?q=80&w=300&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-['Manrope'] text-slate-800">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-xl font-extrabold tracking-tighter text-slate-900 uppercase">
            Farmacia Médica Rincón
          </h1>
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-[#bc004f] font-bold border-b-2 border-[#bc004f] pb-1 transition-all">Inventario</a>
            <a href="#" className="text-slate-500 hover:text-[#bc004f] font-medium transition-colors">Ventas</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Buscar medicamento..." 
              className="bg-transparent border-none outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#bc004f] rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#f4c2d7] flex items-center justify-center overflow-hidden border border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-[#f4c2d7] transition-all">
              <img src="https://ui-avatars.com/api/?name=Elena+Rincon&background=f4c2d7&color=bc004f" alt="Profile" />
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[#bc004f] uppercase mb-1 block">Gestión de Stock</span>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Inventario General</h2>
              <p className="text-slate-500 max-w-xl text-sm leading-relaxed">
                Administra los productos, controla caducidades y mantén el stock al día con eficiencia clínica.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-[#f4c2d7] focus-within:border-transparent transition-all w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 mr-3" />
                <input 
                  type="text" 
                  placeholder="Buscar medicamento..." 
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
              <button className="bg-[#bc004f] p-3 rounded-xl text-white shadow-lg shadow-pink-200 hover:bg-[#a00043] active:scale-95 transition-all">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats and Quick Reports - Estilo imagen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                <Package className="w-6 h-6 text-[#bc004f]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Productos Totales</p>
                <p className="text-2xl font-black text-slate-900">1,284</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#bc004f]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Próximos a vencer</p>
                <p className="text-2xl font-black text-[#bc004f]">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center">
                <BarChart2 className="w-6 h-6 text-[#bc004f]" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Reportes</p>
                <p className="text-sm font-bold text-slate-700">Resumen Diario</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#bc004f] transition-colors" />
          </div>
        </div>

        {/* Product Grid - Estilo imagen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Badge de caducidad si es próxima */}
                {product.expiry === "Ago 2024" && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                    ¡PRÓXIMO A VENCER!
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="mb-3">
                  <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{product.description}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caducidad</p>
                    <p className={`text-sm font-bold ${product.expiry === "Ago 2024" ? 'text-red-500' : 'text-slate-700'}`}>
                      {product.expiry}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#bc004f]">${product.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 border-2 border-[#bc004f] text-[#bc004f] font-bold rounded-full hover:bg-[#bc004f] hover:text-white transition-all duration-300 text-sm">
            Cargar más productos
          </button>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#bc004f] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#a00043] hover:scale-110 transition-all duration-300 group z-40">
        <Plus className="w-6 h-6" />
      </button>

      {/* Footer con navegación estilo imagen */}
      <footer className="bg-white border-t border-slate-100 mt-16 py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © 2024 Farmacia Médica Rincón
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-[#bc004f] transition-colors">Inventario</a>
            <a href="#" className="text-xs text-slate-500 hover:text-[#bc004f] transition-colors">Ventas</a>
            <a href="#" className="text-xs text-slate-500 hover:text-[#bc004f] transition-colors">Perfil</a>
            <a href="#" className="text-xs text-slate-500 hover:text-[#bc004f] transition-colors">Cerrar sesión</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;