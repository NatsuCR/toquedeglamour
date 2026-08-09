export const ADMIN_IDLE_TIMEOUT_MS = 3 * 60 * 60 * 1000;

function expectsJson(req) {
  return req.xhr || req.headers.accept?.includes('application/json');
}

export function startAdminActivity(req) {
  req.session.adminLastActivityAt = Date.now();
}

export function validateAdminActivity(req, res) {
  const lastActivity = Number(req.session.adminLastActivityAt || 0);
  if (!lastActivity) {
    startAdminActivity(req);
    return true;
  }
  if (Date.now() - lastActivity <= ADMIN_IDLE_TIMEOUT_MS) return true;

  req.session.destroy(() => {});
  res.clearCookie('toquedeglamour_sid');
  if (expectsJson(req)) {
    res.status(401).json({
      error: 'Sesion expirada',
      message: 'La sesion se cerro tras 3 horas sin actividad.'
    });
  } else {
    res.redirect('/admin/login?inactividad=1');
  }
  return false;
}

export function touchAdminActivity(req, res) {
  startAdminActivity(req);
  req.session.save((error) => {
    if (error) return res.status(500).json({ ok: false });
    res.status(204).end();
  });
}
