const express = require('express');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const config = require('../config');
const {
  db, SOLD_SQL, parseImages, isPremium, grantPremium, revokePremium, grantUnlock, GRANT_UNLOCK_SQL,
} = require('../db');
const { flash, verifyCsrf, requireAdmin, upload } = require('../middleware');
const storage = require('../storage');

const router = express.Router();
router.use(requireAdmin);

function back(req, fallback) {
  const ref = req.get('referer');
  try {
    const u = new URL(ref);
    if (u.host === req.get('host')) return u.pathname + u.search;
  } catch { /* ignore */ }
  return fallback;
}

// ---------------- Dashboard ----------------
router.get('/', async (req, res) => {
  // One round trip: this matters when the database is remote (Turso).
  const stats = await db.get(`SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'user') AS users,
      (SELECT COUNT(*) FROM listings WHERE status = 'active' AND NOT ${SOLD_SQL}) AS listings,
      (SELECT COUNT(*) FROM listings) AS allListings,
      (SELECT COUNT(*) FROM payments WHERE status = 'pending') AS pending,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved') AS revenue,
      (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'approved' AND reviewed_at >= datetime('now', '-30 days')) AS revenue30,
      (SELECT COUNT(*) FROM unlocks) AS unlocks`);
  const pending = (await db.all(`SELECT p.*, u.name, u.email, u.phone, l.title AS listing_title, l.locality AS listing_locality
    FROM payments p JOIN users u ON u.id = p.user_id LEFT JOIN listings l ON l.id = p.listing_id
    WHERE p.status = 'pending' ORDER BY p.id ASC LIMIT 10`));
  const recentUsers = (await db.all("SELECT * FROM users WHERE role = 'user' ORDER BY id DESC LIMIT 8"));
  const topListings = (await db.all('SELECT id, title, locality, rent, views, status FROM listings ORDER BY views DESC LIMIT 5'));
  res.render('admin/dashboard', { title: 'Admin dashboard', stats, pending, recentUsers, topListings });
});

// ---------------- Payments ----------------
router.get('/payments', async (req, res) => {
  const status = ['pending', 'approved', 'rejected', 'all'].includes(req.query.status) ? req.query.status : 'pending';
  const term = String(req.query.q || '').trim();
  const where = [];
  const params = [];
  if (status !== 'all') { where.push('p.status = ?'); params.push(status); }
  if (term) { where.push('(p.utr LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ? OR l.title LIKE ?)'); params.push(...Array(5).fill(`%${term}%`)); }
  const payments = (await db.all(`SELECT p.*, u.name, u.email, u.phone, r.name AS reviewer,
      l.title AS listing_title, l.locality AS listing_locality FROM payments p
    JOIN users u ON u.id = p.user_id LEFT JOIN users r ON r.id = p.reviewed_by LEFT JOIN listings l ON l.id = p.listing_id
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ${status === 'pending' ? 'p.id ASC' : 'p.id DESC'} LIMIT 200`, ...params));
  res.render('admin/payments', { title: 'Payment verification', payments, status, q: term });
});

router.post('/payments/:id/approve', verifyCsrf, async (req, res) => {
  const p = (await db.get('SELECT * FROM payments WHERE id = ?', req.params.id));
  if (!p || p.status !== 'pending') {
    flash(req, 'error', 'Payment not found or already reviewed.');
  } else {
    const approve = ["UPDATE payments SET status = 'approved', admin_note = ?, reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?",
      String(req.body.note || '').slice(0, 300), req.user.id, p.id];
    if (p.listing_id) {
      await db.batch([approve, [GRANT_UNLOCK_SQL, p.user_id, p.listing_id, p.id]]);
    } else {
      await db.batch([approve]);
      await grantPremium(p.user_id, Number(res.locals.settings.premium_days)); // legacy payment with no property
    }
    flash(req, 'success', `Payment #${p.id} approved – contact unlocked for the user.`);
  }
  res.redirect(back(req, '/admin/payments'));
});

