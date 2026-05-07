// add-columns.js
const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'ymad24!',
  database: 'ymad_db',
});

async function addColumns() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');
    
    await client.query(`ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS title_mg VARCHAR(255)`);
    console.log('✅ Colonne title_mg ajoutée');
    
    await client.query(`ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS description_mg TEXT`);
    console.log('✅ Colonne description_mg ajoutée');
    
    await client.query(`ALTER TABLE job_offers ADD COLUMN IF NOT EXISTS requirements_mg TEXT`);
    console.log('✅ Colonne requirements_mg ajoutée');
    
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'job_offers' ORDER BY ordinal_position`);
    console.log('📊 Colonnes dans job_offers:');
    res.rows.forEach(row => console.log(`   - ${row.column_name}`));
    
    await client.end();
    console.log('✅ Terminé !');
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

addColumns();