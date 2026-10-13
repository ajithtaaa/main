const express = require('express');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
const config = require('../config');
const { db, getSettings, setSetting, parseImages, isPremium, grantPremium, revokePremium } = require('../db');
const { flash, verifyCsrf, requireAdmin, upload, removeUpload } = require('../middleware');

const router = express.Router();
router.use(requireAdmin);

function tx(fn) {
  db.exec('BEGIN');
  try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; }
}

function back(req, fallback) {
  const ref = req.get('referer');
  try {
    const u = new URL(ref);
    if (u.host === req.get('host')) return u.pathname + u.search;
  } catch { /* ignore */ }
  return fallback;
}

// ---------------- Dashboard ----------------
router.get('/', (req, res) => {
  const one = (sql, ...p) => db.prepare(sql).get(...p).n;
  const stats = {
    users: one("SELECT COUNT(*) AS n FROM users WHERE role = 'user'"),
    premium: db.prepare("SELECT * FROM users WHERE role = 'user' AND plan = 'premium'").all().filter(isPremium).length,
    listings: one("SELECT COUNT(*) AS n FROM listings WHERE status = 'active'"),
    allListings: one('SELECT COUNT(*) AS n FROM listings'),
    pending: one("SELECT COUNT(*) AS n FROM payments WHERE status = 'pending'"),
    revenue: one("SELECT COALESCE(SUM(amount), 0) AS n FROM payments WHERE status = 'approved'"),
    revenue30: one("SELECT COALESCE(SUM(amount), 0) AS n FROM payments WHERE status = 'approved' AND reviewed_at >= datetime('now', '-30 days')"),
    unlocks: one('SELECT COUNT(*) AS n FROM contact_views'),
  };
  const pending = db.prepare(`SELECT p.*, u.name, u.email, u.phone FROM payments p JOIN users u ON u.id = p.user_id
    WHERE p.status = 'pending' ORDER BY p.id ASC LIMIT 10`).all();
  const recentUsers = db.prepare("SELECT * FROM users WHERE role = 'user' ORDER BY id DESC LIMIT 8").all();
  const topListings = db.prepare('SELECT id, title, locality, rent, views, status FROM listings ORDER BY views DESC LIMIT 5').all();
  res.render('admin/dashboard', { title: 'Admin dashboard', stats, pending, recentUsers, topListings });
});

// ---------------- Payments ----------------
router.get('/payments', (req, res) => {
  const status = ['pending', 'approved', 'rejected', 'all'].includes(req.query.status) ? req.query.status : 'pending';
  const term = String(req.query.q || '').trim();
  const where = [];
  const params = [];
  if (status !== 'all') { where.push('p.status = ?'); params.push(status); }
  if (term) { where.push('(p.utr LIKE ? OR u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'); params.push(...Array(4).fill(`%${term}%`)); }
  const payments = db.prepare(`SELECT p.*, u.name, u.email, u.phone, r.name AS reviewer FROM payments p
    JOIN users u ON u.id = p.user_id LEFT JOIN users r ON r.id = p.reviewed_by
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY ${status === 'pending' ? 'p.id ASC' : 'p.id DESC'} LIMIT 200`).all(...params);
  res.render('admin/payments', { title: 'Payment verification', payments, status, q: term });
});

router.post('/payments/:id/approve', verifyCsrf, (req, res) => {
  const p = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!p || p.status !== 'pending') {
    flash(req, 'error', 'Payment not found or already reviewed.');
  } else {
    tx(() => {
      db.prepare("UPDATE payments SET status = 'approved', admin_note = ?, reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?")
        .run(String(req.body.note || '').slice(0, 300), req.user.id, p.id);
      grantPremium(p.user_id, Number(getSettings().premium_days));
    });
    flash(req, 'success', `Payment #${p.id} approved – contacts unlocked for the user.`);
  }
  res.redirect(back(req, '/admin/payments'));
});

router.post('/payments/:id/reject', verifyCsrf, (req, res) => {
  const p = db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id);
  if (!p || p.status !== 'pending') {
    flash(req, 'error', 'Payment not found or already reviewed.');
  } else {
    const note = String(req.body.note || '').trim().slice(0, 300) || 'Payment could not be verified.';
    db.prepare("UPDATE payments SET status = 'rejected', admin_note = ?, reviewed_at = datetime('now'), reviewed_by = ? WHERE id = ?")
      .run(note, req.user.id, p.id);
    flash(req, 'success', `Payment #${p.id} rejected.`);
  }
  res.redirect(back(req, '/admin/payments'));
});

