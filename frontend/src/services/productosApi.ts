import type { Producto } from '../types/Producto'
import { peticionApi } from './authApi'

export function listarProductos() {
  return peticionApi<Producto[]>('/api/productos')
}

export function registrarProducto(producto: Producto) {
  return peticionApi<Producto>(
    '/api/productos',
    'POST',
    producto
  )
}

export function actualizarProducto(producto: Producto) {
  return peticionApi<Producto>(
    `/api/productos/${encodeURIComponent(producto.codigo)}`,
    'PUT',
    producto
  )
}