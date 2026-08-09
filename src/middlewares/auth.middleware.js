// src/middlewares/auth.middleware.js
import { validateAdminActivity } from '../services/admin-inactivity.service.js';
/**
 * ============================================================================
 * MIDDLEWARES DE AUTENTICACIÓN Y AUTORIZACIÓN
 * ============================================================================
 *
 * Este archivo contiene los middlewares encargados de verificar la identidad
 * del usuario mediante la sesión y proteger las rutas administrativas.
 * Cumple con la separación de responsabilidades: los controladores no deben
 * encargarse de validar la sesión manualmente.
 */
/**
 * Middleware para proteger rutas exclusivas del Administrador.
 * Verifica que exista una sesión activa y que el rol o identificador
 * de la sesión corresponda al administrador del sistema.
 * 
 * @param {import('express').Request} req - Objeto de petición Express
 * @param {import('express').Response} res - Objeto de respuesta Express
 * @param {import('express').NextFunction} next - Función para continuar al siguiente middleware
 */
export const requireAdminAuth = (req, res, next) => {
  // Verificamos si existe el objeto de sesión y si contiene el adminId
  if (!req.session || !req.session.adminId) {
    console.warn(`[Seguridad] Intento de acceso no autorizado a ruta admin desde IP: ${req.ip}`);
    
    // Si la petición espera JSON (ej. API fetch), devolvemos 401
    if (req.xhr || req.headers.accept?.includes('application/json')) {
      return res.status(401).json({ 
        error: 'No autorizado', 
        message: 'Debes iniciar sesión como administrador para acceder a este recurso.' 
      });
    }

    // Si es navegación tradicional (browser), redirigimos al login
    return res.redirect('/admin/login');
  }

  if (!validateAdminActivity(req, res)) return;
  // Si está autenticado, agregamos la info del admin a res.locals
  // para que esté disponible automáticamente en las vistas EJS
  res.locals.admin = {
    id: req.session.adminId,
    correo: req.session.adminCorreo,
    rol: req.session.adminRol || 'ADMINISTRADOR'
  };

  // El usuario es admin, puede continuar a la ruta solicitada
  next();
};

/**
 * Middleware para redirigir administradores que ya iniciaron sesión.
 * Evita que un admin ya autenticado vea la página de "Login" de nuevo,
 * redirigiéndolo automáticamente al dashboard.
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {import('express').NextFunction} next 
 */
export const redirectIfAdminAuthenticated = (req, res, next) => {
  if (req.session && req.session.adminId) {
    const destino = req.session.adminRol === 'EMPLEADO' ? '/admin/ventas' : '/admin/dashboard';
    return res.redirect(destino);
  }
  next();
};

/**
 * Middleware de control de tasa (Rate Limiting) específico para login.
 * Implementa un mecanismo básico de protección contra fuerza bruta
 * utilizando un mapa en memoria (idealmente Redis en un cluster grande,
 * pero suficiente en memoria para la fase actual).
 */
const loginAttempts = new Map();

export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutos de bloqueo
  const maxAttempts = 5;

  if (!loginAttempts.has(ip)) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  const record = loginAttempts.get(ip);

  // Si el tiempo expiró, reseteamos
  if (now > record.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  // Si excede intentos
  if (record.count >= maxAttempts) {
    console.warn(`[Seguridad] Bloqueo temporal por fuerza bruta en login. IP: ${ip}`);
    return res.status(429).json({
      error: 'Demasiados intentos fallidos',
      message: 'Tu IP ha sido bloqueada temporalmente por seguridad. Intenta en 15 minutos.'
    });
  }

  // Incrementamos intentos
  record.count += 1;
  next();
};

/**
 * Función auxiliar (no exportada como middleware directo) para limpiar intentos 
 * exitosos de login y evitar bloqueos fantasma.
 * @param {string} ip 
 */
export const resetLoginAttempts = (ip) => {
  if (loginAttempts.has(ip)) {
    loginAttempts.delete(ip);
  }
};
// Líneas: 106