// ---------------- Users ----------------
router.get('/users', (req, res) => {
  const term = String(req.query.q || '').trim();
  const filter = ['premium', 'free', 'blocked', 'admin'].includes(req.query.filter) ? req.query.filter : '';
  const where = [];
  const params = [];
  if (term) { where.push('(u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)'); params.push(...Array(3).fill(`%${term}%`)); }
  if (filter === 'premium' || filter === 'free') { where.push("u.plan = ? AND u.role = 'user'"); params.push(filter); }
  if (filter === 'blocked') where.push("u.status = 'blocked'");
  if (filter === 'admin') where.push("u.role = 'admin'");
  const users = db.prepare(`SELECT u.*,
      (SELECT COUNT(*) FROM payments p WHERE p.user_id = u.id) AS payment_count,
      (SELECT COUNT(*) FROM contact_views c WHERE c.user_id = u.id) AS unlock_count
    FROM users u ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY u.id DESC LIMIT 300`).all(...params);
  users.forEach((u) => { u.active = isPremium(u); });
  res.render('admin/users', { title: 'Users', users, q: term, filter });
});

router.get('/users/new', (req, res) => res.render('admin/user-new', { title: 'Add user', form: {} }));

router.post('/users', verifyCsrf, (req, res) => {
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
  else if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(form.email)) error = 'Email already registered.';
  if (error) return res.status(400).render('admin/user-new', { title: 'Add user', form, error });
  const r = db.prepare('INSERT INTO users (name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?)')
    .run(form.name, form.email, form.phone, bcrypt.hashSync(password, 10), form.role);
  const id = Number(r.lastInsertRowid);
  if (req.body.premium === '1') grantPremium(id, parseInt(form.days, 10) || 0);
  flash(req, 'success', 'User created.');
  res.redirect(`/admin/users/${id}`);
});

function loadTarget(req, res) {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!u) { res.status(404).render('error', { title: 'Not found', message: 'User not found.' }); return null; }
  return u;
}

router.get('/users/:id', (req, res) => {
  const u = loadTarget(req, res);
  if (!u) return;
  u.active = isPremium(u);
  const payments = db.prepare(`SELECT p.*, r.name AS reviewer FROM payments p LEFT JOIN users r ON r.id = p.reviewed_by
    WHERE p.user_id = ? ORDER BY p.id DESC`).all(u.id);
  const viewed = db.prepare(`SELECT l.id, l.title, l.locality, l.rent, cv.created_at FROM contact_views cv
    JOIN listings l ON l.id = cv.listing_id WHERE cv.user_id = ? ORDER BY cv.created_at DESC`).all(u.id);
  res.render('admin/user', { title: u.name, target: u, payments, viewed });
});

router.post('/users/:id/upgrade', verifyCsrf, (req, res) => {
  const u = loadTarget(req, res);
  if (!u) return;
  const days = req.body.lifetime === '1' ? 0 : parseInt(req.body.days, 10);
  if (req.body.lifetime !== '1' && !(days > 0 && days <= 3650)) {
    flash(req, 'error', 'Enter a valid number of days (1–3650) or choose lifetime.');
  } else {
    grantPremium(u.id, days);
    flash(req, 'success', `${u.name} upgraded to Premium${days ? ` (+${days} days)` : ' (lifetime)'}.`);
  }
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/downgrade', verifyCsrf, (req, res) => {
  const u = loadTarget(req, res);
  if (!u) return;
  revokePremium(u.id);
  flash(req, 'success', `${u.name} moved to the Free plan.`);
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/status', verifyCsrf, (req, res) => {
  const u = loadTarget(req, res);
  if (!u) return;
  if (u.id === req.user.id) { flash(req, 'error', 'You cannot block yourself.'); return res.redirect(back(req, '/admin/users')); }
  const status = u.status === 'blocked' ? 'active' : 'blocked';
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, u.id);
  flash(req, 'success', `${u.name} is now ${status}.`);
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/role', verifyCsrf, (req, res) => {
  const u = loadTarget(req, res);
  if (!u) return;
  if (u.id === req.user.id) { flash(req, 'error', 'You cannot change your own role.'); return res.redirect(back(req, '/admin/users')); }
  const role = u.role === 'admin' ? 'user' : 'admin';
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, u.id);
  flash(req, 'success', `${u.name} is now ${role === 'admin' ? 'an admin' : 'a regular user'}.`);
  res.redirect(back(req, `/admin/users/${u.id}`));
});

