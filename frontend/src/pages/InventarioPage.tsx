import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type {
  Inventario,
  MovimientoInventario,
  MovimientoRequest,
} from "../types/Inventario";

import {
  listarInventario,
  registrarMovimiento,
  consultarMovimientos,
} from "../services/inventarioApi";

export default function InventarioPage() {
  // Datos del inventario
  const [inventario, setInventario] = useState<Inventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);

  // Formulario de movimientos
  const [codigo, setCodigo] = useState("");
  const [tipo, setTipo] = useState<"ENTRADA" | "SALIDA">("ENTRADA");
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  // Estados de la interfaz
  const [cargando, setCargando] = useState(false);
  const [cargandoInventario, setCargandoInventario] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [productoHistorial, setProductoHistorial] = useState("");

  // Cargar inventario al ingresar a la página
  useEffect(() => {
    let activo = true;

    async function cargarInventario() {
      try {
        const datos = await listarInventario();

        if (!activo) return;

        setInventario(datos);

        if (datos.length > 0) {
          setCodigo(datos[0].codigoProducto);
        }
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar el inventario.",
          );
        }
      } finally {
        if (activo) {
          setCargandoInventario(false);
        }
      }
    }

    void cargarInventario();

    return () => {
      activo = false;
    };
  }, []);

  // Registrar entrada o salida de productos
  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMensaje("");

    const numero = Number(cantidad);

    if (!codigo) {
      setError("Selecciona un producto.");
      return;
    }

    if (!Number.isInteger(numero) || numero <= 0) {
      setError("Ingresa una cantidad válida mayor que cero.");
      return;
    }

    setCargando(true);

    const datos: MovimientoRequest = {
      tipo,
      cantidad: numero,
      motivo,
      fechaVencimiento: vencimiento || null,
    };

    try {
      // Guardar movimiento en Spring Boot
      await registrarMovimiento(codigo, datos);

      setMensaje("Movimiento registrado correctamente.");

      // Actualizar las existencias
      const inventarioActualizado = await listarInventario();
      setInventario(inventarioActualizado);

      // Actualizar el historial del producto
      const historial = await consultarMovimientos(codigo);
      setMovimientos(historial);
      setProductoHistorial(codigo);

      // Limpiar los campos
      setCantidad("");
      setMotivo("");
      setVencimiento("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al registrar el movimiento.",
      );
    } finally {
      setCargando(false);
    }
  }

  // Consultar historial de movimientos
  async function verHistorial(codigoProducto: string) {
    setCodigo(codigoProducto);
    setError("");
    setMensaje("");

    try {
      const datos = await consultarMovimientos(codigoProducto);

      setMovimientos(datos);
      setProductoHistorial(codigoProducto);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al consultar el historial.",
      );
    }
  }

  // Actualizar manualmente las existencias
  async function actualizarInventario() {
    setCargandoInventario(true);
    setError("");

    try {
      const datos = await listarInventario();
      setInventario(datos);

      setCodigo((actual) =>
        datos.some((p) => p.codigoProducto === actual)
          ? actual
          : (datos[0]?.codigoProducto ?? ""),
      );

      setMensaje("Inventario actualizado correctamente.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo actualizar el inventario.",
      );
    } finally {
      setCargandoInventario(false);
    }
  }

  // Cálculo de estadísticas
  const totalUnidades = inventario.reduce(
    (suma, producto) => suma + producto.cantidad,
    0,
  );

  const stockBajo = inventario.filter(
    (producto) => producto.cantidad <= producto.stockMinimo,
  ).length;

  return (
    <>
      {/* Encabezado */}
      <header className="encabezado">
        <div>
          <span className="etiqueta">SISTEMA DE GESTIÓN</span>

          <h1>Gestión de inventario</h1>

          <p>Control de existencias y movimientos de Eka Store.</p>
        </div>

        <span className="usuario">Administradora</span>
      </header>

      {/* Estadísticas */}
      <section className="estadisticas">
        <div className="estadistica">
          <span>Productos registrados</span>
          <strong>{inventario.length}</strong>
        </div>

        <div className="estadistica">
          <span>Unidades disponibles</span>
          <strong>{totalUnidades}</strong>
        </div>

        <div className="estadistica">
          <span>Productos con stock bajo</span>
          <strong>{stockBajo}</strong>
        </div>
      </section>

      {/* Formulario de movimientos */}
      <section className="panel">
        <div className="panel-titulo">
          <h2>Registrar movimiento</h2>

          <p>Registra entradas o salidas del inventario.</p>
        </div>

        {mensaje && <div className="alerta exito">{mensaje}</div>}

        {error && <div className="alerta error">{error}</div>}

        <form className="formulario" onSubmit={guardar}>
          {/* Producto */}
          <div className="campo">
            <label htmlFor="inventario-producto">Producto</label>

            <select
              id="inventario-producto"
              value={codigo}
              onChange={(e) => {
                setCodigo(e.target.value);
                setMovimientos([]);
                setProductoHistorial("");
              }}
              required
            >
              {inventario.length === 0 && (
                <option value="">Sin productos registrados</option>
              )}

              {inventario.map((producto) => (
                <option
                  key={producto.codigoProducto}
                  value={producto.codigoProducto}
                >
                  {producto.codigoProducto} - {producto.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de movimiento */}
          <div className="campo">
            <label htmlFor="tipo-movimiento">Tipo de movimiento</label>

            <select
              id="tipo-movimiento"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "ENTRADA" | "SALIDA")}
            >
              <option value="ENTRADA">Entrada de productos</option>

              <option value="SALIDA">Salida de productos</option>
            </select>
          </div>

          {/* Cantidad */}
          <div className="campo">
            <label htmlFor="cantidad-movimiento">Cantidad</label>

            <input
              id="cantidad-movimiento"
              type="number"
              min="1"
              step="1"
              required
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              placeholder="Ejemplo: 10"
            />
          </div>

          {/* Fecha de vencimiento */}
          <div className="campo">
            <label htmlFor="fecha-vencimiento">
              Fecha de vencimiento (opcional)
            </label>

            <input
              id="fecha-vencimiento"
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
            />
          </div>

          {/* Motivo */}
          <div className="campo ancho-completo">
            <label htmlFor="motivo-movimiento">Motivo</label>

            <input
              id="motivo-movimiento"
              value={motivo}
              maxLength={100}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ejemplo: Reabastecimiento de productos"
            />
          </div>

          {/* Botón para guardar */}
          <div className="acciones ancho-completo">
            <button
              className="boton principal"
              disabled={
                cargando || cargandoInventario || inventario.length === 0
              }
            >
              {cargando ? "Guardando..." : "Registrar movimiento"}
            </button>
          </div>
        </form>
      </section>

      {/* Existencias */}
      <section className="panel">
        <div className="lista-cabecera">
          <div>
            <h2>Existencias actuales</h2>

            <p>Stock de los productos registrados.</p>
          </div>

          <button
            type="button"
            className="boton secundario"
            onClick={actualizarInventario}
            disabled={cargandoInventario || cargando}
          >
            {cargandoInventario ? "Actualizando..." : "Actualizar stock"}
          </button>
        </div>

        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Marca</th>
                <th>Stock</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {inventario.map((producto) => (
                <tr key={producto.codigoProducto}>
                  <td>{producto.codigoProducto}</td>

                  <td>
                    <strong>{producto.nombre}</strong>
                  </td>

                  <td>{producto.marca}</td>

                  <td>
                    <strong>{producto.cantidad}</strong>
                  </td>

                  <td>{producto.stockMinimo}</td>

                  <td>
                    <span
                      className={
                        producto.cantidad <= producto.stockMinimo
                          ? "estado pedido"
                          : "estado stock"
                      }
                    >
                      {producto.cantidad <= producto.stockMinimo
                        ? "Stock bajo"
                        : "Disponible"}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="editar"
                      onClick={() => verHistorial(producto.codigoProducto)}
                    >
                      Ver historial
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!cargandoInventario && inventario.length === 0 && (
            <p className="sin-datos">No hay productos registrados.</p>
          )}
        </div>
      </section>

      {/* Historial */}
      <section className="panel">
        <h2>Historial de movimientos</h2>

        <p>
          {productoHistorial
            ? `Movimientos del producto ${productoHistorial}.`
            : "Selecciona «Ver historial» para consultar un producto."}
        </p>

        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>N.º movimiento</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Motivo</th>
                <th>Vencimiento</th>
              </tr>
            </thead>

            <tbody>
              {movimientos.map((movimiento) => (
                <tr key={movimiento.nroMovimiento}>
                  <td>{movimiento.nroMovimiento}</td>

                  <td>{movimiento.fecha}</td>

                  <td>
                    <span
                      className={
                        movimiento.tipo === "ENTRADA"
                          ? "estado stock"
                          : "estado pedido"
                      }
                    >
                      {movimiento.tipo}
                    </span>
                  </td>

                  <td>{movimiento.cantidad}</td>

                  <td>{movimiento.motivo || "Sin motivo"}</td>

                  <td>{movimiento.fechaVencimiento || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {movimientos.length === 0 && (
            <p className="sin-datos">No hay movimientos para mostrar.</p>
          )}
        </div>
      </section>
    </>
  );
}
