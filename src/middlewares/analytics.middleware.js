import { resolveAnalyticsIdentity } from '../services/analytics-cookie.service.js';
import { AnalyticsRecordService } from '../services/analytics-record.service.js';

const EVENT_PATH = '/analitica/evento';
const ignoredPaths = new Set(['/api/health', '/favicon.ico']);
const BOT_PATTERN = /(bot|crawler|spider|slurp|headless|curl|wget|python-requests|facebookexternalhit|preview)/i;

function isPublicPageRequest(req) {
  return !req.path.startsWith('/admin');
}

export async function trackSiteVisit(req, res, next) {
  if (ignoredPaths.has(req.path) || req.path.startsWith('/api/')) return next();
  if (BOT_PATTERN.test(String(req.get('user-agent') || ''))) return next();

  if (req.path === EVENT_PATH) {
    const { visitKey } = resolveAnalyticsIdentity(req, res);
    req.analyticsVisitKey = visitKey;
    return next();
  }
  if (req.method !== 'GET') return next();
  const { visitorId, visitKey } = resolveAnalyticsIdentity(req, res);

  res.once('finish', async () => {
    const contentType = String(res.getHeader('content-type') || '');
    if (res.statusCode < 200 || res.statusCode >= 300 || !contentType.includes('text/html')) return;

    try {
      const isAdmin = Boolean(req.session?.adminId);
      const visit = await AnalyticsRecordService.ensureVisit(visitorId, visitKey, isAdmin);
      if (!isAdmin && isPublicPageRequest(req)) {
        await AnalyticsRecordService.recordPage(visit.id, req.originalUrl);
      }
    } catch (error) {
      console.error('[Analitica] No se pudo registrar la visita:', error.message);
    }
  });

  next();
}
