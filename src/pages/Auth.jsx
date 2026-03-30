import React, { useState } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    confirmPassword: "",
    fecha: "",
    telefono: "",
    rol: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 🔥 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://161.35.234.161/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      if (data.token) localStorage.setItem("token", data.token);

      window.location.href = "/home";
    } catch (error) {
      alert(error.message);
    }
  };

  // 🔥 REGISTER
  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return alert("Las contraseñas no coinciden");
    }

    try {
      const response = await fetch("http://161.35.234.161/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellidos: formData.apellidos,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono,
          fechaNacimiento: formData.fecha,
          rol: formData.rol
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      alert("Registro exitoso");
      setIsLogin(true);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-50 p-4">
      {/* Contenedor principal */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden min-h-[600px] lg:min-h-[650px]">
        
        {/* Panel de imagen - Solo visible en desktop */}
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

        {/* Contenedor de formularios - CORREGIDO */}
        <div 
          className={`w-full lg:w-1/2 transition-all duration-700 ease-in-out ${
            isLogin 
              ? "lg:translate-x-0" 
              : "lg:translate-x-0 lg:ml-auto"
          }`}
        >
          
          {/* FORM LOGIN */}
          {isLogin && (
            <div className="p-6 sm:p-8 md:p-10">
              {/* LOGO */}
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
                {/* EMAIL */}
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

                {/* PASSWORD */}
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

                {/* BOTÓN LOGIN */}
                <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition flex items-center justify-center gap-2">
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
          )}

          {/* FORM REGISTER */}
          {!isLogin && (
            <div className="p-6 sm:p-8 md:p-10">
              <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
                Crear cuenta
              </h1>
              <p className="text-gray-500 mb-6 text-sm">
                Completa tus datos para registrarte
              </p>

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Nombre y Apellidos */}
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
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleChange}
                      placeholder="Apellidos"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Password y Confirmar */}
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

                {/* Fecha y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                      calendar_today
                    </span>
                    <input
                      type="date"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-1">
                      <span className="material-symbols-outlined text-gray-600 text-xl">
                        flag
                      </span>
                      <span className="font-medium">+52</span>
                    </div>
                    <input
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="Teléfono"
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-transparent outline-none transition"
                      required
                    />
                  </div>
                </div>

                {/* Rol */}
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
                    <option value="medico">Médico</option>
                    <option value="enfermeria">Enfermería</option>
                    <option value="admin">Administrador</option>
                    <option value="farmaceutico">Farmacéutico</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    expand_more
                  </span>
                </div>

                {/* BOTÓN REGISTRO */}
                <button className="w-full py-4 bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition transform hover:scale-[1.02]">
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