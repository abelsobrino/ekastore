import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import type { Credenciales, Producto } from "./types/Producto";

import {
  listarProductos,
  registrarProducto,
  actualizarProducto,
} from "./services/productosApi";

import { login, logout, verificarSesion } from "./services/authApi";
import InventarioPage from "./pages/InventarioPage";
import ClientesPage from "./pages/ClientesPage";
import PedidosPage from "./pages/PedidosPage";
import PagosPage from "./pages/PagosPage";
import "./App.css";

type Formulario = Omit<Producto, "precio"> & {
  precio: string;
};

const formularioVacio: Formulario = {
  codigo: "",
  nombre: "",
  descripcion: "",
  marca: "Natura",
  categoria: "",
  precio: "",
  modalidadDisponibilidad: "EN_STOCK",
};

function App() {
  // Autenticación
  const [credenciales, setCredenciales] = useState<Credenciales>({
    usuario: "admin",
    clave: "",
  });

  const [sesion, setSesion] = useState(false);
  const [comprobando, setComprobando] = useState(true);

  // Productos
  const [productos, setProductos] = useState<Producto[]>([]);
  const [formulario, setFormulario] = useState<Formulario>({
    ...formularioVacio,
  });

  const [editando, setEditando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // Mensajes
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  // Navegación
  const [pantalla, setPantalla] = useState<
    "productos" | "inventario" | "clientes" | "pedidos" | "pagos"
  >("productos");

  // Comprobar si existe una sesión activa
  useEffect(() => {
    let activo = true;

    async function comprobar() {
      try {
        const autenticado = await verificarSesion();

        if (autenticado) {
          const lista = await listarProductos();

          if (activo) {
            setProductos(lista);
            setSesion(true);
          }
        }
      } catch (err) {
        console.error("Error al comprobar la sesión:", err);
      } finally {
        if (activo) {
          setComprobando(false);
        }
      }
    }

    void comprobar();

    return () => {
      activo = false;
    };
  }, []);

  // Iniciar sesión
  async function iniciarSesion(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setCargando(true);
    setError("");

    try {
      await login(credenciales.usuario, credenciales.clave);

      const lista = await listarProductos();

      setProductos(lista);
      setSesion(true);

      // No conservar la contraseña en el formulario
      setCredenciales({
        usuario: credenciales.usuario,
        clave: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión.");
    } finally {
      setCargando(false);
    }
  }

  // Modificar campos del formulario
  function cambiar(campo: keyof Formulario, valor: string) {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));
  }

  // Registrar o actualizar productos
  async function guardarProducto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!sesion) return;

    setCargando(true);
    setError("");
    setMensaje("");

    const producto: Producto = {
      ...formulario,
      precio: Number(formulario.precio),
    };

    try {
      if (editando) {
        await actualizarProducto(producto);

        setMensaje("Producto actualizado correctamente.");
      } else {
        await registrarProducto(producto);

        setMensaje("Producto registrado correctamente.");
      }

      // Actualizar la lista desde Supabase
      const lista = await listarProductos();

      setProductos(lista);
      setFormulario({ ...formularioVacio });
      setEditando(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al guardar el producto.",
      );
    } finally {
      setCargando(false);
    }
  }

  // Seleccionar producto para modificar
  function editarProducto(producto: Producto) {
    setFormulario({
      ...producto,
      precio: String(producto.precio),
    });

    setEditando(true);
    setMensaje("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // Cancelar edición
  function cancelar() {
    setFormulario({ ...formularioVacio });
    setEditando(false);
    setError("");
  }

  // Cerrar sesión desde Spring Security
  async function cerrarSesion() {
    setCargando(true);
    setError("");

    try {
      await logout();

      setSesion(false);
      setProductos([]);
      setCredenciales({
        usuario: "admin",
        clave: "",
      });

      setFormulario({ ...formularioVacio });
      setEditando(false);
      setPantalla("productos");
      setBusqueda("");
      setMensaje("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar sesión.");
    } finally {
      setCargando(false);
    }
  }

  // Buscar productos
  const filtrados = productos.filter((producto) =>
    `${producto.codigo} ${producto.nombre} ${producto.marca}`
      .toLowerCase()
      .includes(busqueda.toLowerCase()),
  );

  // Pantalla de carga inicial
  if (comprobando) {
    return (
      <main className="acceso">
        <p>Comprobando sesión...</p>
      </main>
    );
  }

  // Pantalla de inicio de sesión
  if (!sesion) {
    return (
      <main className="acceso">
        <form className="login-card" onSubmit={iniciarSesion}>
          <div className="marca-icono">E</div>

          <h1>Eka Store</h1>
          <p>Acceso al sistema de gestión</p>

          <label htmlFor="usuario">Usuario</label>

          <input
            id="usuario"
            value={credenciales.usuario}
            onChange={(e) =>
              setCredenciales({
                ...credenciales,
                usuario: e.target.value,
              })
            }
            autoComplete="username"
            required
          />

          <label htmlFor="clave">Contraseña</label>

          <input
            id="clave"
            type="password"
            value={credenciales.clave}
            onChange={(e) =>
              setCredenciales({
                ...credenciales,
                clave: e.target.value,
              })
            }
            autoComplete="current-password"
            required
          />

          {error && <div className="alerta error">{error}</div>}

          <button className="boton principal" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar sesión"}
          </button>

          <small>Panel administrativo · Desarrollo local</small>
        </form>
      </main>
    );
  }

  // Panel administrativo
  return (
    <div className="aplicacion">
      {/* Menú lateral */}
      <aside className="sidebar">
        <h2>Eka Store</h2>
        <p>Panel administrativo</p>

        <div className="menu-titulo">MENÚ PRINCIPAL</div>

        <button
          type="button"
          className={pantalla === "productos" ? "menu-activo" : "menu-futuro"}
          onClick={() => setPantalla("productos")}
        >
          Gestión de productos
        </button>

        <button
          type="button"
          className={pantalla === "inventario" ? "menu-activo" : "menu-futuro"}
          onClick={() => setPantalla("inventario")}
        >
          Gestión de inventario
        </button>

        <button
          type="button"
          className={pantalla === "clientes" ? "menu-activo" : "menu-futuro"}
          onClick={() => setPantalla("clientes")}
        >
          Gestión de clientes
        </button>

        <button
          type="button"
          className={pantalla === "pedidos" ? "menu-activo" : "menu-futuro"}
          onClick={() => setPantalla("pedidos")}
        >
          Gestión de pedidos
        </button>

        <button
          type="button"
          className={pantalla === "pagos" ? "menu-activo" : "menu-futuro"}
          onClick={() => setPantalla("pagos")}
        >
          Gestión de pagos
        </button>

        <button className="salir" onClick={cerrarSesion} disabled={cargando}>
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido principal */}
      <main className="contenido">
        {pantalla === "inventario" ? (
          <InventarioPage />
        ) : pantalla === "clientes" ? (
          <ClientesPage />
        ) : pantalla === "pedidos" ? (
          <PedidosPage />
        ) : pantalla === "pagos" ? (
          <PagosPage />
        ) : (
          <>
            {/* Encabezado */}
            <header className="encabezado">
              <div>
                <span className="etiqueta">SISTEMA DE GESTIÓN</span>

                <h1>Gestión de productos</h1>

                <p>Administra los productos de Natura y Yanbal.</p>
              </div>

              <span className="usuario">Administradora</span>
            </header>

            {/* Estadísticas */}
            <section className="estadisticas">
              <div className="estadistica">
                <span>Total de productos</span>
                <strong>{productos.length}</strong>
              </div>

              <div className="estadistica">
                <span>Productos Natura</span>
                <strong>
                  {productos.filter((p) => p.marca === "Natura").length}
                </strong>
              </div>

              <div className="estadistica">
                <span>Productos Yanbal</span>
                <strong>
                  {productos.filter((p) => p.marca === "Yanbal").length}
                </strong>
              </div>
            </section>

            {/* Formulario de productos */}
            <section className="panel">
              <div className="panel-titulo">
                <h2>
                  {editando ? "Modificar producto" : "Registrar producto"}
                </h2>

                <p>Completa los datos del producto.</p>
              </div>

              {mensaje && <div className="alerta exito">{mensaje}</div>}

              {error && <div className="alerta error">{error}</div>}

              <form onSubmit={guardarProducto} className="formulario">
                {/* Código */}
                <div className="campo">
                  <label>Código</label>

                  <input
                    value={formulario.codigo}
                    onChange={(e) => cambiar("codigo", e.target.value)}
                    disabled={editando}
                    maxLength={10}
                    required
                    placeholder="P003"
                  />
                </div>

                {/* Nombre */}
                <div className="campo">
                  <label>Nombre</label>

                  <input
                    value={formulario.nombre}
                    onChange={(e) => cambiar("nombre", e.target.value)}
                    maxLength={100}
                    required
                    placeholder="Nombre del producto"
                  />
                </div>

                {/* Marca */}
                <div className="campo">
                  <label>Marca</label>

                  <select
                    value={formulario.marca}
                    onChange={(e) => cambiar("marca", e.target.value)}
                  >
                    <option value="Natura">Natura</option>

                    <option value="Yanbal">Yanbal</option>
                  </select>
                </div>

                {/* Categoría */}
                <div className="campo">
                  <label>Categoría</label>

                  <input
                    value={formulario.categoria}
                    onChange={(e) => cambiar("categoria", e.target.value)}
                    maxLength={50}
                    placeholder="Cuidado facial"
                  />
                </div>

                {/* Precio */}
                <div className="campo">
                  <label>Precio (S/)</label>

                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formulario.precio}
                    onChange={(e) => cambiar("precio", e.target.value)}
                    required
                    placeholder="45.90"
                  />
                </div>

                {/* Disponibilidad */}
                <div className="campo">
                  <label>Disponibilidad</label>

                  <select
                    value={formulario.modalidadDisponibilidad}
                    onChange={(e) =>
                      cambiar("modalidadDisponibilidad", e.target.value)
                    }
                  >
                    <option value="EN_STOCK">En stock</option>

                    <option value="BAJO_PEDIDO">Bajo pedido</option>
                  </select>
                </div>

                {/* Descripción */}
                <div className="campo ancho-completo">
                  <label>Descripción</label>

                  <textarea
                    value={formulario.descripcion}
                    onChange={(e) => cambiar("descripcion", e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Descripción del producto"
                  />
                </div>

                {/* Acciones */}
                <div className="acciones ancho-completo">
                  <button className="boton principal" disabled={cargando}>
                    {cargando
                      ? "Guardando..."
                      : editando
                        ? "Guardar cambios"
                        : "Registrar producto"}
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

            {/* Lista de productos */}
            <section className="panel">
              <div className="lista-cabecera">
                <div>
                  <h2>Productos registrados</h2>

                  <p>Información almacenada en Supabase.</p>
                </div>

                <input
                  className="buscador"
                  placeholder="Buscar producto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>

              <div className="tabla-contenedor">
                <table>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Marca</th>
                      <th>Precio</th>
                      <th>Disponibilidad</th>
                      <th>Acción</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filtrados.map((producto) => (
                      <tr key={producto.codigo}>
                        <td>{producto.codigo}</td>

                        <td>
                          <strong>{producto.nombre}</strong>

                          <small>{producto.categoria || "Sin categoría"}</small>
                        </td>

                        <td>{producto.marca}</td>

                        <td>S/ {Number(producto.precio).toFixed(2)}</td>

                        <td>
                          <span
                            className={
                              producto.modalidadDisponibilidad === "EN_STOCK"
                                ? "estado stock"
                                : "estado pedido"
                            }
                          >
                            {producto.modalidadDisponibilidad === "EN_STOCK"
                              ? "En stock"
                              : "Bajo pedido"}
                          </span>
                        </td>

                        <td>
                          <button
                            className="editar"
                            onClick={() => editarProducto(producto)}
                          >
                            Editar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filtrados.length === 0 && (
                  <p className="sin-datos">No se encontraron productos.</p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
