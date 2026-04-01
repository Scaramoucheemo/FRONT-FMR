import React, { useState } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  // Variable de entorno de Vite para apuntar al backend (Local o Producción)
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "", 
    email: "",
    password: "",
    confirmPassword: "",
    rol: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  //  LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Ajuste de ruta: Verifica si tu endpoint de login es /api/usuarios/login o /api/auth/login
      const response = await fetch(`${apiUrl}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error al iniciar sesión");

      // Si el backend responde con un token, lo guardamos
      if (data.token) localStorage.setItem("token", data.token);

      alert("¡Bienvenido!");
      window.location.href = "/home";
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  //  REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return alert("Las contraseñas no coinciden");
    }

    try {
      // Ajuste de ruta: Tu endpoint para crear usuarios es /api/usuarios
      const response = await fetch(`${apiUrl}/api/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          rol: formData.rol
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Error al registrar usuario");

      alert("Registro exitoso. Ahora puedes iniciar sesión.");
      // Limpiamos la contraseña y cambiamos a la vista de login
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
      setIsLogin(true);
      
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] lg:min-h-[650px]">
        
        {/* Panel de imagen */}
        <div 
          className={`hidden lg:block absolute top-0 w-1/2 h-full transition-all duration-700 ease-in-out z-20 ${
            isLogin ? "right-0" : "left-0"
          }`}
        >
          <img
            src="https://cdn.shopify.com/s/files/1/0744/1969/files/anaqueles-para-farmacia-con-medicamentos_480x480.jpg?v=1759265750"
            className="w-full h-full object-cover"
            alt="Farmacia"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-700/40 to-transparent"></div>
          <div className="absolute bottom-10 left-8 text-white max-w-sm">
            <h2 className="text-4xl font-extrabold mb-3">
              Farmacia Médica Rincón
            </h2>
            <p className="text-sm opacity-90">
              "Tu salud es nuestra prioridad"
            </p>
          </div>
        </div>

        {/* Contenedor de formularios */}
        <div 
          className={`w-full lg:w-1/2 transition-all duration-700 ease-in-out ${
            isLogin ? "lg:translate-x-0" : "lg:translate-x-0 lg:ml-auto"
          }`}
        >
          
          {/* FORM LOGIN */}
          {isLogin ? (
            <div className="p-6 sm:p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-pink-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-white text-3xl">
                    local_hospital
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-gray-800">
                  Inicia sesión
                </h1>
                <p className="text-gray-500 mt-2 text-sm">
                  Inicia sesión en tu cuenta
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition text-xl"
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>

                <button type="submit" className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition flex items-center justify-center gap-2 mt-6">
                  <span className="material-symbols-outlined text-xl">
                    login
                  </span>
                  Iniciar sesión
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                ¿No tienes cuenta?{" "}
                <span
                  onClick={() => setIsLogin(false)}
                  className="text-pink-600 font-bold cursor-pointer hover:text-pink-700 transition"
                >
                  Regístrate aquí
                </span>
              </p>
            </div>
          ) : (
            /* FORM REGISTER */
            <div className="p-6 sm:p-8 md:p-10">
              <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
                Crear cuenta
              </h1>
              <p className="text-gray-500 mb-6 text-sm">
                Completa tus datos para registrarte
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      person
                    </span>
                    <input
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Nombre"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      badge
                    </span>
                    <input
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      placeholder="Apellidos"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      lock
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Contraseña"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition text-xl"
                    >
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      lock_clock
                    </span>
                    <input
                      type={showVerifyPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmar contraseña"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                      required
                    />
                    <span
                      onClick={() => setShowVerifyPassword(!showVerifyPassword)}
                      className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition text-xl"
                    >
                      {showVerifyPassword ? "visibility_off" : "visibility"}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    medical_services
                  </span>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Vendedor">Vendedor</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>

                <button type="submit" className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.02] mt-6">
                  <span className="material-symbols-outlined">
                    how_to_reg
                  </span>
                  Crear cuenta
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              </form>

              <p className="text-center text-sm text-gray-500 mt-6">
                ¿Ya tienes cuenta?{" "}
                <span
                  onClick={() => setIsLogin(true)}
                  className="text-pink-600 font-bold cursor-pointer hover:text-pink-700 transition"
                >
                  Inicia sesión aquí
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;