const AUTH_PATHS = new Set(['/login', '/registro', '/verificar', '/logout']);

function isSafeLocalPath(path) {
  return path && path.startsWith('/') && !path.startsWith('//');
}

export function rememberClientReturn(req) {
  if (!req.session || req.method !== 'GET') return;
  const path = req.originalUrl || req.url;
  const basePath = path.split('?')[0];
  if (!isSafeLocalPath(path) || AUTH_PATHS.has(basePath)) return;
  req.session.clientReturnTo = path;
}

export function getClientReturn(req) {
  return req.session?.clientReturnTo || null;
}

export function consumeClientReturn(req, fallback = '/perfil') {
  const destination = getClientReturn(req) || fallback;
  if (req.session) delete req.session.clientReturnTo;
  return destination;
}

export function setClientSession(req, cliente, returnTo = null) {
  req.session.clienteId = cliente.id;
  req.session.clienteCorreo = cliente.correo;
  req.session.clienteNombre = cliente.nombre;
  req.session.clienteVerificado = cliente.cuentaVerificada;
  if (returnTo) req.session.clientReturnTo = returnTo;
}
