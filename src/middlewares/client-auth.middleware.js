import {
  consumeClientReturn,
  rememberClientReturn
} from '../services/client-session.service.js';

function clienteFromSession(req) {
  return {
    id: req.session.clienteId,
    correo: req.session.clienteCorreo,
    nombre: req.session.clienteNombre,
    cuentaVerificada: req.session.clienteVerificado
  };
}

export const requireClientAuth = (req, res, next) => {
  if (!req.session?.clienteId) {
    rememberClientReturn(req);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Debes iniciar sesion para acceder a esta seccion.'
      });
    }
    return res.redirect('/login');
  }

  res.locals.cliente = clienteFromSession(req);
  res.locals.tipoUsuarioActual = 'cliente';
  next();
};

export const requireClientVerified = (req, res, next) => {
  if (!req.session?.clienteId) {
    rememberClientReturn(req);
    return res.redirect('/login');
  }

  if (!req.session.clienteVerificado) {
    rememberClientReturn(req);
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(403).json({
        error: 'Cuenta no verificada',
        message: 'Debes verificar tu correo con el codigo enviado.'
      });
    }
    return res.redirect('/verificar');
  }

  next();
};

export const injectUserState = (req, res, next) => {
  res.locals.tipoUsuarioActual = null;
  res.locals.admin = null;
  res.locals.cliente = null;
  res.locals.carrito = req.session?.carrito || [];

  if (req.session?.adminId) {
    res.locals.tipoUsuarioActual = 'admin';
    res.locals.admin = { id: req.session.adminId, correo: req.session.adminCorreo };
  } else if (req.session?.clienteId) {
    res.locals.tipoUsuarioActual = 'cliente';
    res.locals.cliente = clienteFromSession(req);
  }

  next();
};

export const redirectIfClientAuthenticated = (req, res, next) => {
  if (!req.session?.clienteId) return next();
  if (!req.session.clienteVerificado) return res.redirect('/verificar');
  return res.redirect(consumeClientReturn(req));
};
