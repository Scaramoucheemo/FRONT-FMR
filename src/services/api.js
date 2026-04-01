// src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL;;

export const api = {
  // Productos
  async getProductos() {
    const response = await fetch(`${API_BASE}/productos`);
    if (!response.ok) throw new Error('Error al cargar productos');
    return response.json();
  },

  async getProductByCodigo(codigo) {
    const response = await fetch(`${API_BASE}/productos/buscar/${codigo}`);
    if (!response.ok) throw new Error('Producto no encontrado');
    return response.json();
  },

  async getProductById(id) {
    const response = await fetch(`${API_BASE}/productos/${id}`);
    if (!response.ok) throw new Error('Producto no encontrado');
    return response.json();
  },

  async updateStock(productId, cantidad) {
    const response = await fetch(`${API_BASE}/productos/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cantidad })
    });
    if (!response.ok) throw new Error('Error al actualizar stock');
    return response.json();
  },

  // Ventas
  async crearVenta(ventaData) {
    const response = await fetch(`${API_BASE}/ventas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ventaData)
    });
    if (!response.ok) throw new Error('Error al crear venta');
    return response.json();
  },

  async getVentas() {
    const response = await fetch(`${API_BASE}/ventas`);
    if (!response.ok) throw new Error('Error al cargar ventas');
    return response.json();
  },

  async getVentaById(id) {
    const response = await fetch(`${API_BASE}/ventas/${id}`);
    if (!response.ok) throw new Error('Venta no encontrada');
    return response.json();
  },

  // Clientes
  async getClientes() {
    const response = await fetch(`${API_BASE}/clientes`);
    if (!response.ok) throw new Error('Error al cargar clientes');
    return response.json();
  },

  async crearCliente(clienteData) {
    const response = await fetch(`${API_BASE}/clientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clienteData)
    });
    if (!response.ok) throw new Error('Error al crear cliente');
    return response.json();
  },

  // Usuario actual
  async getUsuarioActual() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Error al obtener usuario');
    return response.json();
  }
};