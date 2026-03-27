import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pill } from "lucide-react";
import logo from "../assets/logo.jpeg"; // 🔥 IMPORTANTE

const Welcome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center overflow-hidden">

      {/* 🔥 SPLASH / LOADING */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 z-50 animate-fadeOut">

          <div className="mb-6 animate-softBounce">
            <Pill size={60} className="text-[#bc004f]" />
          </div>

          <p className="text-gray-500 text-sm tracking-wide">
            Cargando sistema...
          </p>

        </div>
      )}

      {/* 🔽 CONTENIDO FINAL */}
      {!loading && (
        <div className="text-center w-full max-w-sm px-6 animate-fadeIn">

          {/* 🔥 AQUÍ VA EL LOGO (LO QUE QUERÍAS) */}
          <div className="mb-8 flex justify-center">
            <img
              src={logo}
              alt="logo"
              className="w-56 object-contain drop-shadow-md"
            />
          </div>

          <p className="text-xs tracking-[0.3em] text-gray-400 uppercase">
            Farmacia
          </p>

          <h1 className="text-3xl font-extrabold text-gray-800">
            Médica Rincón
          </h1>

          <div className="w-16 h-1 bg-[#bc004f] mx-auto my-4 rounded-full"></div>

          <h2 className="text-lg font-semibold text-[#bc004f] mb-8">
            BIENVENIDO
          </h2>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 bg-[#bc004f] text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition"
          >
            Iniciar Sesión / Registrarse
          </button>

          <p className="text-sm text-gray-500 mt-6">
            "Tu salud es nuestra prioridad"
          </p>

          <div className="flex justify-center gap-6 mt-6 text-xs text-gray-400">
            <button onClick={() => navigate("/terminos")}>
              Términos
            </button>
            <button onClick={() => navigate("/privacidad")}>
              Privacidad
            </button>
            <button onClick={() => navigate("/contacto")}>
              Contacto
            </button>
          </div>
        </div>
      )}

      {/* 🔥 ANIMACIONES */}
      <style>
        {`
          .animate-softBounce {
            animation: softBounce 1.5s infinite ease-in-out;
          }

          @keyframes softBounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }

          .animate-fadeOut {
            animation: fadeOut 2.2s ease forwards;
          }

          @keyframes fadeOut {
            0% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; }
          }

          .animate-fadeIn {
            animation: fadeIn 0.8s ease forwards;
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

    </div>
  );
};

export default Welcome;