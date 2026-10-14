const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const config = require('./config');

fs.mkdirSync(path.dirname(config.dbFile), { recursive: true });
const db = new DatabaseSync(config.dbFile);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  phone TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free','premium')),
  premium_until TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','blocked')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  bhk TEXT NOT NULL DEFAULT '',
  rent INTEGER NOT NULL,
  deposit INTEGER NOT NULL DEFAULT 0,
  locality TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  furnishing TEXT NOT NULL DEFAULT 'Unfurnished',
  tenant_pref TEXT NOT NULL DEFAULT 'Any',
  area_sqft INTEGER,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_role TEXT NOT NULL DEFAULT 'Owner' CHECK (contact_role IN ('Owner','Broker')),
  images TEXT NOT NULL DEFAULT '[]',
  featured INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','hidden','rented')),
  views INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  utr TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  admin_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- One row per (user, property) the user has paid for (or was granted by an admin).
CREATE TABLE IF NOT EXISTS unlocks (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_unlocks_listing ON unlocks(listing_id);
`);

// Migrate databases created before per-property unlocks.
if (!db.prepare('PRAGMA table_info(payments)').all().some((c) => c.name === 'listing_id')) {
  db.exec('ALTER TABLE payments ADD COLUMN listing_id INTEGER REFERENCES listings(id) ON DELETE SET NULL');
}
db.exec('DROP TABLE IF EXISTS contact_views');
db.exec('CREATE INDEX IF NOT EXISTS idx_payments_listing ON payments(user_id, listing_id)');

// ---------- settings ----------
const DEFAULT_SETTINGS = {
  unlock_price: '99',
  premium_days: '30', // default length of an admin-granted all-access upgrade (0 = lifetime)
  upi_id: 'budgetbrokers@upi',
  payee_name: 'Budget Brokers Kochi',
  qr_image: '', // optional uploaded QR image; empty => auto-generated demo QR
  support_phone: '+91 90000 00000',
  support_whatsapp: '919000000000',
  demo_mode: '1',
};

for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
  db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

function getSettings() {
  const out = { ...DEFAULT_SETTINGS };
  for (const row of db.prepare('SELECT key, value FROM settings').all()) out[row.key] = row.value;
  return out;
}

function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, String(value));
}

// ---------- seed ----------
function seed() {
  const adminCount = db.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin'").get().n;
  if (adminCount === 0) {
    if (config.production && !process.env.ADMIN_PASSWORD) {
      throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD to create the first admin account in production.');
    }
    db.prepare(`INSERT INTO users (name, email, phone, password_hash, role, plan)
                VALUES (?, ?, ?, ?, 'admin', 'premium')`)
      .run('Admin', config.adminEmail, '0000000000', bcrypt.hashSync(config.adminPassword, 10));
    console.log(`[seed] Admin created: ${config.adminEmail} (password from ADMIN_PASSWORD env or default)`);
  }

  const listingCount = db.prepare('SELECT COUNT(*) AS n FROM listings').get().n;
  if (listingCount === 0 && config.seedDemo) {
    const insert = db.prepare(`INSERT INTO listings
      (title, description, type, bhk, rent, deposit, locality, address, furnishing, tenant_pref, area_sqft,
       contact_name, contact_phone, contact_role, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
    const demo = [
      ['1BHK near Infopark Phase 1', 'Compact 1BHK on the first floor, 5 min walk to Infopark. Water and power backup available. Ideal for IT professionals.', 'Apartment', '1 BHK', 8500, 25000, 'Kakkanad', 'Near Infopark Phase 1, Kakkanad', 'Semi-furnished', 'Bachelors', 550, 'Suresh K', '9000000001', 'Broker', 1],
      ['Single room with attached bath', 'Neat single room with attached bathroom and separate entrance. Close to Edappally junction and Lulu Mall.', 'Room', '1 RK', 4500, 10000, 'Edappally', 'Behind Edappally Church', 'Furnished', 'Bachelors', 180, 'Mary Thomas', '9000000002', 'Owner', 1],
      ['Ladies PG with food – Kaloor', 'Safe ladies PG with 3 times Kerala food, Wi-Fi and washing machine. 2 sharing. Near Kaloor bus stand & metro.', 'PG/Hostel', 'Shared', 6000, 6000, 'Kaloor', 'Stadium Link Road, Kaloor', 'Furnished', 'Ladies', null, 'Anitha R', '9000000003', 'Owner', 0],
      ['2BHK independent house – Aluva', 'Ground floor of an independent house with car porch and well water. Calm residential area near Aluva metro.', 'House', '2 BHK', 9500, 50000, 'Aluva', 'Thottakkattukara, Aluva', 'Unfurnished', 'Family', 850, 'Rajan P', '9000000004', 'Owner', 1],
      ['1BHK flat near Vyttila Hub', 'Walking distance to Vyttila Mobility Hub and metro. 24x7 security, lift and covered parking for two-wheeler.', 'Apartment', '1 BHK', 9000, 30000, 'Vyttila', 'Silver Sand Island Road, Vyttila', 'Semi-furnished', 'Any', 600, 'Faisal M', '9000000005', 'Broker', 0],
      ['Studio room – Palarivattom', 'Studio room with kitchenette. Good bus connectivity, near Palarivattom metro station.', 'Room', '1 RK', 5500, 15000, 'Palarivattom', 'Near Palarivattom bypass', 'Semi-furnished', 'Any', 250, 'Joseph V', '9000000006', 'Owner', 0],
      ['Men\'s hostel – Kadavanthra', 'Men\'s hostel, 3 sharing. Food optional. Near Kadavanthra metro and Panampilly Nagar.', 'PG/Hostel', 'Shared', 3500, 3500, 'Kadavanthra', 'KP Vallon Road, Kadavanthra', 'Furnished', 'Bachelors', null, 'Hostel Warden', '9000000007', 'Broker', 0],
      ['Heritage room – Fort Kochi', 'Room in an old Portuguese-style home. Peaceful lane, 10 min walk to the beach and Chinese fishing nets.', 'Room', '1 RK', 7000, 14000, 'Fort Kochi', 'Princess Street area, Fort Kochi', 'Furnished', 'Any', 220, 'Elizabeth D', '9000000008', 'Owner', 1],
      ['2BHK upstairs portion – Thrippunithura', 'Upstairs portion with separate staircase, 2 bedrooms, hall and kitchen. Near Hill Palace.', 'House', '2 BHK', 9800, 40000, 'Thrippunithura', 'Near Hill Palace, Thrippunithura', 'Unfurnished', 'Family', 900, 'Gopakumar N', '9000000009', 'Broker', 0],
      ['Small shop space – Kalamassery', 'Ground floor shop room facing the main road. Suitable for mobile shop, tailoring or bakery.', 'Shop/Office', '-', 8000, 50000, 'Kalamassery', 'HMT Junction, Kalamassery', 'Unfurnished', 'Commercial', 200, 'Abdul Rasheed', '9000000010', 'Owner', 0],
      ['1BHK – Panampilly Nagar', 'Old building but well maintained 1BHK in a prime locality. Walk to Panampilly Nagar walkway.', 'Apartment', '1 BHK', 9900, 35000, 'Panampilly Nagar', '10th Cross Road, Panampilly Nagar', 'Unfurnished', 'Family', 500, 'Lakshmi S', '9000000011', 'Owner', 0],
      ['Room for working women – Ernakulam South', 'Single room with shared kitchen in a family house. Near Ernakulam South railway station.', 'Room', '1 RK', 4000, 8000, 'Ernakulam South', 'Near South Railway Station', 'Semi-furnished', 'Ladies', 160, 'Shobha M', '9000000012', 'Owner', 0],
    ];
    for (const row of demo) insert.run(...row);
    console.log(`[seed] Inserted ${demo.length} demo listings`);
  }
}
seed();

