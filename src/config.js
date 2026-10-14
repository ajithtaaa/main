const path = require('node:path');

const root = path.join(__dirname, '..');
const production = process.env.NODE_ENV === 'production';
// One folder for the database and uploads, so a host only needs a single persistent volume.
const dataDir = process.env.DATA_DIR || root;

if (production && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)) {
  throw new Error('SESSION_SECRET must be set to a random string of at least 32 characters in production.');
}

// Vercel has no persistent disk: the database and uploads must live in external services.
if (process.env.VERCEL) {
  if (!process.env.TURSO_DATABASE_URL) throw new Error('On Vercel, set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (connect a Turso database).');
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('On Vercel, connect a Vercel Blob store so BLOB_READ_WRITE_TOKEN is set.');
}

module.exports = {
  production,
  port: Number(process.env.PORT) || 3000,
  // Public domain (e.g. kochibrokers.com). When set, production visits to *.vercel.app redirect here.
  siteDomain: (process.env.SITE_DOMAIN || '').trim().toLowerCase(),
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  dbFile: process.env.DB_FILE || path.join(dataDir, 'data', 'app.db'),
  uploadDir: process.env.UPLOAD_DIR || path.join(dataDir, 'uploads'),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@budgetbrokers.in',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  // Sample listings have fake phone numbers, so they are off by default on a live site.
  seedDemo: process.env.SEED_DEMO ? process.env.SEED_DEMO === '1' : !production,
  maxRent: 10000,
  localities: [
    'Aluva', 'Edappally', 'Elamakkara', 'Ernakulam North', 'Ernakulam South', 'Fort Kochi',
    'Kadavanthra', 'Kakkanad', 'Kalamassery', 'Kaloor', 'Maradu', 'Mattancherry', 'Palarivattom',
    'Panampilly Nagar', 'Thevara', 'Thrippunithura', 'Vyttila',
  ],
  types: ['Apartment', 'House', 'Room', 'PG/Hostel', 'Shop/Office'],
  furnishings: ['Unfurnished', 'Semi-furnished', 'Furnished'],
  tenantPrefs: ['Any', 'Family', 'Bachelors', 'Ladies', 'Commercial'],
};
