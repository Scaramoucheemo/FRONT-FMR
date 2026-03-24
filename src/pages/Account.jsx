import { useState } from "react";
import {
  IoHome,
  IoNotifications,
  IoPerson,
  IoReceipt,
  IoEye,
  IoEyeOff,
  IoMail,
  IoCalendar,
  IoArrowBack,
} from "react-icons/io5";

const Account = () => {
  const [activeNav, setActiveNav] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);

  const userData = {
    firstName: "Juan",
    lastName: "Pérez García",
    email: "juan.perez@email.com",
    password: "password123",
    birthDate: "05/12/1990",
    phone: "5512345678",
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">

      {/* NAV SUPERIOR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3 z-50">
        {[
          { key: "home", icon: <IoHome />, label: "HOME" },
          { key: "sales", icon: <IoReceipt />, label: "SALES" },
          { key: "alerts", icon: <IoNotifications />, label: "ALERTS" },
          { key: "profile", icon: <IoPerson />, label: "PROFILE" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveNav(item.key)}
            className={`flex flex-col items-center text-xs ${
              activeNav === item.key
                ? "text-black font-bold bg-pink-100 px-3 py-1 rounded-xl"
                : "text-slate-400"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* CONTENEDOR */}
      <div className="max-w-3xl mx-auto bg-white min-h-screen shadow-lg">

        {/* HEADER */}
        <div className="flex items-center p-4 border-b">
          <IoArrowBack size={22} className="cursor-pointer" />
          <h2 className="flex-1 text-center font-bold text-lg">
            Farmacia Médica Rincón
          </h2>
        </div>

        {/* PERFIL */}
        <div className="p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-pink-100 flex items-center justify-center text-3xl">
              👤
            </div>
          </div>

          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold">
              ¡Hola!{" "}
              <span className="text-slate-500">
                {userData.firstName}
              </span>
            </h3>
            <p className="text-sm text-slate-500">
              Gestiona los detalles de tu cuenta
            </p>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="px-6 pb-24 space-y-4">

          <p className="text-xs font-bold text-slate-400 tracking-widest">
            DATOS GENERALES
          </p>

          {/* INPUT */}
          <Input label="NOMBRE" defaultValue={userData.firstName} />
          <Input label="APELLIDO" defaultValue={userData.lastName} />

          {/* EMAIL */}
          <div>
            <label className="label">CORREO</label>
            <div className="input-icon">
              <input type="email" defaultValue={userData.email} />
              <IoMail />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="label">CONTRASEÑA</label>
            <div className="input-icon">
              <input
                type={showPassword ? "text" : "password"}
                defaultValue={userData.password}
              />
              <span onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <IoEyeOff /> : <IoEye />}
              </span>
            </div>
          </div>

          {/* FECHA */}
          <div>
            <label className="label">FECHA DE NACIMIENTO</label>
            <div className="input-icon">
              <input defaultValue={userData.birthDate} />
              <IoCalendar />
            </div>
          </div>

          {/* TELÉFONO */}
          <div>
            <label className="label">TELÉFONO</label>
            <div className="flex gap-2">
              <div className="input w-20 text-center">+52</div>
              <input
                className="input flex-1"
                defaultValue={userData.phone}
              />
            </div>
          </div>

          {/* SELECT */}
          <div>
            <label className="label">ROL</label>
            <select className="input">
              <option>Médico</option>
              <option>Administrador</option>
              <option>Farmacéutico</option>
            </select>
          </div>

          {/* BOTONES */}
          <button className="btn-primary">Guardar</button>
          <button className="btn-secondary">Cerrar sesión</button>
        </div>
      </div>

      {/* ESTILOS reutilizables */}
      <style>{`
        .label {
          font-size: 12px;
          font-weight: bold;
          color: #64748b;
          margin-bottom: 4px;
          display: block;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: #f1f5f9;
          outline: none;
        }

        .input-icon {
          display: flex;
          align-items: center;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 0 10px;
        }

        .input-icon input {
          flex: 1;
          padding: 12px;
          background: transparent;
          outline: none;
        }

        .btn-primary {
          width: 100%;
          background: #f472b6;
          padding: 14px;
          border-radius: 12px;
          font-weight: bold;
          color: black;
        }

        .btn-secondary {
          width: 100%;
          background: #1e293b;
          padding: 14px;
          border-radius: 12px;
          font-weight: bold;
          color: white;
        }
      `}</style>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <div>
    <label className="label">{label}</label>
    <input className="input" {...props} />
  </div>
);

export default Account;