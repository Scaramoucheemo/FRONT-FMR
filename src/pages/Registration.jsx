import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      
      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-xs font-bold tracking-widest text-slate-400">
            BIENVENIDO
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-2">
            Registrar nuevo usuario
          </h1>
        </div>

        {/* Form */}
        <div className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Nombre
            </label>
            <input
              type="text"
              placeholder="Ej. Ana"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Apellidos
            </label>
            <input
              type="text"
              placeholder="Ej. García"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Correo
            </label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="w-full px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 cursor-pointer text-slate-400"
              >
                👁️
              </span>
            </div>
          </div>

          {/* Verify Password */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Verificar contraseña
            </label>
            <div className="relative mt-1">
              <input
                type={showVerifyPassword ? "text" : "password"}
                placeholder="********"
                className="w-full px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <span
                onClick={() =>
                  setShowVerifyPassword(!showVerifyPassword)
                }
                className="absolute right-3 top-3 cursor-pointer text-slate-400"
              >
                👁️
              </span>
            </div>
          </div>

          {/* Fecha */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Teléfono
            </label>
            <div className="flex gap-2 mt-1">
              <div className="px-4 py-3 bg-slate-100 rounded-xl">
                +52
              </div>
              <input
                type="tel"
                placeholder="0000000000"
                className="flex-1 px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="text-sm font-semibold text-slate-500">
              Rol
            </label>
            <select className="w-full mt-1 px-4 py-3 rounded-xl bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-300">
              <option>Seleccionar</option>
              <option>Médico</option>
              <option>Enfermería</option>
              <option>Administrador</option>
              <option>Farmacéutico</option>
            </select>
          </div>

          {/* Botón */}
          <button className="w-full bg-pink-400 hover:bg-pink-500 text-black font-bold py-4 rounded-xl mt-4 transition">
            Guardar
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-[1px] bg-slate-200"></div>
            <span className="text-slate-400 text-sm">o</span>
            <div className="flex-1 h-[1px] bg-slate-200"></div>
          </div>

          {/* Login */}
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-4 rounded-xl transition"
          >
            Iniciar sesión
          </button>

          <p className="text-xs text-center text-slate-400 mt-4">
            Al registrarte aceptas términos y condiciones
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;