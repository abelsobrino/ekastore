import type { Pago, PagoRequest } from "../types/Pago";
import { peticionApi } from "./authApi";

export function listarPagos() {
  return peticionApi<Pago[]>("/api/pagos");
}

export function listarPagosPorPedido(numero: string) {
  return peticionApi<Pago[]>(
    `/api/pagos/pedido/${encodeURIComponent(numero)}`
  );
}

export function registrarPago(datos: PagoRequest) {
  return peticionApi<Pago>(
    "/api/pagos",
    "POST",
    datos
  );
}