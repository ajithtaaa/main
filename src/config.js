const path = require('node:path');

const root = path.join(__dirname, '..');

module.exports = {
  port: Number(process.env.PORT) || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  dbFile: process.env.DB_FILE || path.join(root, 'data', 'app.db'),
  uploadDir: process.env.UPLOAD_DIR || path.join(root, 'uploads'),
  adminEmail: process.env.ADMIN_EMAIL || 'admin@budgetbrokers.in',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  seedDemo: process.env.SEED_DEMO !== '0',
  maxRent: 10000,
  localities: [
    'Aluva', 'Edappally', 'Elamakkara', 'Ernakulam North', 'Ernakulam South', 'Fort Kochi',
    'Kadavanthra', 'Kakkanad', 'Kalamassery', 'Kaloor', 'Maradu', 'Mattancherry', 'Palarivattom',
    'Panampilly Nagar', 'Thevara', 'Thrippunithura', 'Vyttila',
  ],
  types: ['Apartment', 'House', 'Room', 'PG/Hostel', 'Shop/Office'],
  furnishings: ['Unfurnished', 'Semi-furnished', 'Furnished'],
  tenantPrefs: ['Any', 'Family', 'Bachelors', 'Ladies', 'Commercial'],
};
