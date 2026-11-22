async function obtenerCsrf(): Promise<string> {
  const respuesta = await fetch('/api/auth/csrf', {
    credentials: 'same-origin',
    cache: 'no-store'
  })

  if (!respuesta.ok) {
    throw new Error('No se pudo obtener el token de seguridad.')
  }

  const datos: { token: string } = await respuesta.json()
  return datos.token
}

export async function login(
  usuario: string,
  clave: string
): Promise<void> {

  const token = await obtenerCsrf()

  const respuesta = await fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-CSRF-TOKEN': token
    },
    body: new URLSearchParams({
      username: usuario,
      password: clave
    })
  })

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('Usuario o contraseña incorrectos.')
    }
    throw new Error('No se pudo iniciar sesión.')
  }
}

export async function verificarSesion(): Promise<boolean> {
  const respuesta = await fetch('/api/auth/me', {
    credentials: 'same-origin'
  })

  if (respuesta.status === 401) return false

  if (!respuesta.ok) {
    throw new Error('No se pudo comprobar la sesión.')
  }

  return true
}

export async function logout(): Promise<void> {
  const token = await obtenerCsrf()

  const respuesta = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'X-CSRF-TOKEN': token
    }
  })

  if (!respuesta.ok) {
    throw new Error('No se pudo cerrar sesión.')
  }
}

export async function peticionApi<T>(
  ruta: string,
  metodo: 'GET' | 'POST' | 'PUT' = 'GET',
  datos?: unknown
): Promise<T> {

  const headers: Record<string, string> = {}

  if (metodo !== 'GET') {
    headers['X-CSRF-TOKEN'] = await obtenerCsrf()
  }

  if (datos !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  const respuesta = await fetch(ruta, {
    method: metodo,
    credentials: 'same-origin',
    headers,
    body: datos !== undefined
      ? JSON.stringify(datos)
      : undefined
  })

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('La sesión no está activa.')
    }

    if (respuesta.status === 403) {
      throw new Error('Acceso denegado.')
    }

    if (respuesta.status === 409) {
      throw new Error('El registro ya existe.')
    }

    if (respuesta.status === 400) {
      throw new Error('Datos inválidos o stock insuficiente.')
    }

    throw new Error(`Error del servidor: ${respuesta.status}`)
  }

  return respuesta.json() as Promise<T>
}