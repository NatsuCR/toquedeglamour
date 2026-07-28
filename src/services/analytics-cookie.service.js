import crypto from 'crypto';

const VISITOR_COOKIE = 'tdg_visitor';
const VISIT_COOKIE = 'tdg_visit';
const VISITOR_MAX_AGE = 365 * 24 * 60 * 60 * 1000;
const VISIT_MAX_AGE = 30 * 60 * 1000;

function readCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((cookies, item) => {
    const separator = item.indexOf('=');
    if (separator < 1) return cookies;
    const key = item.slice(0, separator).trim();
    cookies[key] = decodeURIComponent(item.slice(separator + 1).trim());
    return cookies;
  }, {});
}

function cookieOptions(maxAge) {
  return {
    maxAge,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  };
}

export function resolveAnalyticsIdentity(req, res) {
  const cookies = readCookies(req);
  const visitorId = cookies[VISITOR_COOKIE] || crypto.randomUUID();
  const visitKey = cookies[VISIT_COOKIE] || crypto.randomUUID();

  res.cookie(VISITOR_COOKIE, visitorId, cookieOptions(VISITOR_MAX_AGE));
  res.cookie(VISIT_COOKIE, visitKey, cookieOptions(VISIT_MAX_AGE));
  return { visitorId, visitKey };
}
