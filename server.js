const path = require('node:path');
const express = require('express');
const cookieSession = require('cookie-session');
const config = require('./src/config');
const { loadUser, csrfToken } = require('./src/middleware');
const { DEFAULT_SETTINGS } = require('./src/db');
const storage = require('./src/storage');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.locals.inr = (n) => '₹' + Number(n || 0).toLocaleString('en-IN');
app.locals.upl = storage.url;
app.locals.img = (listing, i = 0) => (listing.images && listing.images[i] ? storage.url(listing.images[i]) : `/static/img/placeholder-${(listing.type || 'house').toLowerCase().replace(/[^a-z]/g, '')}.svg`);
app.locals.date = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '–');
app.locals.day = (s) => (s ? new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' }) : '–');

const toDate = (s) => new Date(String(s).replace(' ', 'T') + 'Z');
/** UTC SQLite time -> value for <input type="datetime-local"> in Kochi time (IST). */
app.locals.istInput = (s) => (s ? new Date(toDate(s).getTime() + 5.5 * 36e5).toISOString().slice(0, 16) : '');
function left(ms) {
  const h = Math.floor(ms / 36e5);
  if (h >= 48) return `${Math.floor(h / 24)} days`;
  if (h >= 24) return `1 day ${h - 24} hrs`;
  if (h >= 1) return `${h} hrs ${Math.floor((ms % 36e5) / 6e4)} min`;
  return `${Math.max(1, Math.floor(ms / 6e4))} min`;
}
/** Time bar data for a listing with a sell_by deadline. The bar shows time left on a 7-day scale. */
app.locals.timebar = (l) => {
  if (!l.sell_by || l.sold_out) return null;
  const end = toDate(l.sell_by).getTime();
  const now = Date.now();
  if (end <= now) return null;
  const pct = Math.max(3, Math.min(100, Math.round(((end - now) / (7 * 864e5)) * 100)));
  return { iso: new Date(end).toISOString(), pct, left: left(end - now), urgent: end - now < 24 * 36e5 };
};

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
  });
  next();
});

app.get('/healthz', (req, res) => res.type('text').send('ok'));

// Send production visits on the *.vercel.app address to the real domain, so every visitor
// (and analytics) uses kochibrokers.com. Preview deployments are left alone.
app.use((req, res, next) => {
  const host = String(req.hostname || '').toLowerCase();
  if (config.siteDomain && process.env.VERCEL_ENV === 'production' && host.endsWith('.vercel.app')) {
    return res.redirect(308, `https://${config.siteDomain}${req.originalUrl}`);
  }
  res.locals.canonical = config.siteDomain ? `https://${config.siteDomain}${req.path}` : null;
  res.locals.vercelAnalytics = Boolean(process.env.VERCEL);
  next();
});
app.use('/static', express.static(path.join(__dirname, 'public'), { maxAge: '1d' }));
app.use('/uploads', express.static(config.uploadDir, { maxAge: '7d' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(cookieSession({
  name: 'bb_session',
  secret: config.sessionSecret,
  httpOnly: true,
  sameSite: 'lax',
  secure: config.production,
  maxAge: 30 * 24 * 60 * 60 * 1000,
}));
app.use(loadUser);
app.use(csrfToken);

app.use(require('./src/routes/auth'));
app.use(require('./src/routes/payments'));
app.use('/admin', require('./src/routes/admin'));
app.use(require('./src/routes/public'));

app.use((req, res) => {
  res.status(404).render('error', { title: 'Not found', message: 'The page you are looking for does not exist.' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return;
  // Errors can happen before loadUser ran (e.g. the database is unreachable), so fill in what the layout needs.
  if (!res.locals.settings) Object.assign(res.locals, { user: null, premium: false, unlocked: new Set(), settings: DEFAULT_SETTINGS, config, path: req.path, flash: null, pendingCount: 0, csrf: '' });
  const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image too large (max 5 MB each).' : 'Something went wrong. Please try again.';
  res.status(err.status || 500).render('error', { title: 'Error', message });
});

if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`Budget Brokers running on http://localhost:${config.port}`);
    if (!process.env.ADMIN_PASSWORD) console.warn('[warn] Using default admin password. Set ADMIN_PASSWORD before going live.');
    if (!process.env.SESSION_SECRET) console.warn('[warn] Using default SESSION_SECRET. Set SESSION_SECRET before going live.');
  });
}

module.exports = app;
