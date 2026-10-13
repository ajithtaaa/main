# Budget Brokers – Kochi rentals under ₹10,000

A rental listing site for Kochi. Anyone can browse every property. To see an **owner's or broker's phone number**, a user pays **₹99** by UPI and submits the 12-digit **UTR** number. An admin checks the payment by hand and approves it, and that unlocks every contact for that user.

## Features

**Visitors and users**
- Home page with search by locality, type and budget. Featured and newest listings.
- Property list with filters (locality, type, max rent, owner/broker, tenant type), sorting and pages.
- Property page with a photo gallery and key details. The contact box is **locked**: the phone number is never sent to the browser until the user is unlocked.
- Payment page: UPI QR (auto-generated **demo** QR, or upload your own), UPI ID with a copy button, and an "Open UPI app" button on mobile. The UTR form accepts only 12 digits. A UTR can't be reused, and a user can have only one pending request at a time.
- Statuses shown to the user: *Under verification* → *Unlocked*, or *Rejected* with the admin's reason.
- My account: current plan and expiry, payment history, a list of contacts already unlocked, and password change.

**Admin panel (`/admin`)**
- **Dashboard**: pending payments, users, active premium users, listings, revenue (last 30 days and total), contacts unlocked.
- **Payments**: pending, approved and rejected tabs, search by UTR, name or phone. Approve with one click (unlocks the user), or reject with a reason the user sees.
- **Users**: search and filter (premium, free, blocked, admin). Upgrade for N days or lifetime, extend, downgrade, block or unblock, make or remove admin, edit details, reset password, delete, add a user by hand. Each user's page shows their payments and the contacts they viewed.
- **Listings**: add, edit or delete. Up to 8 photos per listing. Rent is capped at ₹10,000. Mark a listing active, hidden or rented, or feature it. Each listing shows its views and unlock counts.
- **Settings**: unlock price, how many days premium lasts (0 = lifetime), UPI ID, payee name, your own QR image, the demo-mode banner, support phone and WhatsApp, and the admin password.

## Run it

Requires **Node.js 22.13+** (uses the built-in `node:sqlite`, so there's nothing native to compile).

```bash
npm install
npm start          # http://localhost:3000
npm test           # end-to-end tests of the paywall and admin flows
```

Default admin login: `admin@budgetbrokers.in` / `admin123`. **Change it** (set env vars before the first run, or use Admin → Settings).

| Env var | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | HTTP port |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | see above | First admin account (created on first run only) |
| `SESSION_SECRET` | dev value | **Set a long random string in production** |
| `DB_FILE` | `data/app.db` | SQLite database file |
| `UPLOAD_DIR` | `uploads/` | Listing photos and QR image |
| `SEED_DEMO` | `1` | Set `0` to skip the 12 demo Kochi listings |
| `NODE_ENV` | – | Set `production` behind HTTPS to send secure cookies |

## Going live

1. Admin → Settings: enter your real UPI ID and payee name, or upload your shop's QR. Turn off **Demo mode**.
2. Set `SESSION_SECRET`, `ADMIN_PASSWORD` and `NODE_ENV=production`, and serve over HTTPS.
3. Back up `data/` and `uploads/`.

## Tech

Express 5, EJS templates, SQLite (`node:sqlite`), cookie sessions, bcrypt passwords, CSRF tokens on every form, rate limits on login and UTR submission, Multer for image uploads, and `qrcode` for the UPI QR.
