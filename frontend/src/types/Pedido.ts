export interface LineaPedido {
  codigoProducto: string;
  cantidad: number;
}

export interface PedidoNuevo {
  dniCliente: string;
  modalidadEntrega: "ENVIO_NACIONAL" | "ENTREGA_LOCAL";
  detalles: LineaPedido[];
}

export type EstadoPedido =
  | "PENDIENTE_DE_STOCK"
  | "PENDIENTE"
  | "ACUMULADO"
  | "EN_PROCESO"
  | "ENVIADO"
  | "ENTREGADO";

export type CambioEstado =
  | "ACUMULADO"
  | "EN_PROCESO"
  | "ENVIADO"
  | "ENTREGADO";

export interface DetallePedido {
  codigoProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface Pedido {
  nroPedido: string;
  fecha: string;
  dniCliente: string;
  nombreCliente: string;
  total: number;
  estado: EstadoPedido;
  estadoPago: string;
  modalidadEntrega: string;
  detalles: DetallePedido[];
}