// ---------- helpers ----------
function parseImages(listing) {
  if (!listing) return listing;
  try { listing.images = JSON.parse(listing.images || '[]'); } catch { listing.images = []; }
  return listing;
}

function isPremium(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.plan !== 'premium') return false;
  if (!user.premium_until) return true; // lifetime
  return new Date(user.premium_until.replace(' ', 'T') + 'Z') > new Date();
}

/** Grant premium. days = 0 means lifetime. Extends from current expiry if still active. */
function grantPremium(userId, days) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) return;
  if (!days || days <= 0) {
    db.prepare("UPDATE users SET plan = 'premium', premium_until = NULL WHERE id = ?").run(userId);
    return;
  }
  const base = isPremium(user) && user.premium_until ? user.premium_until : null;
  db.prepare("UPDATE users SET plan = 'premium', premium_until = datetime(COALESCE(?, datetime('now')), ?) WHERE id = ?")
    .run(base, `+${Math.floor(Number(days))} days`, userId);
}

/** True if the user can see this listing's contact (admin, all-access, or paid for it). */
function hasUnlocked(user, listingId) {
  if (!user) return false;
  if (isPremium(user)) return true;
  return Boolean(db.prepare('SELECT 1 FROM unlocks WHERE user_id = ? AND listing_id = ?').get(user.id, listingId));
}

function unlockedIds(user) {
  if (!user) return new Set();
  return new Set(db.prepare('SELECT listing_id FROM unlocks WHERE user_id = ?').all(user.id).map((r) => r.listing_id));
}

function grantUnlock(userId, listingId, paymentId = null) {
  db.prepare('INSERT OR IGNORE INTO unlocks (user_id, listing_id, payment_id) VALUES (?, ?, ?)').run(userId, listingId, paymentId);
}

function revokePremium(userId) {
  db.prepare("UPDATE users SET plan = 'free', premium_until = NULL WHERE id = ?").run(userId);
}

module.exports = {
  db, getSettings, setSetting, parseImages, isPremium, grantPremium, revokePremium, hasUnlocked, unlockedIds, grantUnlock,
};
