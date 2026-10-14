# Putting Budget Brokers online

The site is a Node.js server with a SQLite database and uploaded photos. It needs a host that:

- runs Node.js 22 or Docker, and
- has a **persistent disk** (otherwise every restart wipes your users, payments and listings).

Recommended: **Railway** (about US$5 a month, deploys straight from GitHub, includes HTTPS). Render (paid plan with a disk), Fly.io, or any VPS with Docker also work, because the repo has a `Dockerfile`.

## Railway, step by step

1. Make sure the code is on GitHub (repo `ajithta855-boop/Web`). Merge the `claude/kerala-realestate-site-pylbw5` branch into `main`, or pick that branch in step 3.
2. Sign up at https://railway.com with your GitHub account and choose the Hobby plan.
3. **New Project → Deploy from GitHub repo →** pick `Web`. Railway finds the `Dockerfile` and builds it.
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

Everything is in the `/data` volume (`data/app.db` and `uploads/`). Railway can snapshot volumes. You can also download the folder now and then.

## Updating the site

Push new commits to the branch Railway deploys from. It rebuilds and restarts by itself, and your data stays on the volume.

## Before you take real money

- Test the whole flow once with a real ₹1 payment: temporarily set the price to 1 in Settings, then set it back.
- Check UTRs only against your own bank or UPI statement before approving.
- Add a short privacy policy and terms page if you plan to advertise.
