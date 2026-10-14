# Putting Budget Brokers online

Two ways to host it:

- **Vercel** (below). Serverless, with no disk of its own, so the database lives on **Turso** and photos on **Vercel Blob**. Both connect from the Vercel dashboard.
- **Railway, Render, Fly.io or a VPS** (further down). Runs the `Dockerfile` and keeps everything on one persistent disk.

## Vercel, step by step

> **Plan note:** Vercel's free *Hobby* plan is for personal, non-commercial use only. A site that takes payments is commercial, so Vercel expects the **Pro** plan (about US$20 a month). Turso's and Vercel Blob's free tiers are enough to start.

1. Sign up at https://vercel.com with your GitHub account.
2. **Add New → Project →** import **`ajithtaaa/main`**. Leave *Framework Preset* on **Other**, and leave the build settings empty. Click **Deploy**. This first deploy shows an error page until steps 3–5 are done; that's expected.
3. **Database:** in the project, open **Storage → Create Database → Turso** (Marketplace) and connect it to this project. That adds `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` automatically.
   *(Or create a database at https://turso.tech yourself and paste those two values in as environment variables.)*
4. **Photos:** **Storage → Create → Blob**, then connect it to this project. That adds `BLOB_READ_WRITE_TOKEN`.
5. **Settings → Environment Variables**, add for *Production*:

   | Name | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `SESSION_SECRET` | a long random string, at least 32 characters (https://www.random.org/strings) |
   | `ADMIN_EMAIL` | your email |
   | `ADMIN_PASSWORD` | a strong password, which becomes your admin login |

6. **Deployments →** the latest one **→ ⋯ → Redeploy.** Open the `….vercel.app` link.
7. Log in with your admin email and password, then go to **Admin → Settings**: enter your real UPI ID or upload your QR, untick **Demo mode**, and add support phone and WhatsApp. Then add your listings under **Admin → Listings**.

**Custom domain:** Project → **Settings → Domains → Add**, then follow the DNS instructions. HTTPS is automatic.

**Updates:** every push to `main` redeploys by itself. Your data is safe in Turso and Blob.

If a page shows *"Something went wrong"*, open the deployment's **Logs**. A missing setting is named there (for example *"On Vercel, set TURSO_DATABASE_URL…"*).

---

## Railway, step by step

1. The code is on GitHub at `ajithtaaa/main`.
2. Sign up at https://railway.com with your GitHub account and choose the Hobby plan.
3. **New Project → Deploy from GitHub repo →** pick `ajithtaaa/main`. Railway finds the `Dockerfile` and builds it.
4. Open the service → **Variables**, and add:

   | Name | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `SESSION_SECRET` | a long random string (64 characters is good). Generate one at https://www.random.org/strings or with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `ADMIN_EMAIL` | your email |
   | `ADMIN_PASSWORD` | a strong password (this becomes your admin login) |
   | `DATA_DIR` | `/data` |

5. Service → **Settings → Volumes → Add volume**, mount path `/data`. **Don't skip this step.**
6. Service → **Settings → Networking → Generate domain.** You get a link like `budget-brokers.up.railway.app`, already on HTTPS.
7. Open the link, log in with your admin email and password, and go to **Admin → Settings**:
   - enter your **real UPI ID** and payee name, or upload your shop's QR image,
   - **untick Demo mode**,
   - set your support phone and WhatsApp number.
8. **Admin → Listings → Add listing** for each real property. The live site starts empty: the sample listings with fake numbers are only loaded on a test copy.

### Your own domain (optional)

Buy a domain (for example `budgetbrokerskochi.in` from GoDaddy, Hostinger or BigRock). In Railway open **Settings → Networking → Custom domain**, type the domain, and add the CNAME record Railway shows you in your domain provider's DNS settings. HTTPS is set up automatically.

## Backups

- **Vercel:** Turso keeps point-in-time backups of the database. Photos are in Vercel Blob.
- **Railway or a VPS:** everything is in the `/data` volume (`data/app.db` and `uploads/`). Railway can snapshot volumes, or download the folder now and then.

## Updating the site

Push new commits to `main`. Vercel or Railway rebuilds by itself, and your data stays where it is.

## Before you take real money

- Test the whole flow once with a real ₹1 payment: temporarily set the price to 1 in Settings, then set it back.
- Check Transaction IDs only against your own bank or UPI statement before approving.
- Add a short privacy policy and terms page if you plan to advertise.
