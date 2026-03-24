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
            <a href="#" className="text-slate-500 hover:text-[#bc004f] font-medium transition-colors">Notificaciones</a>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-slate-100 rounded-full px-4 py-2 w-64">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Nombre o Código..." 
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
                  placeholder="Buscar medicamento o sustancia..." 
                  className="bg-transparent outline-none text-sm w-full"
                />
              </div>
              <button className="bg-[#bc004f] p-3 rounded-xl text-white shadow-lg shadow-pink-200 hover:bg-[#a00043] active:scale-95 transition-all">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats and Quick Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-[#bc004f]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Productos Totales</p>
              <p className="text-2xl font-black text-slate-900">1,284</p>
            </div>
          </div>

          <div className="bg-[#fff9fb] p-6 rounded-2xl border border-[#f4c2d7]/30 flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-[#f4c2d7] flex items-center justify-center text-[#bc004f]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-[#bc004f] mb-1">Próximos a vencer</p>
              <p className="text-2xl font-black text-[#bc004f]">12</p>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl flex items-center justify-between text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <BarChart2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Reportes</p>
                <p className="text-lg font-bold">Resumen Diario</p>
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  Stock: {product.stock}
                </div>
                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button className="bg-white p-3 rounded-full text-[#bc004f] hover:scale-110 active:scale-95 transition-all">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button className="bg-white p-3 rounded-full text-red-500 hover:scale-110 active:scale-95 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{product.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{product.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest mb-1">Caducidad</p>
                    <p className="text-xs font-bold text-slate-700">{product.expiry}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#bc004f]">${product.price}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination/Load More */}
        <div className="mt-16 flex flex-col items-center">
          <p className="text-xs text-slate-400 mb-6 font-medium tracking-tight">Mostrando 6 de 1,284 productos</p>
          <button className="px-10 py-3 border border-slate-200 rounded-full text-slate-600 font-bold text-sm hover:bg-[#f4c2d7]/10 hover:border-[#f4c2d7] hover:text-[#bc004f] transition-all">
            Cargar más productos
          </button>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#f4c2d7] rounded-full flex items-center justify-center text-[#bc004f] shadow-2xl shadow-pink-200 hover:scale-110 active:scale-95 transition-all group z-40">
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Footer */}
      <footer className="bg-[#f0f0f0] mt-20 py-10 px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          © 2024 Farmacia Médica Rincón. El Atelier Clínico.
        </p>
        <div className="flex gap-8">
          <a href="#" className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-[#bc004f] transition-colors uppercase">Privacidad</a>
          <a href="#" className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-[#bc004f] transition-colors uppercase">Términos</a>
          <a href="#" className="text-[10px] font-bold tracking-widest text-slate-500 hover:text-[#bc004f] transition-colors uppercase">Contacto</a>
        </div>
      </footer>
    </div>
  );
};

export default Home;