router.post('/payments/:id/reject', verifyCsrf, async (req, res) => {
  const p = (await db.get('SELECT * FROM payments WHERE id = ?', req.params.id));
  if (!p || p.status !== 'pending') {
    flash(req, 'error', 'Payment not found or already reviewed.');
  } else {
    const note = String(req.body.note || '').trim().slice(0, 300) || 'Payment could not be verified.';
    await db.run("UPDATE payments SET status = 'rejected', admin_note = ?, reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?", note, req.user.id, p.id);
    flash(req, 'success', `Payment #${p.id} rejected.`);
  }
  res.redirect(back(req, '/admin/payments'));
});

// ---------------- Users ----------------
router.get('/users', async (req, res) => {
  const term = String(req.query.q || '').trim();
  const filter = ['premium', 'free', 'blocked', 'admin'].includes(req.query.filter) ? req.query.filter : '';
  const where = [];
  const params = [];
  if (term) { where.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'); params.push(...Array(3).fill(`%${term}%`)); }
  if (filter === 'premium' || filter === 'free') { where.push("u.plan = ? AND u.role = 'user'"); params.push(filter); }
  if (filter === 'blocked') where.push("u.status = 'blocked'");
  if (filter === 'admin') where.push("u.role = 'admin'");
  const users = (await db.all(`SELECT u.*,
      (SELECT COUNT(*) FROM payments p WHERE p.user_id = u.id) AS payment_count,
      (SELECT COUNT(*) FROM unlocks c WHERE c.user_id = u.id) AS unlock_count
    FROM users u ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY u.id DESC LIMIT 300`, ...params));
  users.forEach((u) => { u.active = isPremium(u); });
  res.render('admin/users', { title: 'Users', users, q: term, filter });
});

router.get('/users/new', async (req, res) => res.render('admin/user-new', { title: 'Add user', form: {} }));

router.post('/users', verifyCsrf, async (req, res) => {
  const form = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    phone: String(req.body.phone || '').replace(/[^\d]/g, '').slice(-10),
    role: req.body.role === 'admin' ? 'admin' : 'user',
    days: req.body.days,
  };
  const password = String(req.body.password || '');
  let error = null;
  if (form.name.length < 2) error = 'Name is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) error = 'Valid email is required.';
  else if (!/^\d{10}$/.test(form.phone)) error = 'Valid 10-digit phone is required.';
  else if (password.length < 6) error = 'Password must be at least 6 characters.';
  else if ((await db.get('SELECT 1 AS ok FROM users WHERE email = ?', form.email))) error = 'Email already registered.';
  if (error) return res.status(400).render('admin/user-new', { title: 'Add user', form, error });
  const r = (await db.run('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)', form.name, form.email, form.phone, bcrypt.hashSync(password, 10), form.role));
  const id = Number(r.lastInsertRowid);
  if (req.body.premium === '1') await grantPremium(id, parseInt(form.days, 10) || 0);
  flash(req, 'success', 'User created.');
  res.redirect(`/admin/users/${id}`);
});

async function loadTarget(req, res) {
  const u = (await db.get('SELECT * FROM users WHERE id = ?', req.params.id));
  if (!u) { res.status(404).render('error', { title: 'Not found', message: 'User not found.' }); return null; }
  return u;
}

router.get('/users/:id', async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  u.active = isPremium(u);
  const payments = (await db.all(`SELECT p.*, r.name AS reviewer, l.title AS listing_title FROM payments p
    LEFT JOIN users r ON r.id = p.reviewed_by LEFT JOIN listings l ON l.id = p.listing_id
    WHERE p.user_id = ? ORDER BY p.id DESC`, u.id));
  const unlockedList = (await db.all(`SELECT l.id, l.title, l.locality, l.rent, x.created_at, x.payment_id FROM unlocks x
    JOIN listings l ON l.id = x.listing_id WHERE x.user_id = ? ORDER BY x.created_at DESC`, u.id));
  res.render('admin/user', { title: u.name, target: u, payments, unlockedList });
});

