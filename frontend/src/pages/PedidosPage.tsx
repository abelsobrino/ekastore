import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Cliente } from "../types/Cliente";
import type { Producto } from "../types/Producto";
import type {
  Pedido,
  PedidoNuevo,
  LineaPedido,
  CambioEstado,
} from "../types/Pedido";

import { listarClientes } from "../services/clientesApi";
import { listarProductos } from "../services/productosApi";

import {
  listarPedidos,
  registrarPedido,
  actualizarEstadoPedido,
} from "../services/pedidosApi";

function formularioInicial(): PedidoNuevo {
  return {
    dniCliente: "",
    modalidadEntrega: "ENTREGA_LOCAL",
    detalles: [{ codigoProducto: "", cantidad: 1 }],
  };
}

function opcionesEstado(pedido: Pedido): {
  estado: CambioEstado;
  etiqueta: string;
}[] {
  if (pedido.estado === "PENDIENTE" || pedido.estado === "PENDIENTE_DE_STOCK") {
    return [
      { estado: "ACUMULADO", etiqueta: "Acumular" },
      { estado: "EN_PROCESO", etiqueta: "Preparar pedido" },
    ];
  }

  if (pedido.estado === "ACUMULADO") {
    return [{ estado: "EN_PROCESO", etiqueta: "Preparar pedido" }];
  }

  if (pedido.estado === "EN_PROCESO") {
    return [
      { estado: "ENVIADO", etiqueta: "Marcar enviado" },
      ...(pedido.modalidadEntrega === "ENTREGA_LOCAL"
        ? [
            {
              estado: "ENTREGADO" as CambioEstado,
              etiqueta: "Marcar entregado",
            },
          ]
        : []),
    ];
  }

  if (pedido.estado === "ENVIADO") {
    return [{ estado: "ENTREGADO", etiqueta: "Marcar entregado" }];
  }

  return [];
}

