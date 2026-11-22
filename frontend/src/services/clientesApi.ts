import type { Cliente } from "../types/Cliente";
import { peticionApi } from "./authApi";

export function listarClientes() {
  return peticionApi<Cliente[]>("/api/clientes");
}

export function registrarCliente(cliente: Cliente) {
  return peticionApi<Cliente>(
    "/api/clientes",
    "POST",
    cliente
  );
}

export function actualizarCliente(cliente: Cliente) {
  return peticionApi<Cliente>(
    `/api/clientes/${encodeURIComponent(cliente.dni)}`,
    "PUT",
    cliente
  );
}