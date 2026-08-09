const EXPLOIT_PATTERNS = [
  /\.php(?:$|[/?])/i,
  /(?:^|\/)(?:wp-admin|wp-content|wp-includes|wordpress)(?:\/|$)/i,
  /wlwmanifest\.xml$/i,
  /xmlrpc\.php$/i,
  /(?:^|\/)\.(?:env|git)(?:\/|$)/i
];

export function rejectKnownExploitProbe(req, res, next) {
  const requestedPath = String(req.path || '');
  const isProbe = EXPLOIT_PATTERNS.some((pattern) => pattern.test(requestedPath));
  if (!isProbe) return next();

  res.set('Cache-Control', 'no-store');
  return res.status(404).type('text/plain').send('Not Found');
}
