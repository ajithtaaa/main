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

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
  });
  next();
});

app.get('/healthz', (req, res) => res.type('text').send('ok'));
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
