import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, Menu, User, LogOut, Scan } from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";

const API_BASE = "http://161.35.234.161/api";

const Agregar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const product = location.state?.product;

  const [mobileNav, setMobileNav] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const videoRef = useRef(null);
  const codeReader = useRef(null);
  const menuRef = useRef(null);

  const [form, setForm] = useState({
    nombre: product?.name || "",
    sustancia: product?.description || "",
    codigo: product?.code || "",
    precio: product?.price || "",
    stock: product?.stock || "",
    fecha: product?.expiry || "",
    lote: product?.lote || "",
    descripcion: product?.description || ""
  });

  // INIT SCANNER
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
  }, []);

  // 🔴 SCANNER
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
            stopScanner();
            setForm((f) => ({ ...f, codigo: code }));
          }
        }
      );
    }, 300);
  };

  const stopScanner = () => {
    try {
      codeReader.current?.reset();

      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      console.log("Error cerrando cámara:", e);
    }

    setIsScannerOpen(false);
  };

  // 📷 IMAGEN
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // 💾 GUARDAR
  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) =>
        formData.append(k, v)
      );

      if (imageFile) formData.append("imagen", imageFile);

      const url = product
        ? `${API_BASE}/medicamentos/${product.id}`
        : `${API_BASE}/medicamentos`;

      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (!res.ok) throw new Error();

      alert(product ? "Producto actualizado" : "Producto guardado");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error al guardar");
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

  return (
    <div className="min-h-screen bg-[#f6f2f4]">

      {/* NAVBAR (TUYA ORIGINAL) */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur border-b px-6 py-4 flex justify-between items-center z-50">
        <h1 className="font-bold">Farmacia Médica Rincón</h1>

        <div className="hidden md:flex gap-6">
          <span onClick={()=>navigate("/")} className="cursor-pointer">Inventario</span>
          <span onClick={()=>navigate("/ventas")} className="cursor-pointer">Ventas</span>
          <span className="text-[#bc004f] font-bold">
            {product ? "Editar" : "Agregar"}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Bell />

          <div ref={menuRef} className="relative">
            <img
              src="https://ui-avatars.com/api/?name=User"
              className="w-9 h-9 rounded-full cursor-pointer"
              onClick={()=>setIsMenuOpen(!isMenuOpen)}
            />

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl w-48 p-2">
                <div className="md:hidden border-b mb-2 pb-2">
                  <button onClick={()=>navigate("/")} className="block w-full text-left p-2">Inventario</button>
                  <button onClick={()=>navigate("/ventas")} className="block w-full text-left p-2">Ventas</button>
                </div>
                <button className="flex gap-2 p-2 w-full">
                  <User size={16}/> Configuración
                </button>
                <button className="flex gap-2 p-2 text-red-500 w-full">
                  <LogOut size={16}/> Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🔴 SCANNER */}
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
        <div className="mb-10">
          <span className="text-xs text-[#bc004f] font-semibold">
            + MÓDULO DE INGRESOS
          </span>
          <h1 className="text-4xl font-extrabold mt-2">
            {product ? "Editar Producto" : "Agregar Producto"}
          </h1>
          <p className="text-gray-500 mt-2">
            Registra medicamentos o insumos al inventario.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* FORM */}
          <section className="lg:col-span-8 bg-white rounded-2xl p-8 shadow space-y-6">

            <div className="grid md:grid-cols-2 gap-6">

              <input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre comercial" className="input"/>
              <input name="sustancia" value={form.sustancia} onChange={handleChange} placeholder="Sustancia activa" className="input"/>
              <input name="precio" value={form.precio} onChange={handleChange} placeholder="Precio" className="input"/>
              <input name="stock" value={form.stock} onChange={handleChange} placeholder="Stock" className="input"/>

              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="input md:col-span-2"/>

              <div className="md:col-span-2 flex gap-3">
                <input name="codigo" value={form.codigo} onChange={handleChange} placeholder="Código" className="input flex-1"/>
                <button onClick={startScanner} className="bg-[#bc004f] text-white px-4 rounded-xl">
                  <Scan/>
                </button>
              </div>

            </div>

          </section>

          {/* IMAGEN */}
          <aside className="lg:col-span-4">
            <div className="bg-white rounded-2xl p-6 shadow text-center">

              <label className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-xl p-10">

                <input type="file" onChange={handleImage} hidden />

                {preview ? (
                  <img src={preview} className="rounded-xl w-full"/>
                ) : (
                  <div>
                    📷
                    <p>Subir imagen</p>
                  </div>
                )}

              </label>

            </div>
          </aside>

        </div>

        {/* BOTONES */}
        <div className="flex justify-end gap-4 mt-10">
          <button onClick={()=>navigate("/")} className="px-6 py-3 border rounded-full">
            Cancelar
          </button>

          <button onClick={handleSubmit} className="px-8 py-3 bg-[#bc004f] text-white rounded-full">
            {product ? "Actualizar" : "Guardar"}
          </button>
        </div>

        {/* FOOTER */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t">
        © 2026 Farmacia Médica Rincón
      </footer>

      </main>
    </div>
  );
};

export default Agregar;