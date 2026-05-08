import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'ymad_db',
});

async function initSuperAdmin() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    // Vérifier si un super admin existe déjà
    const existing = await client.query(`SELECT COUNT(*) FROM users WHERE role = 'super_admin'`);
    
    if (parseInt(existing.rows[0].count) > 0) {
      console.log('⚠️ Un Super Admin existe déjà. Suppression...');
      await client.query(`DELETE FROM users WHERE role = 'super_admin' AND email != 'super@ymad.mg'`);
    }

    // Mot de passe ultra sécurisé
    const password = 'Y-Mad@2025#SuperAdmin!';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer le super admin unique
    await client.query(`
      INSERT INTO users (
        id, email, password, first_name, last_name, role, 
        is_active, email_verified, created_at, updated_at
      ) VALUES (
        gen_random_uuid(), 
        'super@ymad.mg', 
        $1, 
        'Super', 
        'Admin', 
        'super_admin',
        true, 
        true, 
        NOW(), 
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        role = 'super_admin',
        is_active = true
    `, [hashedPassword]);

    console.log(' SUPER ADMIN UNIQUE CRÉÉ AVEC SUCCÈS !');
    console.log('═══════════════════════════════════════════════════════');
    console.log(' Email: super@ymad.mg');
    console.log(' Mot de passe: Y-Mad@2025#SuperAdmin!');
    console.log(' Rôle: super_admin (UNIQUE)');
    console.log('═══════════════════════════════════════════════════════');
    console.log(' CONSERVEZ CES IDENTIFIANTS EN LIEU SÛR !');

  } catch (error) {
    console.error(' Erreur:', error);
  } finally {
    await client.end();
  }
}

initSuperAdmin();