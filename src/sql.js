const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

/**
 * One async interface over two SQLite backends:
 *  - Turso / libSQL (TURSO_DATABASE_URL set) – used on Vercel, where there is no persistent disk.
 *  - node:sqlite file (default) – local development and hosts with a persistent volume.
 * Both speak the same SQL, so queries are shared.
 */
function libsqlBackend(url) {
  // The /web client is pure HTTP (no native binary), which is what serverless needs.
  // file: URLs (used in tests) need the full client.
  const { createClient } = url.startsWith('file:') ? require('@libsql/client') : require('@libsql/client/web');
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  const toRows = (rs) => rs.rows.map((r) => Object.fromEntries(rs.columns.map((c, i) => [c, r[i]])));
  const args = (params) => params.map((p) => (p === undefined ? null : p));
  return {
    kind: 'libsql',
    async all(sql, ...params) { return toRows(await client.execute({ sql, args: args(params) })); },
    async get(sql, ...params) { return (await this.all(sql, ...params))[0]; },
    async run(sql, ...params) {
      const rs = await client.execute({ sql, args: args(params) });
      return { changes: rs.rowsAffected, lastInsertRowid: Number(rs.lastInsertRowid) };
    },
    async exec(sql) { await client.executeMultiple(sql); },
    /** Run statements atomically: [[sql, ...params], ...] */
    async batch(stmts) { await client.batch(stmts.map(([sql, ...p]) => ({ sql, args: args(p) })), 'write'); },
  };
}

function nodeSqliteBackend(file) {
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  const args = (params) => params.map((p) => (p === undefined ? null : p));
  return {
    kind: 'sqlite',
    async all(sql, ...params) { return db.prepare(sql).all(...args(params)); },
    async get(sql, ...params) { return db.prepare(sql).get(...args(params)); },
    async run(sql, ...params) {
      const r = db.prepare(sql).run(...args(params));
      return { changes: Number(r.changes), lastInsertRowid: Number(r.lastInsertRowid) };
    },
    async exec(sql) { db.exec(sql); },
    async batch(stmts) {
      db.exec('BEGIN');
      try {
        for (const [sql, ...p] of stmts) db.prepare(sql).run(...args(p));
        db.exec('COMMIT');
      } catch (e) { db.exec('ROLLBACK'); throw e; }
    },
  };
}

module.exports = process.env.TURSO_DATABASE_URL
  ? libsqlBackend(process.env.TURSO_DATABASE_URL)
  : nodeSqliteBackend(config.dbFile);
