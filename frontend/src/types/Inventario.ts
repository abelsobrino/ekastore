export interface Inventario {
  codigoProducto: string
  nombre: string
  marca: string
  cantidad: number
  stockMinimo: number
  fechaActualizacion: string | null
}

export interface MovimientoInventario {
  nroMovimiento: string
  codigoProducto: string
  fecha: string
  tipo: string
  cantidad: number
  motivo: string | null
  fechaVencimiento: string | null
}

export interface MovimientoRequest {
  tipo: 'ENTRADA' | 'SALIDA'
  cantidad: number
  motivo: string
  fechaVencimiento: string | null
}