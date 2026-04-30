// check-columns.js
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'ymad24!',
  database: 'ymad_db',
});

async function check() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'job_offers' 
      ORDER BY ordinal_position
    `);
    console.log('📊 Colonnes dans job_offers:');
    res.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.column_name}`);
    });
    await client.end();
  } catch (err) {
    console.error('Erreur:', err.message);
  }
}

check();