router.post('/users/:id/edit', verifyCsrf, (req, res) => {
  const u = loadTarget(req, res);
  if (!u) return;
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const phone = String(req.body.phone || '').replace(/[^\d]/g, '').slice(-10);
  const password = String(req.body.password || '');
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10}$/.test(phone)) {
    flash(req, 'error', 'Please enter a valid name, email and 10-digit phone.');
  } else if (db.prepare('SELECT 1 FROM users WHERE email = ? AND id != ?').get(email, u.id)) {
    flash(req, 'error', 'Another account already uses that email.');
  } else if (password && password.length < 6) {
    flash(req, 'error', 'New password must be at least 6 characters.');
  } else {
    db.prepare('UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?').run(name, email, phone, u.id);
    if (password) db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), u.id);
    flash(req, 'success', 'User details saved.');
  }
  res.redirect(`/admin/users/${u.id}`);
});

router.post('/users/:id/delete', verifyCsrf, (req, res) => {
  const u = loadTarget(req, res);
  if (!u) return;
  if (u.id === req.user.id) { flash(req, 'error', 'You cannot delete yourself.'); return res.redirect('/admin/users'); }
  db.prepare('DELETE FROM users WHERE id = ?').run(u.id);
  flash(req, 'success', `User ${u.name} deleted.`);
  res.redirect('/admin/users');
});

// ---------------- Listings ----------------
router.get('/listings', (req, res) => {
  const term = String(req.query.q || '').trim();
  const status = ['active', 'hidden', 'rented'].includes(req.query.status) ? req.query.status : '';
  const where = [];
  const params = [];
  if (term) { where.push('(title LIKE ? OR locality LIKE ? OR contact_name LIKE ? OR contact_phone LIKE ?)'); params.push(...Array(4).fill(`%${term}%`)); }
  if (status) { where.push('status = ?'); params.push(status); }
  const listings = db.prepare(`SELECT l.*, (SELECT COUNT(*) FROM contact_views c WHERE c.listing_id = l.id) AS unlocks
    FROM listings l ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id DESC LIMIT 300`).all(...params).map(parseImages);
  res.render('admin/listings', { title: 'Listings', listings, q: term, status });
});

