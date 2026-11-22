import type {
  Inventario,
  MovimientoInventario,
  MovimientoRequest
} from '../types/Inventario'

import { peticionApi } from './authApi'

export function listarInventario() {
  return peticionApi<Inventario[]>('/api/inventario')
}

export function registrarMovimiento(
  codigo: string,
  datos: MovimientoRequest
) {
  return peticionApi<MovimientoInventario>(
    `/api/inventario/${encodeURIComponent(codigo)}/movimientos`,
    'POST',
    datos
  )
}

export function consultarMovimientos(codigo: string) {
  return peticionApi<MovimientoInventario[]>(
    `/api/inventario/${encodeURIComponent(codigo)}/movimientos`
  )
}