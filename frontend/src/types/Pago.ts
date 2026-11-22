export type MetodoPago =
  | "EFECTIVO"
  | "YAPE"
  | "PLIN"
  | "TRANSFERENCIA"
  | "OTRO";

export interface Pago {
  nroPago: string;
  nroPedido: string;
  fecha: string;
  monto: number;
  metodo: MetodoPago;
}

export interface PagoRequest {
  nroPedido: string;
  monto: number;
  metodo: MetodoPago;
}