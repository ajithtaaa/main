const { db } = require('./db');

// Tables in dependency order (parents first). Restoring deletes in reverse order, then inserts in this order.
const TABLES = ['settings', 'users', 'listings', 'payments', 'unlocks'];
const FORMAT = 'budget-brokers-backup';

async function exportAll() {
  const tables = {};
  for (const t of TABLES) tables[t] = await db.all(`SELECT * FROM ${t}`);
  return { format: FORMAT, version: 1, created_at: new Date().toISOString(), tables };
}

/** Replace every table with the backup's rows, atomically. Throws with a readable message on bad input. */
async function restoreAll(backup) {
  if (!backup || backup.format !== FORMAT || !backup.tables) throw new Error('This file is not a Budget Brokers backup.');
  if (!Array.isArray(backup.tables.users) || !backup.tables.users.some((u) => u.role === 'admin')) {
    throw new Error('The backup has no admin account, so restoring it would lock you out. Nothing was changed.');
  }
  const stmts = [...TABLES].reverse().map((t) => [`DELETE FROM ${t}`]);
  for (const t of TABLES) {
    const known = new Set((await db.all(`PRAGMA table_info(${t})`)).map((c) => c.name));
    for (const row of backup.tables[t] || []) {
      const cols = Object.keys(row).filter((c) => known.has(c));
      if (!cols.length) continue;
      stmts.push([`INSERT INTO ${t} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`, ...cols.map((c) => row[c])]);
    }
  }
  await db.batch(stmts);
  const counts = {};
  for (const t of TABLES) counts[t] = (backup.tables[t] || []).length;
  return counts;
}

module.exports = { exportAll, restoreAll };