router.post('/users/:id/unlocks', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  const listingId = parseInt(req.body.listing_id, 10);
  const listing = (await db.get('SELECT id, title FROM listings WHERE id = ?', listingId));
  if (!listing) flash(req, 'error', `No listing with ID #${req.body.listing_id}.`);
  else {
    await grantUnlock(u.id, listing.id);
    flash(req, 'success', `Unlocked “${listing.title}” for ${u.name}.`);
  }
  res.redirect(`/admin/users/${u.id}`);
});

router.post('/users/:id/unlocks/:listingId/delete', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  await db.run('DELETE FROM unlocks WHERE user_id = ? AND listing_id = ?', u.id, parseInt(req.params.listingId, 10));
  flash(req, 'success', 'Unlock removed.');
  res.redirect(`/admin/users/${u.id}`);
});

router.post('/users/:id/upgrade', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  const days = req.body.lifetime === '1' ? 0 : parseInt(req.body.days, 10);
  if (req.body.lifetime !== '1' && !(days > 0 && days <= 3650)) {
    flash(req, 'error', 'Enter a valid number of days (1–3650) or choose lifetime.');
  } else {
    await grantPremium(u.id, days);
    flash(req, 'success', `${u.name} upgraded to Premium${days ? ` (+${days} days)` : ' (lifetime)'}.`);
  }
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/downgrade', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  await revokePremium(u.id);
  flash(req, 'success', `${u.name} moved to the Free plan.`);
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/status', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  if (u.id === req.user.id) { flash(req, 'error', 'You cannot block yourself.'); return res.redirect(back(req, '/admin/users')); }
  const status = u.status === 'blocked' ? 'active' : 'blocked';
  await db.run('UPDATE users SET status = ? WHERE id = ?', status, u.id);
  flash(req, 'success', `${u.name} is now ${status}.`);
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/role', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  if (u.id === req.user.id) { flash(req, 'error', 'You cannot change your own role.'); return res.redirect(back(req, '/admin/users')); }
  const role = u.role === 'admin' ? 'user' : 'admin';
  await db.run('UPDATE users SET role = ? WHERE id = ?', role, u.id);
  flash(req, 'success', `${u.name} is now ${role === 'admin' ? 'an admin' : 'a regular user'}.`);
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/edit', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').replace(/[^\d]/g, '').slice(-10);
  const password = String(req.body.password || '');
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10}$/.test(phone)) {
    flash(req, 'error', 'Please enter a valid name, email and 10-digit phone.');
  } else if ((await db.get('SELECT 1 AS ok FROM users WHERE email = ? AND id != ?', email, u.id))) {
    flash(req, 'error', 'Another account already uses that email.');
  } else if (password && password.length < 6) {
    flash(req, 'error', 'New password must be at least 6 characters.');
  } else {
    await db.run('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?', name, email, phone, u.id);
    if (password) await db.run('UPDATE users SET password_hash = ? WHERE id = ?', bcrypt.hashSync(password, 10), u.id);
    flash(req, 'success', 'User details saved.');
  }
  res.redirect(`/admin/users/${u.id}`);
});

router.post('/users/:id/delete', verifyCsrf, async (req, res) => {
  const u = await loadTarget(req, res);
  if (!u) return;
  if (u.id === req.user.id) { flash(req, 'error', 'You cannot delete yourself.'); return res.redirect('/admin/users'); }
  // Explicit cleanup instead of relying on foreign-key cascades (not enforced on every libSQL connection).
  await db.batch([
    ['DELETE FROM unlocks WHERE user_id = ?', u.id],
    ['DELETE FROM payments WHERE user_id = ?', u.id],
    ['UPDATE payments SET reviewed_by = NULL WHERE reviewed_by = ?', u.id],
    ['DELETE FROM users WHERE id = ?', u.id],
  ]);
  flash(req, 'success', `User ${u.name} deleted.`);
  res.redirect('/admin/users');
});

