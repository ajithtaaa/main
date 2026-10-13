const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../db');
const { flash, verifyCsrf, requireLogin, rateLimit } = require('../middleware');

const router = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, key: 'auth' });

function safeNext(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

router.get('/login', (req, res) => {
  if (req.user) return res.redirect(safeNext(req.query.next));
  res.render('login', { title: 'Log in', next: safeNext(req.query.next), form: {} });
});

router.post('/login', authLimiter, verifyCsrf, (req, res) => {
  const email = String(req.body.email || '').trim();
  const password = String(req.body.password || '');
  const next = safeNext(req.body.next);
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(400).render('login', { title: 'Log in', next, form: { email }, error: 'Incorrect email or password.' });
  }
  if (user.status === 'blocked') {
    return res.status(403).render('login', { title: 'Log in', next, form: { email }, error: 'This account is blocked. Contact support.' });
  }
  req.session.userId = user.id;
  flash(req, 'success', `Welcome back, ${user.name}!`);
  res.redirect(user.role === 'admin' && next === '/' ? '/admin' : next);
});

router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('register', { title: 'Create account', next: safeNext(req.query.next), form: {} });
});

router.post('/register', authLimiter, verifyCsrf, (req, res) => {
  const form = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim().toLowerCase(),
    phone: String(req.body.phone || '').replace(/[^\d]/g, ''),
  };
  const password = String(req.body.password || '');
  const next = safeNext(req.body.next);
  let error = null;
  if (form.name.length < 2) error = 'Please enter your name.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) error = 'Please enter a valid email.';
  else if (!/^(91)?[6-9]\d{9}$/.test(form.phone)) error = 'Please enter a valid 10-digit Indian mobile number.';
  else if (password.length < 6) error = 'Password must be at least 6 characters.';
  else if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(form.email)) error = 'An account with this email already exists.';
  if (error) return res.status(400).render('register', { title: 'Create account', next, form, error });

  const phone = form.phone.slice(-10);
  const result = db.prepare('INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)')
    .run(form.name, form.email, phone, bcrypt.hashSync(password, 10));
  req.session.userId = Number(result.lastInsertRowid);
  flash(req, 'success', 'Account created! You can now unlock any owner or broker contact.');
  res.redirect(next);
});

router.post('/logout', verifyCsrf, (req, res) => {
  req.session = null;
  res.redirect('/');
});

router.get('/account', requireLogin, (req, res) => {
  const payments = db.prepare(`SELECT p.*, l.title AS listing_title FROM payments p LEFT JOIN listings l ON l.id = p.listing_id
    WHERE p.user_id = ? ORDER BY p.id DESC`).all(req.user.id);
  const unlockedList = db.prepare(`SELECT l.id, l.title, l.locality, l.rent, l.contact_name, l.contact_phone, l.contact_role, l.status, u.created_at
    FROM unlocks u JOIN listings l ON l.id = u.listing_id WHERE u.user_id = ? ORDER BY u.created_at DESC`).all(req.user.id);
  res.render('account', { title: 'My account', payments, unlockedList });
});

router.post('/account/password', requireLogin, verifyCsrf, (req, res) => {
  const current = String(req.body.current || '');
  const password = String(req.body.password || '');
  if (!bcrypt.compareSync(current, req.user.password_hash)) flash(req, 'error', 'Current password is incorrect.');
  else if (password.length < 6) flash(req, 'error', 'New password must be at least 6 characters.');
  else {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(password, 10), req.user.id);
    flash(req, 'success', 'Password updated.');
  }
  res.redirect('/account');
});

module.exports = router;
