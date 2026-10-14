const crypto = require('node:crypto');
const multer = require('multer');
const config = require('./config');
const { db, ready, getSettings, isPremium, unlockedIds } = require('./db');
const storage = require('./storage');

/** Attach the logged-in user, settings and helpers to req/res.locals. */
async function loadUser(req, res, next) {
  await ready();
  let user = null;
  if (req.session.userId) {
    user = (await db.get('SELECT * FROM users WHERE id = ?', req.session.userId)) || null;
    if (!user || user.status === 'blocked') {
      if (user) req.session.flash = { type: 'error', text: 'Your account has been blocked. Contact support.' };
      req.session.userId = null;
      user = null;
    }
  }
  req.user = user;
  res.locals.user = user;
  res.locals.premium = isPremium(user); // admin or admin-granted all-access
  res.locals.unlocked = await unlockedIds(user);
  res.locals.settings = await getSettings();
  res.locals.config = config;
  res.locals.path = req.path;
  res.locals.flash = req.session.flash || null;
  req.session.flash = null;
  res.locals.pendingCount = user && user.role === 'admin'
    ? (await db.get("SELECT COUNT(*) AS n FROM payments WHERE status = 'pending'")).n
    : 0;
  next();
}

function flash(req, type, text) {
  req.session.flash = { type, text };
}

/** Per-session CSRF token. Call verifyCsrf after the body is parsed (incl. multer). */
function csrfToken(req, res, next) {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(18).toString('hex');
  res.locals.csrf = req.session.csrf;
  next();
}

function verifyCsrf(req, res, next) {
  if (req.method !== 'POST') return next();
  const sent = (req.body && req.body._csrf) || req.get('x-csrf-token');
  const expected = req.session.csrf;
  if (!sent || !expected || sent.length !== expected.length ||
      !crypto.timingSafeEqual(Buffer.from(sent), Buffer.from(expected))) {
    return res.status(403).render('error', { title: 'Session expired', message: 'Your form session expired. Please go back, refresh the page and try again.' });
  }
  next();
}

function requireLogin(req, res, next) {
  if (!req.user) {
    flash(req, 'info', 'Please log in to continue.');
    return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.redirect('/login?next=' + encodeURIComponent(req.originalUrl));
  if (req.user.role !== 'admin') return res.status(403).render('error', { title: 'Forbidden', message: 'Admins only.' });
  next();
}

/** Tiny in-memory rate limiter (per IP + key). */
function rateLimit({ windowMs, max, key }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const id = `${key}:${req.ip}`;
    const entry = hits.get(id);
    if (!entry || entry.reset < now) {
      hits.set(id, { count: 1, reset: now + windowMs });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      return res.status(429).render('error', { title: 'Too many attempts', message: 'Too many attempts. Please wait a few minutes and try again.' });
    }
    next();
  };
}

// Files are held in memory and only saved (to disk or Vercel Blob) once the form is valid.
// Vercel caps a request body at 4.5 MB, so the browser shrinks photos before upload (see app.js).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8 },
  fileFilter: (req, file, cb) => cb(null, Boolean(storage.EXT[file.mimetype])),
});

module.exports = { loadUser, flash, csrfToken, verifyCsrf, requireLogin, requireAdmin, rateLimit, upload };
