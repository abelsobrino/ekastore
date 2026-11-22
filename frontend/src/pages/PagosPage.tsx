import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Pedido } from "../types/Pedido";
import type { Pago, MetodoPago } from "../types/Pago";

import { listarPedidos } from "../services/pedidosApi";
import { listarPagos, registrarPago } from "../services/pagosApi";

export default function PagosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);

  const [nroPedido, setNroPedido] = useState("");
  const [monto, setMonto] = useState("");
  const [metodo, setMetodo] = useState<MetodoPago>("YAPE");

  const [cargando, setCargando] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargar() {
      try {
        const [listaPedidos, listaPagos] = await Promise.all([
          listarPedidos(),
          listarPagos(),
        ]);

        if (!activo) return;

        setPedidos(listaPedidos);
        setPagos(listaPagos);
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error ? err.message : "Error al cargar los pagos.",
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

  function totalPagado(numero: string) {
    return pagos
      .filter((p) => p.nroPedido === numero)
      .reduce((suma, p) => suma + Number(p.monto), 0);
  }

  function saldoPedido(pedido: Pedido) {
    return Math.max(
      0,
      Math.round((Number(pedido.total) - totalPagado(pedido.nroPedido)) * 100) /
        100,
    );
  }

  const pedidosPendientes = pedidos.filter((pedido) => saldoPedido(pedido) > 0);

  const pedidoSeleccionado = pedidos.find(
    (pedido) => pedido.nroPedido === nroPedido,
  );

  const saldoSeleccionado = pedidoSeleccionado
    ? saldoPedido(pedidoSeleccionado)
    : 0;

  const montoCobrado = pagos.reduce(
    (suma, pago) => suma + Number(pago.monto),
    0,
  );

  const saldoPendiente = pedidos.reduce(
    (suma, pedido) => suma + saldoPedido(pedido),
    0,
  );

  const pagosFiltrados = pagos.filter((pago) => {
    const pedido = pedidos.find((p) => p.nroPedido === pago.nroPedido);

    return `${pago.nroPago} ${pago.nroPedido} ${pago.metodo} ${pedido?.nombreCliente ?? ""}`
      .toLowerCase()
      .includes(busqueda.toLowerCase());
  });

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMensaje("");

    const importe = Number(monto);

    if (!pedidoSeleccionado) {
      setError("Selecciona un pedido.");
      return;
    }

    if (
      !Number.isFinite(importe) ||
      importe <= 0 ||
      !/^\d+(\.\d{1,2})?$/.test(monto)
    ) {
      setError("Ingresa un importe válido con hasta dos decimales.");
      return;
    }

    if (importe > saldoSeleccionado) {
      setError("El importe supera el saldo pendiente.");
      return;
    }

    setCargando(true);

    try {
      await registrarPago({
        nroPedido,
        monto: importe,
        metodo,
      });

      const [listaPedidos, listaPagos] = await Promise.all([
        listarPedidos(),
        listarPagos(),
      ]);

      setPedidos(listaPedidos);
      setPagos(listaPagos);

      setMensaje("Pago registrado correctamente.");
      setNroPedido("");
      setMonto("");
      setMetodo("YAPE");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo registrar el pago.",
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <>
      <header className="encabezado">
        <div>
          <span className="etiqueta">SISTEMA DE GESTIÓN</span>
          <h1>Gestión de pagos</h1>
          <p>Controla los abonos y saldos de los pedidos.</p>
        </div>
        <span className="usuario">Administradora</span>
      </header>

      <section className="estadisticas">
        <div className="estadistica">
          <span>Pagos registrados</span>
          <strong>{pagos.length}</strong>
        </div>

        <div className="estadistica">
          <span>Total cobrado</span>
          <strong>S/ {montoCobrado.toFixed(2)}</strong>
        </div>

        <div className="estadistica">
          <span>Saldo pendiente</span>
          <strong>S/ {saldoPendiente.toFixed(2)}</strong>
        </div>
      </section>

      <section className="panel">
        <h2>Registrar pago</h2>
        <p>Selecciona un pedido y registra el importe recibido.</p>

        {error && <div className="alerta error">{error}</div>}
        {mensaje && <div className="alerta exito">{mensaje}</div>}

        <form className="formulario" onSubmit={guardar}>
          <div className="campo">
            <label htmlFor="pago-pedido">Pedido</label>
            <select
              id="pago-pedido"
              value={nroPedido}
              onChange={(e) => setNroPedido(e.target.value)}
              required
            >
              <option value="">Seleccionar pedido</option>
              {pedidosPendientes.map((pedido) => (
                <option key={pedido.nroPedido} value={pedido.nroPedido}>
                  {pedido.nroPedido} - {pedido.nombreCliente}
                </option>
              ))}
            </select>
          </div>

          <div className="campo">
            <label htmlFor="pago-metodo">Método de pago</label>
            <select
              id="pago-metodo"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as MetodoPago)}
            >
              <option value="YAPE">Yape</option>
              <option value="PLIN">Plin</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          {pedidoSeleccionado && (
            <div className="pedido-total ancho-completo">
              <div>
                <strong>{pedidoSeleccionado.nombreCliente}</strong>
                <p>Total: S/ {Number(pedidoSeleccionado.total).toFixed(2)}</p>
                <p>Abonado: S/ {totalPagado(nroPedido).toFixed(2)}</p>
              </div>
              <div>
                <span>Saldo pendiente</span>
                <strong>S/ {saldoSeleccionado.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <div className="campo">
            <label htmlFor="pago-monto">Monto recibido (S/)</label>
            <input
              id="pago-monto"
              type="number"
              min="0.01"
              step="0.01"
              max={saldoSeleccionado || undefined}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ejemplo: 100.00"
              required
            />
          </div>

          <div className="acciones ancho-completo">
            <button
              className="boton principal"
              disabled={
                cargando || cargandoDatos || pedidosPendientes.length === 0
              }
            >
              {cargando ? "Registrando..." : "Registrar pago"}
            </button>
          </div>
        </form>

        {!cargandoDatos && pedidosPendientes.length === 0 && (
          <p>No hay pedidos con saldos pendientes.</p>
        )}
      </section>

      <section className="panel">
        <div className="lista-cabecera">
          <div>
            <h2>Historial de pagos</h2>
            <p>Pagos registrados en Supabase.</p>
          </div>

          <input
            className="buscador"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar pago..."
          />
        </div>

        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>N.º pago</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Método</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {pagosFiltrados.map((pago) => {
                const pedido = pedidos.find(
                  (p) => p.nroPedido === pago.nroPedido,
                );

                return (
                  <tr key={pago.nroPago}>
                    <td>{pago.nroPago}</td>
                    <td>{pago.nroPedido}</td>
                    <td>{pedido?.nombreCliente || "—"}</td>
                    <td>{pago.fecha}</td>
                    <td>{pago.metodo}</td>
                    <td>S/ {Number(pago.monto).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pagosFiltrados.length === 0 && (
            <p className="sin-datos">No se encontraron pagos.</p>
          )}
        </div>
      </section>
    </>
  );
}
