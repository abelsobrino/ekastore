import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Cliente } from "../types/Cliente";

import {
  listarClientes,
  registrarCliente,
  actualizarCliente,
} from "../services/clientesApi";

const clienteVacio: Cliente = {
  dni: "",
  nombre: "",
  telefono: "",
  direccion: "",
  email: "",
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formulario, setFormulario] = useState<Cliente>({ ...clienteVacio });

  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    let activo = true;

    listarClientes()
      .then((datos) => {
        if (activo) setClientes(datos);
      })
      .catch((err) => {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar los clientes.",
          );
        }
      });

    return () => {
      activo = false;
    };
  }, []);

  function cambiar(campo: keyof Cliente, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setCargando(true);

    try {
      if (editando) {
        await actualizarCliente(formulario);
        setMensaje("Cliente actualizado correctamente.");
      } else {
        await registrarCliente(formulario);
        setMensaje("Cliente registrado correctamente.");
      }

      const lista = await listarClientes();
      setClientes(lista);

      setFormulario({ ...clienteVacio });
      setEditando(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo guardar el cliente.",
      );
    } finally {
      setCargando(false);
    }
  }

  function editar(cliente: Cliente) {
    setFormulario({ ...cliente });
    setEditando(true);
    setMensaje("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelar() {
    setFormulario({ ...clienteVacio });
    setEditando(false);
    setError("");
  }

  const filtrados = clientes.filter((cliente) =>
    `${cliente.dni} ${cliente.nombre} ${cliente.telefono}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  return (
    <>
      <header className="encabezado">
        <div>
          <span className="etiqueta">SISTEMA DE GESTIÓN</span>

          <h1>Gestión de clientes</h1>
          <p>Administra los clientes de Eka Store.</p>
        </div>

        <span className="usuario">Administradora</span>
      </header>

      <section className="estadisticas">
        <div className="estadistica">
          <span>Clientes registrados</span>
          <strong>{clientes.length}</strong>
        </div>

        <div className="estadistica">
          <span>Resultados de búsqueda</span>
          <strong>{filtrados.length}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-titulo">
          <h2>{editando ? "Modificar cliente" : "Registrar cliente"}</h2>

          <p>Completa los datos del cliente.</p>
        </div>

        {mensaje && <div className="alerta exito">{mensaje}</div>}

        {error && <div className="alerta error">{error}</div>}

        <form className="formulario" onSubmit={guardar}>
          <div className="campo">
            <label>DNI</label>
            <input
              value={formulario.dni}
              onChange={(e) => cambiar("dni", e.target.value)}
              maxLength={8}
              pattern="[0-9]{8}"
              disabled={editando}
              required
              placeholder="12345678"
            />
          </div>

          <div className="campo">
            <label>Nombre completo</label>
            <input
              value={formulario.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              maxLength={100}
              required
              placeholder="Nombre y apellidos"
            />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input
              type="tel"
              value={formulario.telefono}
              onChange={(e) => cambiar("telefono", e.target.value)}
              maxLength={15}
              placeholder="999999999"
            />
          </div>

          <div className="campo">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={formulario.email}
              onChange={(e) => cambiar("email", e.target.value)}
              maxLength={100}
              placeholder="cliente@ejemplo.com"
            />
          </div>

          <div className="campo ancho-completo">
            <label>Dirección</label>
            <input
              value={formulario.direccion}
              onChange={(e) => cambiar("direccion", e.target.value)}
              maxLength={200}
              placeholder="Dirección del cliente"
            />
          </div>

          <div className="acciones ancho-completo">
            <button className="boton principal" disabled={cargando}>
              {cargando
                ? "Guardando..."
                : editando
                  ? "Guardar cambios"
                  : "Registrar cliente"}
            </button>

            {editando && (
              <button
                type="button"
                className="boton secundario"
                onClick={cancelar}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="lista-cabecera">
          <div>
            <h2>Clientes registrados</h2>
            <p>Información almacenada en Supabase.</p>
          </div>

          <input
            className="buscador"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar cliente..."
          />
        </div>

        <div className="tabla-contenedor">
          <table>
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Dirección</th>
                <th>Acción</th>
              </tr>
            </thead>

            <tbody>
              {filtrados.map((cliente) => (
                <tr key={cliente.dni}>
                  <td>{cliente.dni}</td>
                  <td>
                    <strong>{cliente.nombre}</strong>
                  </td>
                  <td>{cliente.telefono || "—"}</td>
                  <td>{cliente.email || "—"}</td>
                  <td>{cliente.direccion || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className="editar"
                      onClick={() => editar(cliente)}
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtrados.length === 0 && (
            <p className="sin-datos">No se encontraron clientes.</p>
          )}
        </div>
      </section>
    </>
  );
}
