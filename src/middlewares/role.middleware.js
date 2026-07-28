export function requireOwnerRole(req, res, next) {
  if (req.session?.adminRol === 'ADMINISTRADOR') return next();
  if (req.xhr || req.headers.accept?.includes('application/json')) {
    return res.status(403).json({
      error: 'Permiso insuficiente',
      message: 'Esta accion requiere el rol Administrador.'
    });
  }
  return res.redirect('/admin/ventas?error=Acceso+reservado+al+administrador');
}