export default function PedidosPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);

  const [formulario, setFormulario] =
    useState<PedidoNuevo>(formularioInicial());

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const [listaClientes, listaProductos, listaPedidos] = await Promise.all(
          [listarClientes(), listarProductos(), listarPedidos()],
        );

        if (!activo) return;

        setClientes(listaClientes);
        setProductos(listaProductos);
        setPedidos(listaPedidos);
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error ? err.message : "Error al cargar los pedidos.",
          );
        }
      } finally {
        if (activo) setCargandoDatos(false);
      }
    }

    void cargar();

    return () => {
      activo = false;
    };
  }, []);

  function agregarLinea() {
    setFormulario((actual) => ({
      ...actual,
      detalles: [...actual.detalles, { codigoProducto: "", cantidad: 1 }],
    }));
  }

  function modificarLinea(
    indice: number,
    campo: keyof LineaPedido,
    valor: string | number,
  ) {
    setFormulario((actual) => ({
      ...actual,
      detalles: actual.detalles.map((linea, i) =>
        i === indice ? { ...linea, [campo]: valor } : linea,
      ),
    }));
  }

  function quitarLinea(indice: number) {
    setFormulario((actual) => ({
      ...actual,
      detalles: actual.detalles.filter((_, i) => i !== indice),
    }));
  }

  const totalEstimado = formulario.detalles.reduce((total, linea) => {
    const producto = productos.find((p) => p.codigo === linea.codigoProducto);

    return total + (producto ? Number(producto.precio) * linea.cantidad : 0);
  }, 0);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (!formulario.dniCliente) {
      setError("Selecciona un cliente.");
      return;
    }

    if (formulario.detalles.length === 0) {
      setError("Agrega al menos un producto.");
      return;
    }

    const codigos = formulario.detalles.map((d) => d.codigoProducto);

    if (
      codigos.some((codigo) => !codigo) ||
      formulario.detalles.some(
        (linea) => !Number.isInteger(linea.cantidad) || linea.cantidad <= 0,
      )
    ) {
      setError("Completa correctamente los productos y cantidades.");
      return;
    }

    if (new Set(codigos).size !== codigos.length) {
      setError("No repitas un producto en el mismo pedido.");
      return;
    }

    setCargando(true);

    try {
      const nuevo = await registrarPedido(formulario);

      setPedidos(await listarPedidos());
      setFormulario(formularioInicial());

      setMensaje(`Pedido ${nuevo.nroPedido} registrado correctamente.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el pedido.",
      );
    } finally {
      setCargando(false);
    }
  }

  async function cambiarEstado(numero: string, estado: CambioEstado) {
    setCargando(true);
    setError("");
    setMensaje("");

    try {
      await actualizarEstadoPedido(numero, estado);
      setPedidos(await listarPedidos());

      setMensaje(`Estado del pedido ${numero} actualizado correctamente.`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo actualizar el estado.",
      );
    } finally {
      setCargando(false);
    }
  }

  const pedidosPendientes = pedidos.filter((p) =>
    ["PENDIENTE", "PENDIENTE_DE_STOCK", "ACUMULADO"].includes(p.estado),
  ).length;

  const pedidosEntregados = pedidos.filter(
    (p) => p.estado === "ENTREGADO",
  ).length;

  return (
    <>
      <header className="encabezado">
        <div>
          <span className="etiqueta">SISTEMA DE GESTIÓN</span>
          <h1>Gestión de pedidos</h1>
          <p>Registra y administra los pedidos de Eka Store.</p>
        </div>
        <span className="usuario">Administradora</span>
      </header>

      <section className="estadisticas">
        <div className="estadistica">
          <span>Total de pedidos</span>
          <strong>{pedidos.length}</strong>
        </div>
        <div className="estadistica">
          <span>Pedidos pendientes</span>
          <strong>{pedidosPendientes}</strong>
        </div>
        <div className="estadistica">
          <span>Pedidos entregados</span>
          <strong>{pedidosEntregados}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Registrar nuevo pedido</h2>
        <p>Selecciona un cliente y agrega sus productos.</p>

        {error && <div className="alerta error">{error}</div>}
        {mensaje && <div className="alerta exito">{mensaje}</div>}

        <form onSubmit={guardar} className="formulario">
          <div className="campo">
            <label htmlFor="pedido-cliente">Cliente</label>
            <select
              id="pedido-cliente"
              value={formulario.dniCliente}
              onChange={(e) =>
                setFormulario((actual) => ({
                  ...actual,
                  dniCliente: e.target.value,
                }))
              }
              required
            >
              <option value="">Seleccionar cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.dni} value={cliente.dni}>
                  {cliente.nombre} - {cliente.dni}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="pedido-entrega">Modalidad de entrega</label>
            <select
              id="pedido-entrega"
              value={formulario.modalidadEntrega}
              onChange={(e) =>
                setFormulario((actual) => ({
                  ...actual,
                  modalidadEntrega: e.target.value as
                    | "ENVIO_NACIONAL"
                    | "ENTREGA_LOCAL",
                }))
              }
            >
              <option value="ENTREGA_LOCAL">Entrega local</option>
              <option value="ENVIO_NACIONAL">Envío nacional (Shalom)</option>
            </select>
          </div>

          <div className="campo ancho-completo">
            <label>Productos del pedido</label>
          </div>

          {formulario.detalles.map((linea, indice) => (
            <div key={indice} className="ancho-completo pedido-linea">
              <div className="campo">
                <label>Producto {indice + 1}</label>
                <select
                  value={linea.codigoProducto}
                  onChange={(e) =>
                    modificarLinea(indice, "codigoProducto", e.target.value)
                  }
                  required
                >
                  <option value="">Seleccionar producto</option>
                  {productos.map((producto) => (
                    <option key={producto.codigo} value={producto.codigo}>
                      {producto.codigo} - {producto.nombre} (S/{" "}
                      {Number(producto.precio).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="campo">
                <label>Cantidad</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={linea.cantidad}
                  onChange={(e) =>
                    modificarLinea(indice, "cantidad", Number(e.target.value))
                  }
                />
              </div>

              <button
                type="button"
                className="boton secundario"
                onClick={() => quitarLinea(indice)}
                disabled={formulario.detalles.length === 1}
              >
                Quitar
              </button>
            </div>
          ))}

          <div className="acciones ancho-completo">
            <button
              type="button"
              className="boton secundario"
              onClick={agregarLinea}
            >
              + Agregar producto
            </button>
          </div>

          <div className="pedido-total ancho-completo">
            <span>Total estimado</span>
            <strong>S/ {totalEstimado.toFixed(2)}</strong>
          </div>

          <div className="acciones ancho-completo">
            <button
              className="boton principal"
              disabled={
                cargando ||
                cargandoDatos ||
                clientes.length === 0 ||
                productos.length === 0
              }
            >
              {cargando ? "Guardando..." : "Registrar pedido"}
            </button>
          </div>
        </form>

        {clientes.length === 0 && !cargandoDatos && (
          <p>Primero debes registrar un cliente.</p>
        )}
      </section>

      <section className="panel">
        <h2>Pedidos registrados</h2>
        <p>Consulta sus productos y administra sus estados.</p>

        {cargandoDatos && <p>Cargando pedidos...</p>}

        {!cargandoDatos && pedidos.length === 0 && (
          <p className="sin-datos">Todavía no hay pedidos registrados.</p>
        )}

        {pedidos.map((pedido) => (
          <div className="pedido-tarjeta" key={pedido.nroPedido}>
            <div className="pedido-cabecera">
              <div>
                <strong>{pedido.nroPedido}</strong>
                <p>
                  {pedido.nombreCliente} · {pedido.fecha}
                </p>
              </div>
              <span className="estado stock">
                {pedido.estado.replaceAll("_", " ")}
              </span>
            </div>

            <div className="pedido-informacion">
              <span>
                Entrega:{" "}
                {pedido.modalidadEntrega === "ENVIO_NACIONAL"
                  ? "Envío nacional"
                  : "Entrega local"}
              </span>
              <span>Pago: {pedido.estadoPago}</span>
            </div>

            <div className="tabla-contenedor">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.detalles.map((detalle) => (
                    <tr key={detalle.codigoProducto}>
                      <td>{detalle.nombreProducto}</td>
                      <td>{detalle.cantidad}</td>
                      <td>S/ {Number(detalle.precioUnitario).toFixed(2)}</td>
                      <td>S/ {Number(detalle.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pedido-pie">
              <strong>Total: S/ {Number(pedido.total).toFixed(2)}</strong>

              <div className="pedido-botones">
                {opcionesEstado(pedido).map((opcion) => (
                  <button
                    type="button"
                    key={opcion.estado}
                    className="boton secundario"
                    disabled={cargando}
                    onClick={() =>
                      cambiarEstado(pedido.nroPedido, opcion.estado)
                    }
                  >
                    {opcion.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
