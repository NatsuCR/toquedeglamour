import { resolveAnalyticsIdentity } from '../services/analytics-cookie.service.js';
import { AnalyticsRecordService } from '../services/analytics-record.service.js';

const EVENT_PATH = '/analitica/evento';
const ignoredPaths = new Set(['/api/health', '/favicon.ico']);

function isPublicPageRequest(req) {
  return !req.path.startsWith('/admin');
}

export async function trackSiteVisit(req, res, next) {
  if (ignoredPaths.has(req.path) || req.path.startsWith('/api/')) return next();
  const { visitorId, visitKey } = resolveAnalyticsIdentity(req, res);
  req.analyticsVisitKey = visitKey;
  if (req.path === EVENT_PATH || req.method !== 'GET') return next();

  try {
    const isAdmin = Boolean(req.session?.adminId);
    const visit = await AnalyticsRecordService.ensureVisit(visitorId, visitKey, isAdmin);
    if (!isAdmin && isPublicPageRequest(req)) {
      await AnalyticsRecordService.recordPage(visit.id, req.originalUrl);
    }
  } catch (error) {
    console.error('[Analitica] No se pudo registrar la visita:', error.message);
  }

  next();
}
