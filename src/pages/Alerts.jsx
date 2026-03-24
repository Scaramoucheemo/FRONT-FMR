import React from "react";
import { IoMenu, IoNotifications, IoHome, IoPerson, IoReceipt, IoAdd } from "react-icons/io5";
import { MdOutlineCalendarToday, MdAccessTime, MdWarning } from "react-icons/md";

const NOTIFICATION_DATA = [
  {
    id: "1",
    type: "VENCIDO",
    name: "Amoxicilina 500mg",
    batch: "AMX-2023-09",
    expiryDate: "15 OCT 2023",
    stock: "24 Unidades",
  },
  {
    id: "2",
    type: "PROXIMO",
    name: "Paracetamol Jarabe",
    batch: "PRT-2024-12",
    expiryDate: "20 DIC 2024",
    stock: "120 Unidades",
  },
  {
    id: "3",
    type: "PROXIMO",
    name: "Insulina Glargina",
    batch: "INS-2024-05",
    expiryDate: "15 ENE 2025",
    stock: "8 Unidades",
  },
];

const Alerts = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-28">

      {/* HEADER */}
      <div className="flex justify-between items-center bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center">
            💊
          </div>
          <h1 className="font-extrabold text-lg md:text-xl">Farmacia Médica Rincón</h1>
        </div>
        <IoMenu size={26} />
      </div>

      {/* CONTENIDO */}
      <div className="px-5 py-6 max-w-5xl mx-auto">

        <p className="text-xs font-bold text-slate-500 tracking-widest">
          CENTRO DE CONTROL
        </p>
        <h2 className="text-2xl md:text-3xl font-black mb-6">
          NOTIFICACIONES
        </h2>

        {/* BANNER */}
        <div className="bg-pink-100 rounded-3xl p-6 mb-6">
          <h3 className="font-bold text-lg mb-2">
            Medicamentos próximos a vencer
          </h3>
          <p className="text-sm text-slate-600">
            Gestione el inventario crítico para garantizar la seguridad del paciente.
          </p>
        </div>

        {/* TARJETAS */}
        <div className="grid md:grid-cols-2 gap-5">
          {NOTIFICATION_DATA.map((item) => {
            const isExpired = item.type === "VENCIDO";

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-xs font-extrabold ${isExpired ? "text-red-500" : "text-pink-500"}`}>
                      {isExpired ? "PRODUCTO VENCIDO" : "PRÓXIMO A VENCER"}
                    </p>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-sm text-slate-500">
                      Lote: {item.batch}
                    </p>
                  </div>

                  <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${isExpired ? "bg-red-100" : "bg-pink-100"}`}>
                    {isExpired ? <MdWarning size={24} /> : <MdAccessTime size={24} />}
                  </div>
                </div>

                <hr className="my-4" />

                <div className="flex justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 font-bold">VENCIMIENTO</p>
                    <p className={`font-bold ${isExpired ? "text-red-500" : ""}`}>
                      {item.expiryDate}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-bold">STOCK</p>
                    <p className="font-bold">{item.stock}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-slate-100 rounded-xl py-2 font-bold">
                    Editar
                  </button>
                  <button className={`flex-1 rounded-xl py-2 font-bold ${isExpired ? "bg-red-500 text-white" : "bg-red-100 text-red-500"}`}>
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* AGREGAR */}
        <div className="border-2 border-dashed rounded-3xl p-8 text-center mt-6">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto shadow">
            <IoAdd size={28} />
          </div>
          <p className="font-bold mt-3">Agregar Medicamento</p>
          <p className="text-sm text-slate-500">
            Escanee un nuevo lote
          </p>
        </div>
      </div>

      {/* BOTÓN FLOTANTE */}
      <div className="fixed bottom-24 right-5 w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center shadow-lg">
        📷
      </div>

      {/* NAVBAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t flex justify-around py-3">
        <div className="text-center text-slate-400 text-xs">
          <IoHome size={22} className="mx-auto" />
          HOME
        </div>
        <div className="text-center text-slate-400 text-xs">
          <IoReceipt size={22} className="mx-auto" />
          SALES
        </div>
        <div className="text-center text-black text-xs font-bold bg-pink-100 px-3 py-1 rounded-xl">
          <IoNotifications size={22} className="mx-auto" />
          ALERTS
        </div>
        <div className="text-center text-slate-400 text-xs">
          <IoPerson size={22} className="mx-auto" />
          PROFILE
        </div>
      </div>

    </div>
  );
};

export default Alerts;