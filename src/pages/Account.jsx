import { useState } from 'react';
import { useNavigate } from "react-router-dom";


const Account = () => {
  const [activeNav, setActiveNav] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  const userData = {
    firstName: 'Juan',
    lastName: 'Pérez García',
    email: 'juan.perez@email.com',
    password: 'password123',
    birthDate: '05/12/1990',
    phone: '5512345678',
    role: 'Médico General'
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="w-full sticky top-0 z-50 bg-white dark:bg-background-dark shadow-sm">
        <div className="flex justify-around items-center px-4 h-16 max-w-7xl mx-auto">
          <button
            onClick={() => setActiveNav('home')}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
              activeNav === 'home' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined">home</span>
            <span className="font-['Inter'] text-[12px] font-medium tracking-wide uppercase mt-1">Home</span>
          </button>
          
          <button
            onClick={() => setActiveNav('inventory')}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
              activeNav === 'inventory' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="font-['Inter'] text-[12px] font-medium tracking-wide uppercase mt-1">Inventory</span>
          </button>
          
          <button
            onClick={() => setActiveNav('sales')}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
              activeNav === 'sales' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="font-['Inter'] text-[12px] font-medium tracking-wide uppercase mt-1">Sales</span>
          </button>
          
          <button
            onClick={() => setActiveNav('alerts')}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
              activeNav === 'alerts' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="font-['Inter'] text-[12px] font-medium tracking-wide uppercase mt-1">Alerts</span>
          </button>
          
          <button
            onClick={() => setActiveNav('profile')}
            className={`flex flex-col items-center justify-center px-4 py-1 transition-all ${
              activeNav === 'profile' 
                ? 'text-primary' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
            <span className="font-['Inter'] text-[12px] font-medium tracking-wide uppercase mt-1">Profile</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="relative flex h-auto min-h-screen w-full flex-col max-w-md mx-auto bg-white dark:bg-background-dark shadow-xl overflow-x-hidden">
        {/* Top Header */}
        <div className="flex items-center bg-white dark:bg-background-dark p-4 border-b border-primary/20 sticky top-0 z-10">
          <div className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center cursor-pointer">
            <span className="material-symbols-outlined">arrow_back</span>
          </div>
          <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Farmacia Médica Rincón</h2>
          <div className="size-10"></div> {/* Spacer for centering */}
        </div>

        {/* Profile Section */}
        <div className="flex p-6">
          <div className="flex w-full flex-col gap-4 items-center sm:flex-row sm:items-center">
            <div className="relative">
              <div 
                className="bg-primary/30 bg-center bg-no-repeat aspect-square bg-cover rounded-full h-24 w-24 flex items-center justify-center border-2 border-primary"
                style={{ 
                  backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDWJwS8FNYFz0pZI_gTkx8H8YK4Uv1e4xt3gDjZ07wBUVDfAnKVWVkfvMJH5xFzREsIY35lOIdP7x_xuLK3IZK0tSzrU5Oibj2dNPSlkB5RpCg04bhCW26mawHHTJHCNtF3SwSUqThCgKMD5nuLTvhl9BfXPjY9El0JSnsqVHO13nmDlFZKPPzUZzzSXEShCZ5wvvfvV2VS40sse--yoPwy1KA-GF8EOQVsuULfJYoUkYo0wd-Y0Gf6283GlAJgP7oQW_WAwFp1tKg")'
                }}
              >
              </div>
              <div className="absolute bottom-0 right-0 bg-primary p-1 rounded-full shadow-sm border border-white">
                <span className="material-symbols-outlined text-sm text-slate-900">edit</span>
              </div>
            </div>
            <div className="flex flex-col justify-center text-center sm:text-left">
              <p className="text-slate-900 dark:text-slate-100 text-2xl font-bold leading-tight tracking-[-0.015em]">
                ¡HOLA! <span className="text-slate-600 dark:text-slate-400">{userData.firstName} {userData.lastName.split(' ')[0]}</span>
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-normal">Gestiona los detalles de tu cuenta</p>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className="px-6 pb-24">
          <h3 className="text-slate-900 dark:text-slate-100 text-sm font-bold leading-tight tracking-wider uppercase mb-4 opacity-70">DATOS GENERALES</h3>
          <div className="space-y-4">
            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">NOMBRE</label>
              <input 
                className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:border-primary focus:ring-primary dark:text-slate-100 outline-none transition-all" 
                type="text" 
                defaultValue={userData.firstName}
              />
            </div>

            {/* Last Name */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">APELLIDO</label>
              <input 
                className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:border-primary focus:ring-primary dark:text-slate-100 outline-none transition-all" 
                type="text" 
                defaultValue={userData.lastName}
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">CORREO ELECTRÓNICO</label>
              <div className="relative">
                <input 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:border-primary focus:ring-primary dark:text-slate-100 outline-none transition-all pr-10" 
                  type="email" 
                  defaultValue={userData.email}
                />
                <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">mail</span>
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">CONTRASEÑA</label>
              <div className="relative">
                <input 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:border-primary focus:ring-primary dark:text-slate-100 outline-none transition-all pr-10" 
                  type={showPassword ? "text" : "password"} 
                  defaultValue={userData.password}
                />
                <span 
                  className="material-symbols-outlined absolute right-3 top-3 text-slate-400 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </div>
              <a className="text-blue-500 text-xs font-medium mt-1 ml-1 hover:underline cursor-pointer" href="#">cambiar contraseña</a>
            </div>

            {/* Birth Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">FECHA DE NACIMIENTO</label>
              <div className="relative">
                <input 
                  className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:border-primary focus:ring-primary dark:text-slate-100 outline-none transition-all pr-10" 
                  placeholder="mm/dd/yyyy" 
                  type="text" 
                  defaultValue={userData.birthDate}
                />
                <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400">calendar_today</span>
              </div>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">TELÉFONO</label>
              <div className="flex gap-2">
                <div className="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-slate-500 text-center">+52</div>
                <input 
                  className="flex-1 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:border-primary focus:ring-primary dark:text-slate-100 outline-none transition-all" 
                  type="tel" 
                  defaultValue={userData.phone}
                />
              </div>
            </div>

            {/* Responsable (Grado) */}
            <div className="flex flex-col gap-1 pb-6">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">RESPONSABLE (GRADO)</label>
              <select className="w-full rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-3 focus:border-primary focus:ring-primary dark:text-slate-100 outline-none transition-all cursor-pointer">
                <option value="">Selecciona grado</option>
                <option value="medico">Médico</option>
                <option value="enfermera">Enfermería</option>
                <option value="administrador">Administrador</option>
                <option value="farmaceutico">Farmacéutico</option>

              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4">
              <button className="w-full bg-primary hover:bg-primary/80 text-slate-900 font-bold py-4 rounded-xl shadow-sm transition-all uppercase tracking-wide active:scale-95">
                Guardar
              </button>
              <button className="w-full bg-background-dark dark:bg-slate-800 hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-sm transition-all uppercase tracking-wide active:scale-95">
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
      `}</style>
    </div>
  );
};

export default Account;