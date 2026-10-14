const express = require('express');
const config = require('../config');
const { db, SOLD_SQL, parseImages, hasUnlocked } = require('../db');

const router = express.Router();
const PAGE_SIZE = 12;

// Columns safe to send to every visitor (never the contact phone).
const PUBLIC_COLS = `id, title, description, type, bhk, rent, deposit, locality, furnishing, tenant_pref,
  area_sqft, contact_role, images, featured, status, views, created_at, sell_by, ${SOLD_SQL} AS sold_out`;
// Open (not sold out, not hidden) listings.
const OPEN = `status = 'active' AND NOT ${SOLD_SQL}`;

function buildFilter(q) {
  // Sold-out listings stay visible (with a tag) until the admin hides or deletes them.
  const where = ["status != 'hidden'"];
  const params = [];
  if (q.locality && config.localities.includes(q.locality)) { where.push('locality = ?'); params.push(q.locality); }
  if (q.type && config.types.includes(q.type)) { where.push('type = ?'); params.push(q.type); }
  if (q.tenant && config.tenantPrefs.includes(q.tenant)) { where.push('tenant_pref = ?'); params.push(q.tenant); }
  if (q.role === 'Owner' || q.role === 'Broker') { where.push('contact_role = ?'); params.push(q.role); }
  const max = parseInt(q.max, 10);
  if (max > 0 && max <= config.maxRent) { where.push('rent <= ?'); params.push(max); }
  const term = String(q.q || '').trim().slice(0, 60);
  if (term) {
    where.push('(title LIKE ? OR description LIKE ? OR locality LIKE ?)');
    params.push(`%${term}%`, `%${term}%`, `%${term}%`);
  }
  return { sql: where.join(' AND '), params };
}

const SORTS = { new: 'created_at DESC, id DESC', low: 'rent ASC', high: 'rent DESC', popular: 'views DESC' };

router.get('/', async (req, res) => {
  const featured = (await db.all(`SELECT ${PUBLIC_COLS} FROM listings WHERE ${OPEN} AND featured = 1 ORDER BY id DESC LIMIT 6`)).map(parseImages);
  const latest = (await db.all(`SELECT ${PUBLIC_COLS} FROM listings WHERE status != 'hidden'
    ORDER BY sold_out ASC, created_at DESC, id DESC LIMIT 8`)).map(parseImages);
  const stats = await db.get(`SELECT COUNT(*) AS listings, COUNT(DISTINCT locality) AS localities, COALESCE(MIN(rent), 0) AS minRent
    FROM listings WHERE ${OPEN}`);
  res.render('home', { title: 'Budget rentals in Kochi below ₹10,000', featured, latest, stats });
});

router.get('/properties', async (req, res) => {
  const { sql, params } = buildFilter(req.query);
  const sort = SORTS[req.query.sort] ? req.query.sort : 'new';
  const total = (await db.get(`SELECT COUNT(*) AS n FROM listings WHERE ${sql}`, ...params)).n;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, parseInt(req.query.page, 10) || 1));
  const listings = (await db.all(`SELECT ${PUBLIC_COLS} FROM listings WHERE ${sql} ORDER BY sold_out ASC, featured DESC, ${SORTS[sort]} LIMIT ? OFFSET ?`, ...params, PAGE_SIZE, (page - 1) * PAGE_SIZE)).map(parseImages);
  const query = { ...req.query };
  delete query.page;
  res.render('properties', { title: 'Properties in Kochi', listings, total, page, pages, q: req.query, sort, query: new URLSearchParams(query).toString() });
});

router.get('/property/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const listing = parseImages(await db.get(`SELECT *, ${SOLD_SQL} AS sold_out FROM listings WHERE id = ?`, id));
  const isAdmin = req.user && req.user.role === 'admin';
  if (!listing || (listing.status === 'hidden' && !isAdmin)) {
    return res.status(404).render('error', { title: 'Not found', message: 'This property is no longer available.' });
  }
  const similarSql = `SELECT ${PUBLIC_COLS} FROM listings WHERE ${OPEN} AND id != ? AND (locality = ? OR type = ?)
    ORDER BY (locality = ?) DESC, created_at DESC LIMIT 4`;
  if (listing.sold_out && !isAdmin) {
    const similar = (await db.all(similarSql, id, listing.locality, listing.type, listing.locality)).map(parseImages);
    return res.status(410).render('sold', { title: 'Sold out', listing: { title: listing.title, locality: listing.locality, type: listing.type }, similar });
  }
  await db.run('UPDATE listings SET views = views + 1 WHERE id = ?', id);

  let contact = null;
  let pending = null;
  let rejected = null;
  if (await hasUnlocked(req.user, id)) {
    contact = { name: listing.contact_name, phone: listing.contact_phone, role: listing.contact_role };
  } else if (req.user) {
    const last = await db.get('SELECT * FROM payments WHERE user_id = ? AND listing_id = ? ORDER BY id DESC LIMIT 1', req.user.id, id);
    if (last && last.status === 'pending') pending = last;
    if (last && last.status === 'rejected') rejected = last;
  }
  // Never hand the phone to the template unless unlocked.
  delete listing.contact_phone;
  if (!contact) delete listing.contact_name;

  const similar = (await db.all(similarSql, id, listing.locality, listing.type, listing.locality)).map(parseImages);
  res.render('property', { title: listing.title, listing, contact, pending, rejected, similar });
});

router.get('/how-it-works', (req, res) => res.render('how', { title: 'How it works' }));

module.exports = router;
