const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function updateItemImages() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    // 1. Update existing items with related images
    await conn.query("UPDATE items SET image_path = '/uploads/sample-charger.jpg' WHERE id = 4");
    await conn.query("UPDATE items SET image_path = '/uploads/sample-wallet.jpg' WHERE id IN (8, 12)");
    await conn.query("UPDATE items SET image_path = '/uploads/sample-bottle.jpg' WHERE id = 15");

    // 2. Check if we have backpack and notebook items, if not, add them
    const [existing] = await conn.query("SELECT id, title FROM items WHERE title LIKE '%Backpack%' OR title LIKE '%Notebook%'");
    if (existing.length === 0) {
      // Add Backpack
      await conn.query(`
        INSERT INTO items (user_id, category_id, title, description, item_type, color, location, item_date, image_path, status, qr_token)
        VALUES (1, 6, 'Navy Blue Campus Backpack', 'Has 15.6 inch laptop sleeve with side bottle pocket, found in Seminar Hall 2.', 'found', 'Navy Blue', 'Seminar Hall 2, Block B', '2026-11-02', '/uploads/sample-backpack.jpg', 'open', 'QR-FND-BACKPACK-991')
      `);

      // Add Notebook
      await conn.query(`
        INSERT INTO items (user_id, category_id, title, description, item_type, color, location, item_date, image_path, status, qr_token)
        VALUES (4, 2, 'Green Spiral Lab Journal & Notes', 'Engineering Chemistry lab manual with blue pen attached to the ring binder.', 'lost', 'Green', 'Central Library, 1st Floor', '2026-11-01', '/uploads/sample-notebook.jpg', 'open', NULL)
      `);
      console.log('Added backpack and notebook items.');
    }

    const [rows] = await conn.query("SELECT id, title, item_type, image_path FROM items");
    console.log('All DB Items:');
    console.table(rows);
  } catch (err) {
    console.error('Error updating items:', err);
  } finally {
    await conn.end();
  }
}

updateItemImages();

