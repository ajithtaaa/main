const express = require('express');
const QRCode = require('qrcode');
const { db, SOLD_SQL, parseImages, hasUnlocked } = require('../db');
const storage = require('../storage');
const { flash, verifyCsrf, requireLogin, rateLimit } = require('../middleware');

const router = express.Router();
const submitLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 15, key: 'utr' });

function upiLink(s, listing) {
  const params = new URLSearchParams({
    pa: s.upi_id, pn: s.payee_name, am: String(s.unlock_price), cu: 'INR', tn: `Budget Brokers unlock #${listing.id}`,
  });
  return `upi://pay?${params.toString()}`;
}

async function loadListing(req, res) {
  const listing = parseImages(await db.get(`SELECT id, title, type, bhk, rent, locality, contact_role, images, status, sell_by,
    ${SOLD_SQL} AS sold_out FROM listings WHERE id = ? AND status != 'hidden'`, parseInt(req.params.id, 10)));
  if (!listing) {
    res.status(404).render('error', { title: 'Not found', message: 'This property is no longer available.' });
    return null;
  }
  // No payments for sold-out properties.
  if (listing.sold_out) {
    res.status(410).render('sold', { title: 'Sold out', listing, similar: [] });
    return null;
  }
  return listing;
}

// Old links without a property go to the listings page.
router.get('/unlock', (req, res) => {
  const m = /^\/property\/(\d+)$/.exec(String(req.query.next || ''));
  res.redirect(m ? `/unlock/${m[1]}` : '/properties');
});

router.get('/unlock/:id', requireLogin, async (req, res) => {
  const listing = await loadListing(req, res);
  if (!listing) return;
  if (await hasUnlocked(req.user, listing.id)) return res.redirect(`/property/${listing.id}`);
  const s = res.locals.settings;
  const pending = await db.get("SELECT * FROM payments WHERE user_id = ? AND listing_id = ? AND status = 'pending' ORDER BY id DESC LIMIT 1", req.user.id, listing.id);
  const last = await db.get('SELECT * FROM payments WHERE user_id = ? AND listing_id = ? ORDER BY id DESC LIMIT 1', req.user.id, listing.id);
  const link = upiLink(s, listing);
  const qr = s.qr_image
    ? storage.url(s.qr_image)
    : await QRCode.toDataURL(link, { margin: 1, width: 280, color: { dark: '#0b3d2e', light: '#ffffff' } });
  res.render('unlock', {
    title: `Unlock contact for ₹${s.unlock_price}`,
    listing, qr, link, pending,
    rejected: last && last.status === 'rejected' ? last : null,
  });
});

// Download the payment QR as an image file (so users can pay from the gallery in their UPI app).
router.get('/unlock/:id/qr', requireLogin, async (req, res) => {
  const listing = await loadListing(req, res);
  if (!listing) return;
  const s = res.locals.settings;
  res.set('Content-Disposition', 'attachment; filename="budget-brokers-upi-qr.png"');
  if (s.qr_image) {
    const r = await fetch(new URL(storage.url(s.qr_image), `${req.protocol}://${req.get('host')}`));
    if (r.ok) return res.type(r.headers.get('content-type') || 'image/png').send(Buffer.from(await r.arrayBuffer()));
  }
  const png = await QRCode.toBuffer(upiLink(s, listing), { margin: 2, width: 600, color: { dark: '#0b3d2e', light: '#ffffff' } });
  res.type('image/png').send(png);
});

router.post('/unlock/:id', requireLogin, submitLimiter, verifyCsrf, async (req, res) => {
  const listing = await loadListing(req, res);
  if (!listing) return;
  const s = res.locals.settings;
  // UPI apps show this as "UTR", "UPI Ref No." or "Transaction ID" (GPay 12 digits, PhonePe/Paytm longer and alphanumeric).
  const utr = String(req.body.utr || '').replace(/\s+/g, '').toUpperCase();
  const back = `/unlock/${listing.id}`;

  if (await hasUnlocked(req.user, listing.id)) {
    flash(req, 'info', 'You have already unlocked this contact.');
    return res.redirect(`/property/${listing.id}`);
  }
  if (await db.get("SELECT 1 AS ok FROM payments WHERE user_id = ? AND listing_id = ? AND status = 'pending'", req.user.id, listing.id)) {
    flash(req, 'info', 'Your payment for this property is already under verification.');
    return res.redirect(back);
  }
  if (!/^[A-Z0-9]{10,35}$/.test(utr)) {
    flash(req, 'error', 'Please enter the full Transaction ID from your payment app (10–35 letters or numbers, no spaces).');
    return res.redirect(back);
  }
  if (await db.get('SELECT 1 AS ok FROM payments WHERE utr = ?', utr)) {
    flash(req, 'error', 'This Transaction ID has already been used. Each property needs a separate payment.');
    return res.redirect(back);
  }
  await db.run('INSERT INTO payments (user_id, listing_id, amount, utr) VALUES (?, ?, ?, ?)', req.user.id, listing.id, Number(s.unlock_price), utr);
  flash(req, 'success', 'Thank you! Your Transaction ID has been submitted. This contact will unlock as soon as our team verifies the payment.');
  res.redirect(back);
});

module.exports = router;
