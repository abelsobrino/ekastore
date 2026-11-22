export interface Producto {
  codigo: string
  nombre: string
  descripcion: string
  marca: string
  categoria: string
  precio: number
  modalidadDisponibilidad: string
}

export interface Credenciales {
  usuario: string
  clave: string
}