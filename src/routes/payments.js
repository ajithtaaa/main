const express = require('express');
const QRCode = require('qrcode');
const { db, getSettings, parseImages, hasUnlocked } = require('../db');
const { flash, verifyCsrf, requireLogin, rateLimit } = require('../middleware');

const router = express.Router();
const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, key: 'utr' });

function upiLink(s, listing) {
  const params = new URLSearchParams({
    pa: s.upi_id, pn: s.payee_name, am: String(s.unlock_price), cu: 'INR', tn: `Budget Brokers unlock #${listing.id}`,
  });
  return `upi://pay?${params.toString()}`;
}

function loadListing(req, res) {
  const listing = parseImages(db.prepare("SELECT id, title, type, bhk, rent, locality, contact_role, images, status FROM listings WHERE id = ? AND status != 'hidden'").get(parseInt(req.params.id, 10)));
  if (!listing) res.status(404).render('error', { title: 'Not found', message: 'This property is no longer available.' });
  return listing;
}

// Old links without a property go to the listings page.
router.get('/unlock', (req, res) => {
  const m = /^\/property\/(\d+)$/.exec(String(req.query.next || ''));
  res.redirect(m ? `/unlock/${m[1]}` : '/properties');
});

router.get('/unlock/:id', requireLogin, async (req, res) => {
  const listing = loadListing(req, res);
  if (!listing) return;
  if (hasUnlocked(req.user, listing.id)) return res.redirect(`/property/${listing.id}`);
  const s = getSettings();
  const pending = db.prepare("SELECT * FROM payments WHERE user_id = ? AND listing_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1").get(req.user.id, listing.id);
  const last = db.prepare('SELECT * FROM payments WHERE user_id = ? AND listing_id = ? ORDER BY id DESC LIMIT 1').get(req.user.id, listing.id);
  const link = upiLink(s, listing);
  const qr = s.qr_image
    ? `/uploads/${s.qr_image}`
    : await QRCode.toDataURL(link, { margin: 1, width: 280, color: { dark: '#0b3d2e', light: '#ffffff' } });
  res.render('unlock', {
    title: `Unlock contact for ₹${s.unlock_price}`,
    listing, qr, link, pending,
    rejected: last && last.status === 'rejected' ? last : null,
  });
});

router.post('/unlock/:id', requireLogin, submitLimiter, verifyCsrf, (req, res) => {
  const listing = loadListing(req, res);
  if (!listing) return;
  const s = getSettings();
  const utr = String(req.body.utr || '').replace(/\s+/g, '');
  const back = `/unlock/${listing.id}`;

  if (hasUnlocked(req.user, listing.id)) {
    flash(req, 'info', 'You have already unlocked this contact.');
    return res.redirect(`/property/${listing.id}`);
  }
  if (db.prepare("SELECT 1 FROM payments WHERE user_id = ? AND listing_id = ? AND status = 'pending'").get(req.user.id, listing.id)) {
    flash(req, 'info', 'Your payment for this property is already under verification.');
    return res.redirect(back);
  }
  if (!/^\d{12}$/.test(utr)) {
    flash(req, 'error', 'Please enter the full 12-digit UTR / UPI reference number from your payment app.');
    return res.redirect(back);
  }
  if (db.prepare('SELECT 1 FROM payments WHERE utr = ?').get(utr)) {
    flash(req, 'error', 'This UTR number has already been used. Each property needs a separate payment.');
    return res.redirect(back);
  }
  db.prepare('INSERT INTO payments (user_id, listing_id, amount, utr) VALUES (?, ?, ?, ?)').run(req.user.id, listing.id, Number(s.unlock_price), utr);
  flash(req, 'success', 'Thank you! Your UTR has been submitted. This contact will unlock as soon as our team verifies the payment.');
  res.redirect(back);
});

module.exports = router;
