# Budget Brokers – Kochi rentals under ₹10,000

A rental listing site for Kochi. Anyone can browse every property. To see the **owner's or broker's phone number for a property**, a user pays **₹99 for that property** by UPI and submits the 12-digit **UTR** number. An admin checks the payment by hand and approves it, and that one contact unlocks for the user. It stays unlocked in their account with no expiry. Each property is paid for separately.

## Features

**Visitors and users**
- Home page with search by locality, type and budget. Featured and newest listings.
- Property list with filters (locality, type, max rent, owner/broker, tenant type), sorting and pages.
- Property page with a photo gallery and key details. The contact box is **locked**: the phone number is never sent to the browser until the user is unlocked.
- Payment page (`/unlock/<property id>`): a summary of the property, a UPI QR (auto-generated **demo** QR, or upload your own), UPI ID with a copy button, and an "Open UPI app" button on mobile. The UTR form accepts only 12 digits. A UTR can't be reused. A user can have pending payments for several properties at once, but only one per property.
- Statuses shown on each property: *Under verification* → *Unlocked*, or *Rejected* with the admin's reason. Listing cards show 🔓 for properties the user has already unlocked.
- My account: every unlocked contact with its phone number, payment history for each property, and password change.

**Admin panel (`/admin`)**
- **Dashboard**: pending payments, users, listings, revenue (last 30 days and total), contacts unlocked.
- **Payments**: pending, approved and rejected tabs. Each row shows which property was paid for. Search by UTR, name, phone or property. Approve with one click (unlocks that property for the user), or reject with a reason the user sees.
- **Users**: search and filter. Unlock a particular property for a user by hand (for example after a cash payment), or remove an unlock. Optional **all-access upgrade** (N days or lifetime) shows every contact. Also block or unblock, make or remove admin, edit details, reset password, delete, and add a user by hand. Each user's page lists their payments and unlocked properties.
- **Listings**: add, edit or delete. Up to 8 photos per listing. Rent is capped at ₹10,000. Mark a listing active, hidden or rented, or feature it. Each listing shows its views and unlock counts.
- **Settings**: unlock price per property, default length of an all-access upgrade, UPI ID, payee name, your own QR image, the demo-mode banner, support phone and WhatsApp, and the admin password.

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
