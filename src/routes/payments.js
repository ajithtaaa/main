const express = require('express');
const QRCode = require('qrcode');
const { db, getSettings } = require('../db');
const { flash, verifyCsrf, requireLogin, rateLimit } = require('../middleware');

const router = express.Router();
const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10, key: 'utr' });

function safeNext(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/properties';
}

function upiLink(s) {
  const params = new URLSearchParams({
    pa: s.upi_id, pn: s.payee_name, am: String(s.unlock_price), cu: 'INR', tn: 'Budget Brokers contact unlock',
  });
  return `upi://pay?${params.toString()}`;
}

router.get('/unlock', requireLogin, async (req, res) => {
  const s = getSettings();
  const next = safeNext(req.query.next);
  const pending = db.prepare("SELECT * FROM payments WHERE user_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1").get(req.user.id);
  const lastRejected = db.prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 1").get(req.user.id);
  const link = upiLink(s);
  const qr = s.qr_image
    ? `/uploads/${s.qr_image}`
    : await QRCode.toDataURL(link, { margin: 1, width: 280, color: { dark: '#0b3d2e', light: '#ffffff' } });
  res.render('unlock', {
    title: `Unlock contacts for ₹${s.unlock_price}`,
    qr, link, next, pending,
    rejected: lastRejected && lastRejected.status === 'rejected' ? lastRejected : null,
    form: {},
  });
});

router.post('/unlock', requireLogin, submitLimiter, verifyCsrf, async (req, res) => {
  const s = getSettings();
  const next = safeNext(req.body.next);
  const utr = String(req.body.utr || '').replace(/\s+/g, '');
  const back = `/unlock?next=${encodeURIComponent(next)}`;

  if (res.locals.premium) {
    flash(req, 'info', 'Your account is already unlocked.');
    return res.redirect(next);
  }
  if (db.prepare("SELECT 1 FROM payments WHERE user_id = ? AND status = 'pending'").get(req.user.id)) {
    flash(req, 'info', 'You already have a payment under verification. Please wait for admin approval.');
    return res.redirect(back);
  }
  if (!/^\d{12}$/.test(utr)) {
    flash(req, 'error', 'Please enter the full 12-digit UTR / UPI reference number from your payment app.');
    return res.redirect(back);
  }
  if (db.prepare('SELECT 1 FROM payments WHERE utr = ?').get(utr)) {
    flash(req, 'error', 'This UTR number has already been submitted. Please check and enter the correct number.');
    return res.redirect(back);
  }
  db.prepare('INSERT INTO payments (user_id, amount, utr) VALUES (?, ?, ?)').run(req.user.id, Number(s.unlock_price), utr);
  flash(req, 'success', 'Thank you! Your UTR has been submitted. Contacts will unlock as soon as our team verifies the payment.');
  res.redirect(back);
});

module.exports = router;
