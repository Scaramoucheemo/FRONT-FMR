import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const useAlerts = () => {
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/api/lotes`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) return;
        const data = await res.json();

        if (!Array.isArray(data)) return;

        const today = new Date();
        const future = new Date();
        future.setMonth(today.getMonth() + 3);

        // Contamos cuántos lotes están vencidos o próximos a vencer
        const count = data.filter(lote => {
          if (!lote.fecha_caducidad) return false;
          const exp = new Date(lote.fecha_caducidad);
          return exp <= future;
        }).length;

        setAlertCount(count);
      } catch (err) {
        console.error("Error al cargar contador de alertas:", err);
      }
    };

    fetchAlertCount();
  }, []);

  return alertCount;
};