function listingForm(body) {
  const int = (v) => (v === '' || v == null ? null : parseInt(v, 10));
  return {
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
  return null;
}

const listingUpload = upload.array('photos', 8);

router.get('/listings/new', (req, res) => {
  res.render('admin/listing-form', { title: 'Add listing', listing: { images: [], status: 'active', contact_role: 'Owner' } });
});

router.post('/listings', listingUpload, verifyCsrf, (req, res) => {
  const f = listingForm(req.body);
  const files = (req.files || []).map((x) => x.filename);
  const error = validateListing(f);
  if (error) {
    files.forEach(removeUpload);
    return res.status(400).render('admin/listing-form', { title: 'Add listing', listing: { ...f, images: [] }, error });
  }
  const r = db.prepare(`INSERT INTO listings (title, description, type, bhk, rent, deposit, locality, address, furnishing,
    tenant_pref, area_sqft, contact_name, contact_phone, contact_role, featured, status, images)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(f.title, f.description, f.type, f.bhk, f.rent, f.deposit, f.locality, f.address, f.furnishing, f.tenant_pref,
      f.area_sqft, f.contact_name, f.contact_phone, f.contact_role, f.featured, f.status, JSON.stringify(files));
  flash(req, 'success', 'Listing published.');
  res.redirect(`/admin/listings/${r.lastInsertRowid}/edit`);
});

router.get('/listings/:id/edit', (req, res) => {
  const listing = parseImages(db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id));
  if (!listing) return res.status(404).render('error', { title: 'Not found', message: 'Listing not found.' });
  res.render('admin/listing-form', { title: 'Edit listing', listing });
});

router.post('/listings/:id', listingUpload, verifyCsrf, (req, res) => {
  const existing = parseImages(db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id));
  const files = (req.files || []).map((x) => x.filename);
  if (!existing) { files.forEach(removeUpload); return res.status(404).render('error', { title: 'Not found', message: 'Listing not found.' }); }
  const f = listingForm(req.body);
  const error = validateListing(f);
  if (error) {
    files.forEach(removeUpload);
    return res.status(400).render('admin/listing-form', { title: 'Edit listing', listing: { ...f, id: existing.id, images: existing.images }, error });
  }
  const remove = [].concat(req.body.remove_images || []);
  const kept = existing.images.filter((img) => !remove.includes(img));
  existing.images.filter((img) => remove.includes(img)).forEach(removeUpload);
  const images = kept.concat(files).slice(0, 12);
  db.prepare(`UPDATE listings SET title = ?, description = ?, type = ?, bhk = ?, rent = ?, deposit = ?, locality = ?, address = ?,
    furnishing = ?, tenant_pref = ?, area_sqft = ?, contact_name = ?, contact_phone = ?, contact_role = ?, featured = ?, status = ?,
    images = ?, updated_at = datetime('now') WHERE id = ?`)
    .run(f.title, f.description, f.type, f.bhk, f.rent, f.deposit, f.locality, f.address, f.furnishing, f.tenant_pref,
      f.area_sqft, f.contact_name, f.contact_phone, f.contact_role, f.featured, f.status, JSON.stringify(images), existing.id);
  flash(req, 'success', 'Listing updated.');
  res.redirect(`/admin/listings/${existing.id}/edit`);
});

router.post('/listings/:id/quick', verifyCsrf, (req, res) => {
  const l = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
  if (!l) return res.status(404).render('error', { title: 'Not found', message: 'Listing not found.' });
  if (req.body.action === 'feature') db.prepare('UPDATE listings SET featured = 1 - featured WHERE id = ?').run(l.id);
  if (['active', 'hidden', 'rented'].includes(req.body.action)) db.prepare("UPDATE listings SET status = ?, updated_at = datetime('now') WHERE id = ?").run(req.body.action, l.id);
  flash(req, 'success', `Listing #${l.id} updated.`);
  res.redirect(back(req, '/admin/listings'));
});

router.post('/listings/:id/delete', verifyCsrf, (req, res) => {
  const l = parseImages(db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id));
  if (l) {
    db.prepare('DELETE FROM listings WHERE id = ?').run(l.id);
    l.images.forEach(removeUpload);
    flash(req, 'success', `Listing “${l.title}” deleted.`);
  }
  res.redirect('/admin/listings');
});

// ---------------- Settings ----------------
router.get('/settings', async (req, res) => {
  const s = getSettings();
  const link = `upi://pay?${new URLSearchParams({ pa: s.upi_id, pn: s.payee_name, am: s.unlock_price, cu: 'INR' })}`;
  const qr = s.qr_image ? `/uploads/${s.qr_image}` : await QRCode.toDataURL(link, { margin: 1, width: 200 });
  res.render('admin/settings', { title: 'Settings', qr });
});

router.post('/settings', upload.single('qr'), verifyCsrf, (req, res) => {
  const s = getSettings();
  const price = parseInt(req.body.unlock_price, 10);
  const days = parseInt(req.body.premium_days, 10);
  const upi = String(req.body.upi_id || '').trim();
  if (!(price > 0 && price <= 10000) || !(days >= 0 && days <= 3650) || !/^[\w.-]+@[\w.-]+$/.test(upi)) {
    if (req.file) removeUpload(req.file.filename);
    flash(req, 'error', 'Check the price (1–10000), validity days (0–3650) and UPI ID (e.g. name@bank).');
    return res.redirect('/admin/settings');
  }
  setSetting('unlock_price', price);
  setSetting('premium_days', days);
  setSetting('upi_id', upi);
  setSetting('payee_name', String(req.body.payee_name || '').trim().slice(0, 60) || s.payee_name);
  setSetting('support_phone', String(req.body.support_phone || '').trim().slice(0, 30));
  setSetting('support_whatsapp', String(req.body.support_whatsapp || '').replace(/\D/g, '').slice(0, 15));
  setSetting('demo_mode', req.body.demo_mode === '1' ? '1' : '0');
  if (req.file) {
    removeUpload(s.qr_image);
    setSetting('qr_image', req.file.filename);
  } else if (req.body.remove_qr === '1') {
    removeUpload(s.qr_image);
    setSetting('qr_image', '');
  }
  flash(req, 'success', 'Settings saved.');
  res.redirect('/admin/settings');
});

router.post('/settings/password', verifyCsrf, (req, res) => {
  const current = String(req.body.current || '');
  const password = String(req.body.password || '');
  if (!bcrypt.compareSync(current, req.user.password_hash)) flash(req, 'error', 'Current password is incorrect.');
  else if (password.length < 8) flash(req, 'error', 'Admin password must be at least 8 characters.');
  else {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), req.user.id);
    flash(req, 'success', 'Admin password changed.');
  }
  res.redirect('/admin/settings');
});

module.exports = router;
