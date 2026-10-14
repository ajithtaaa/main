const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-test-'));
process.env.DB_FILE = path.join(tmp, 'test.db');
// TEST_LIBSQL=1 runs the same tests through the libSQL (Turso) client against a local file.
if (process.env.TEST_LIBSQL) process.env.TURSO_DATABASE_URL = 'file:' + path.join(tmp, 'libsql.db');
process.env.UPLOAD_DIR = path.join(tmp, 'uploads');
process.env.ADMIN_EMAIL = 'admin@test.in';
process.env.ADMIN_PASSWORD = 'admin-pass-123';

const app = require('../server');
let server;
let base;

before(async () => {
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

/** Minimal cookie-jar browser. */
function client() {
  const jar = new Map();
  async function req(url, opts = {}) {
    const headers = { ...(opts.headers || {}) };
    if (jar.size) headers.cookie = [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
    const res = await fetch(base + url, { ...opts, headers, redirect: 'manual' });
    for (const c of res.headers.getSetCookie()) {
      const [pair] = c.split(';');
      const i = pair.indexOf('=');
      jar.set(pair.slice(0, i), pair.slice(i + 1));
    }
    return res;
  }
  async function get(url) { const r = await req(url); return { status: r.status, location: r.headers.get('location'), html: await r.text() }; }
  async function csrf() { const { html } = await get('/how-it-works'); return html.match(/name="csrf-token" content="([^"]+)"/)[1]; }
  async function post(url, data) {
    const body = new URLSearchParams({ _csrf: await csrf(), ...data });
    const r = await req(url, { method: 'POST', body, headers: { 'content-type': 'application/x-www-form-urlencoded' } });
    return { status: r.status, location: r.headers.get('location'), html: await r.text() };
  }
  return { get, post, req };
}

const PHONE = '9000000001'; // seeded listing #1 contact

test('public pages never leak contact numbers', async () => {
  const c = client();
  for (const url of ['/', '/properties', '/property/1']) {
    const r = await c.get(url);
    assert.equal(r.status, 200);
    assert.ok(!r.html.includes(PHONE), `${url} leaked phone`);
  }
});

test('per-property paywall: pay for one property → admin approves → only that contact unlocks', async () => {
  const user = client();
  let r = await user.post('/register', { name: 'Test User', email: 'u1@test.in', phone: '9876543210', password: 'secret1' });
  assert.equal(r.status, 302);

  r = await user.get('/property/1');
  assert.ok(!r.html.includes(PHONE));
  assert.match(r.html, /Unlock for ₹99/);
  assert.match(r.html, /href="\/unlock\/1"/);

  r = await user.get('/unlock/1');
  assert.match(r.html, /data:image\/png;base64/); // demo QR rendered
  assert.match(r.html, /1BHK near Infopark/); // property summary shown

  // invalid UTR rejected
  await user.post('/unlock/1', { utr: '12345' });
  r = await user.get('/unlock/1');
  assert.match(r.html, /12-digit UTR/);

  // valid UTR goes to pending
  await user.post('/unlock/1', { utr: '412345678901' });
  r = await user.get('/property/1');
  assert.match(r.html, /Payment under verification/);
  assert.ok(!r.html.includes(PHONE));

  // a second property can be paid for in parallel; same UTR can't be reused
  await user.post('/unlock/2', { utr: '412345678901' });
  r = await user.get('/unlock/2');
  assert.match(r.html, /already been used/);
  await user.post('/unlock/2', { utr: '412345678902' });

  // user cannot access admin
  r = await user.get('/admin');
  assert.equal(r.status, 403);

  // admin approves only the payment for property 1
  const admin = client();
  r = await admin.post('/login', { email: 'admin@test.in', password: 'admin-pass-123' });
  assert.equal(r.location, '/admin');
  r = await admin.get('/admin/payments?q=412345678901');
  assert.match(r.html, /1BHK near Infopark/); // property shown to admin
  const id = r.html.match(/\/admin\/payments\/(\d+)\/approve/)[1];
  r = await admin.post(`/admin/payments/${id}/approve`, {});
  assert.equal(r.status, 302);

  r = await user.get('/property/1');
  assert.ok(r.html.includes(PHONE), 'phone visible after approval');
  r = await user.get('/property/2');
  assert.ok(!r.html.includes('9000000002'), 'other property stays locked');
  assert.match(r.html, /Payment under verification/);
  r = await user.get('/account');
  assert.ok(r.html.includes(PHONE));
  r = await user.get('/unlock/1');
  assert.equal(r.location, '/property/1');
});

test('admin can reject, grant unlocks, give all-access, block users and manage listings', async () => {
  const admin = client();
  await admin.post('/login', { email: 'admin@test.in', password: 'admin-pass-123' });

  const u = client();
  await u.post('/register', { name: 'Rej User', email: 'u3@test.in', phone: '9876543212', password: 'secret1' });
  await u.post('/unlock/3', { utr: '512345678901' });
  let r = await admin.get('/admin/payments?q=512345678901');
  const pid = r.html.match(/\/admin\/payments\/(\d+)\/reject/)[1];
  await admin.post(`/admin/payments/${pid}/reject`, { note: 'Amount not received' });
  r = await u.get('/unlock/3');
  assert.match(r.html, /Amount not received/);

  r = await admin.get('/admin/users?q=u3@test.in');
  const uid = r.html.match(/\/admin\/users\/(\d+)"/)[1];

  // manual per-property unlock, then remove it
  await admin.post(`/admin/users/${uid}/unlocks`, { listing_id: '1' });
  r = await u.get('/property/1');
  assert.ok(r.html.includes(PHONE));
  await admin.post(`/admin/users/${uid}/unlocks/1/delete`, {});
  r = await u.get('/property/1');
  assert.ok(!r.html.includes(PHONE));

  // all-access upgrade then removal
  await admin.post(`/admin/users/${uid}/upgrade`, { days: '7' });
  r = await u.get('/property/5');
  assert.ok(r.html.includes('9000000005'));
  await admin.post(`/admin/users/${uid}/downgrade`, {});
  r = await u.get('/property/5');
  assert.ok(!r.html.includes('9000000005'));

  // block logs the user out
  await admin.post(`/admin/users/${uid}/status`, {});
  r = await u.get('/account');
  assert.equal(r.status, 302);

  // listing CRUD with rent cap
  r = await admin.post('/admin/listings', { title: 'Too pricey', type: 'Room', rent: '15000', locality: 'Kaloor', contact_name: 'X Y', contact_phone: '9000000099' });
  assert.equal(r.status, 400);
  r = await admin.post('/admin/listings', { title: 'Test room', type: 'Room', rent: '5000', locality: 'Kaloor', contact_name: 'X Y', contact_phone: '9000000099' });
  assert.equal(r.status, 302);
  const lid = r.location.match(/listings\/(\d+)/)[1];
  r = await client().get(`/property/${lid}`);
  assert.match(r.html, /Test room/);
  await admin.post(`/admin/listings/${lid}/quick`, { action: 'hidden' });
  r = await client().get(`/property/${lid}`);
  assert.equal(r.status, 404);
  await admin.post(`/admin/listings/${lid}/delete`, {});
});

test('POST without CSRF token is rejected', async () => {
  const c = client();
  const r = await c.req('/login', { method: 'POST', body: new URLSearchParams({ email: 'a', password: 'b' }), headers: { 'content-type': 'application/x-www-form-urlencoded' } });
  assert.equal(r.status, 403);
});