// ---------------- Listings ----------------
router.get('/listings', async (req, res) => {
  const term = String(req.query.q || '').trim();
  const status = ['active', 'hidden', 'rented'].includes(req.query.status) ? req.query.status : '';
  const where = [];
  const params = [];
  if (term) { where.push('(title LIKE ? OR locality LIKE ? OR contact_name LIKE ? OR contact_phone LIKE ?)'); params.push(...Array(4).fill(`%${term}%`)); }
  if (status === 'rented') where.push(`status != 'hidden' AND ${SOLD_SQL}`);
  else if (status === 'active') where.push(`status = 'active' AND NOT ${SOLD_SQL}`);
  else if (status) { where.push('status = ?'); params.push(status); }
  const listings = (await db.all(`SELECT l.*, ${SOLD_SQL} AS sold_out, (SELECT COUNT(*) FROM unlocks c WHERE c.listing_id = l.id) AS unlocks
    FROM listings l ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT 300`, ...params)).map(parseImages);
  res.render('admin/listings', { title: 'Listings', listings, q: term, status });
});

/** "2026-10-20T18:30" typed in Kochi time (IST, UTC+5:30) -> "2026-10-20 13:00:00" UTC for SQLite. */
function istInputToUtc(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(value || ''))) return null;
  const d = new Date(`${value}:00+05:30`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 19).replace('T', ' ');
}

function listingForm(body) {
  const int = (v) => (v === '' || v == null ? null : parseInt(v, 10));
  return {
    sell_by: istInputToUtc(body.sell_by),
    title: String(body.title || '').trim().slice(0, 120),
    description: String(body.description || '').trim().slice(0, 3000),
    type: config.types.includes(body.type) ? body.type : '',
    bhk: String(body.bhk || '').trim().slice(0, 20),
    rent: int(body.rent),
    deposit: int(body.deposit) || 0,
    locality: config.localities.includes(body.locality) ? body.locality : '',
    address: String(body.address || '').trim().slice(0, 200),
    furnishing: config.furnishings.includes(body.furnishing) ? body.furnishing : 'Unfurnished',
    tenant_pref: config.tenantPrefs.includes(body.tenant_pref) ? body.tenant_pref : 'Any',
    area_sqft: int(body.area_sqft),
    contact_name: String(body.contact_name || '').trim().slice(0, 80),
    contact_phone: String(body.contact_phone || '').replace(/[^\d+]/g, '').slice(0, 15),
    contact_role: body.contact_role === 'Broker' ? 'Broker' : 'Owner',
    featured: body.featured === '1' ? 1 : 0,
    status: ['active', 'hidden', 'rented'].includes(body.status) ? body.status : 'active',
  };
}

function validateListing(f) {
  if (f.title.length < 4) return 'Title is required.';
  if (!f.type) return 'Choose a property type.';
  if (!f.locality) return 'Choose a locality.';
  if (!(f.rent > 0 && f.rent <= config.maxRent)) return `Rent must be between ₹1 and ₹${config.maxRent.toLocaleString('en-IN')}.`;
  if (f.deposit < 0) return 'Deposit cannot be negative.';
  if (f.contact_name.length < 2) return 'Contact name is required.';
  if (f.contact_phone.replace(/\D/g, '').length < 10) return 'Valid contact phone is required.';
  if (f.status === 'active' && f.sell_by && new Date(f.sell_by.replace(' ', 'T') + 'Z') <= new Date()) {
    return 'The “Rented out within” time is already past. Pick a later time, clear it, or set the status to Sold out.';
  }
  return null;
}

const listingUpload = upload.array('photos', 8);

router.get('/listings/new', async (req, res) => {
  // New listings default to a 3-day time bar.
  const sellBy = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 19).replace('T', ' ');
  res.render('admin/listing-form', { title: 'Add listing', listing: { images: [], status: 'active', contact_role: 'Owner', sell_by: sellBy } });
});

