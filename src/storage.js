const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');
const config = require('./config');

/**
 * Uploaded photos and QR images. With BLOB_READ_WRITE_TOKEN set (Vercel Blob) files go to
 * blob storage and are stored as full https URLs; otherwise they are written to UPLOAD_DIR and
 * stored as bare filenames served from /uploads.
 */
const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };
const useBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

function newName(mimetype) {
  return `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${EXT[mimetype] || '.jpg'}`;
}

/** Save a multer memory-storage file; returns the reference to store in the database. */
async function save(file) {
  const name = newName(file.mimetype);
  if (useBlob) {
    const { put } = require('@vercel/blob');
    const blob = await put(`uploads/${name}`, file.buffer, { access: 'public', contentType: file.mimetype });
    return blob.url;
  }
  await fs.mkdir(config.uploadDir, { recursive: true });
  await fs.writeFile(path.join(config.uploadDir, name), file.buffer);
  return name;
}

/** Delete a stored file. Never throws: a missing file is not worth failing a request over. */
async function remove(ref) {
  if (!ref) return;
  try {
    if (/^https?:\/\//.test(ref)) {
      if (useBlob) await require('@vercel/blob').del(ref);
    } else {
      await fs.rm(path.join(config.uploadDir, path.basename(ref)), { force: true });
    }
  } catch (e) {
    console.error('[storage] could not delete', ref, e.message);
  }
}

/** Public URL for a stored reference. */
function url(ref) {
  return /^https?:\/\//.test(ref) ? ref : `/uploads/${encodeURIComponent(path.basename(ref))}`;
}

module.exports = { save, remove, url, EXT };
