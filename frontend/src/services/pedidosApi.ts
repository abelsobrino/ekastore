import type {
  Pedido,
  PedidoNuevo,
  CambioEstado
} from "../types/Pedido";

import { peticionApi } from "./authApi";

export function listarPedidos() {
  return peticionApi<Pedido[]>("/api/pedidos");
}

export function registrarPedido(datos: PedidoNuevo) {
  return peticionApi<Pedido>(
    "/api/pedidos",
    "POST",
    datos
  );
}

export function actualizarEstadoPedido(
  numero: string,
  estado: CambioEstado
) {
  return peticionApi<Pedido>(
    `/api/pedidos/${encodeURIComponent(numero)}/estado`,
    "PUT",
    { estado }
  );
}