router.post('/listings', listingUpload, verifyCsrf, async (req, res) => {
  const f = listingForm(req.body);
  const error = validateListing(f);
  if (error) return res.status(400).render('admin/listing-form', { title: 'Add listing', listing: { ...f, images: [] }, error });
  const files = await Promise.all((req.files || []).map(storage.save));
  const r = (await db.run(`INSERT INTO listings (title, description, type, bhk, rent, deposit, locality, address, furnishing,
    tenant_pref, area_sqft, contact_name, contact_phone, contact_role, featured, status, images, sell_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, f.title, f.description, f.type, f.bhk, f.rent, f.deposit, f.locality, f.address, f.furnishing, f.tenant_pref,
      f.area_sqft, f.contact_name, f.contact_phone, f.contact_role, f.featured, f.status, JSON.stringify(files), f.sell_by));
  flash(req, 'success', 'Listing published.');
  res.redirect(`/admin/listings/${r.lastInsertRowid}/edit`);
});

router.get('/listings/:id/edit', async (req, res) => {
  const listing = parseImages((await db.get('SELECT * FROM listings WHERE id = ?', req.params.id)));
  if (!listing) return res.status(404).render('error', { title: 'Not found', message: 'Listing not found.' });
  res.render('admin/listing-form', { title: 'Edit listing', listing });
});

router.post('/listings/:id', listingUpload, verifyCsrf, async (req, res) => {
  const existing = parseImages((await db.get('SELECT * FROM listings WHERE id = ?', req.params.id)));
  if (!existing) return res.status(404).render('error', { title: 'Not found', message: 'Listing not found.' });
  const f = listingForm(req.body);
  const error = validateListing(f);
  if (error) {
    return res.status(400).render('admin/listing-form', { title: 'Edit listing', listing: { ...f, id: existing.id, images: existing.images }, error });
  }
  const files = await Promise.all((req.files || []).map(storage.save));
  const remove = [].concat(req.body.remove_images || []);
  const kept = existing.images.filter((img) => !remove.includes(img));
  await Promise.all(existing.images.filter((img) => remove.includes(img)).map(storage.remove));
  const images = kept.concat(files).slice(0, 12);
  (await db.run(`UPDATE listings SET title = ?, description = ?, type = ?, bhk = ?, rent = ?, deposit = ?, locality = ?, address = ?,
    furnishing = ?, tenant_pref = ?, area_sqft = ?, contact_name = ?, contact_phone = ?, contact_role = ?, featured = ?, status = ?,
    images = ?, sell_by = ?, updated_at = datetime('now') WHERE id = ?`, f.title, f.description, f.type, f.bhk, f.rent, f.deposit, f.locality, f.address, f.furnishing, f.tenant_pref,
      f.area_sqft, f.contact_name, f.contact_phone, f.contact_role, f.featured, f.status, JSON.stringify(images), f.sell_by, existing.id));
  flash(req, 'success', 'Listing updated.');
  res.redirect(`/admin/listings/${existing.id}/edit`);
});

router.post('/listings/:id/quick', verifyCsrf, async (req, res) => {
  const l = (await db.get('SELECT * FROM listings WHERE id = ?', req.params.id));
  if (!l) return res.status(404).render('error', { title: 'Not found', message: 'Listing not found.' });
  if (req.body.action === 'feature') await db.run('UPDATE listings SET featured = 1 - featured WHERE id = ?', l.id);
  if (['active', 'hidden', 'rented'].includes(req.body.action)) await db.run("UPDATE listings SET status = ?, updated_at = datetime('now') WHERE id = ?", req.body.action, l.id);
  // "Re-open" of a listing that is marked sold out also gets a fresh time bar below if its deadline had passed.
  if (req.body.action === 'active') {
    // Re-opening a listing whose time bar ran out gives it a fresh 3 days.
    await db.run(`UPDATE listings SET sell_by = datetime('now', '+3 days')
      WHERE id = ? AND sell_by IS NOT NULL AND sell_by <= datetime('now')`, l.id);
  }
  if (req.body.action === 'extend') {
    await db.run(`UPDATE listings SET status = 'active', sell_by = datetime(MAX(COALESCE(sell_by, datetime('now')), datetime('now')), '+3 days'),
      updated_at = datetime('now') WHERE id = ?`, l.id);
  }
  flash(req, 'success', `Listing #${l.id} updated.`);
  res.redirect(back(req, '/admin/listings'));
});

router.post('/listings/:id/delete', verifyCsrf, async (req, res) => {
  const l = parseImages((await db.get('SELECT * FROM listings WHERE id = ?', req.params.id)));
  if (l) {
    await db.batch([
      ['DELETE FROM unlocks WHERE listing_id = ?', l.id],
      ['UPDATE payments SET listing_id = NULL WHERE listing_id = ?', l.id],
      ['DELETE FROM listings WHERE id = ?', l.id],
    ]);
    await Promise.all(l.images.map(storage.remove));
    flash(req, 'success', `Listing “${l.title}” deleted.`);
  }
  res.redirect('/admin/listings');
});

// ---------------- Settings ----------------
router.get('/settings', async (req, res) => {
  const s = res.locals.settings;
  const link = `upi://pay?${new URLSearchParams({ pa: s.upi_id, pn: s.payee_name, am: s.unlock_price, cu: 'INR' })}`;
  const qr = s.qr_image ? storage.url(s.qr_image) : await QRCode.toDataURL(link, { margin: 1, width: 200 });
  res.render('admin/settings', { title: 'Settings', qr });
});

router.post('/settings', upload.single('qr'), verifyCsrf, async (req, res) => {
  const s = res.locals.settings;
  const price = parseInt(req.body.unlock_price, 10);
  const days = parseInt(req.body.premium_days, 10);
  const upi = String(req.body.upi_id || '').trim();
  if (!(price > 0 && price <= 10000) || !(days >= 0 && days <= 3650) || !/^[\w.-]+@[\w.-]+$/.test(upi)) {
    flash(req, 'error', 'Check the price (1–10000), validity days (0–3650) and UPI ID (e.g. name@bank).');
    return res.redirect('/admin/settings');
  }
  const values = {
    unlock_price: price,
    premium_days: days,
    upi_id: upi,
    payee_name: String(req.body.payee_name || '').trim().slice(0, 60) || s.payee_name,
    support_phone: String(req.body.support_phone || '').trim().slice(0, 30),
    support_whatsapp: String(req.body.support_whatsapp || '').replace(/\D/g, '').slice(0, 15),
    demo_mode: req.body.demo_mode === '1' ? '1' : '0',
  };
  if (req.file) {
    values.qr_image = await storage.save(req.file);
    await storage.remove(s.qr_image);
  } else if (req.body.remove_qr === '1') {
    values.qr_image = '';
    await storage.remove(s.qr_image);
  }
  await db.batch(Object.entries(values).map(([key, value]) => [
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', key, String(value)]));
  flash(req, 'success', 'Settings saved.');
  res.redirect('/admin/settings');
});

router.post('/settings/password', verifyCsrf, async (req, res) => {
  const current = String(req.body.current || '');
  const password = String(req.body.password || '');
  if (!bcrypt.compareSync(current, req.user.password_hash)) flash(req, 'error', 'Current password is incorrect.');
  else if (password.length < 8) flash(req, 'error', 'Admin password must be at least 8 characters.');
  else {
    await db.run('UPDATE users SET password_hash = ? WHERE id = ?', bcrypt.hashSync(password, 10), req.user.id);
    flash(req, 'success', 'Admin password changed.');
  }
  res.redirect('/admin/settings');
});

module.exports = router;
