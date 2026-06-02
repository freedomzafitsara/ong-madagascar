// backend/scripts/init-super-admin.ts

import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ymad_db',
});

const SUPER_ADMIN_CONFIG = {
  email: 'admin@ymad.mg',
  password: 'Admin123!',
  firstName: 'Admin',
  lastName: 'Y-MaD',
};

async function initSuperAdmin() {
  console.log('');
  console.log('============================================================');
  console.log('Y-MaD - Initialisation du compte Super Administrateur');
  console.log('Theme: Gestion des offres d emploi');
  console.log('============================================================');
  console.log('');

  try {
    await client.connect();
    console.log('SUCCES: Connexion a PostgreSQL etablie');
    console.log('  - Base de donnees: ' + (process.env.DB_NAME || 'ymad_db'));
    console.log('  - Hote: ' + (process.env.DB_HOST || 'localhost'));
    console.log('');

    // Verifier si la table users existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('ERREUR: La table users n existe pas.');
      console.log('ACTION: Veuillez d abord executer les migrations TypeORM');
      return;
    }
    
    console.log('SUCCES: Table users trouvee');
    console.log('');

    // Verifier si un admin existe deja
    const existingAdmin = await client.query(`
      SELECT id, email, role, is_active, first_name, last_name 
      FROM users 
      WHERE email = $1
    `, [SUPER_ADMIN_CONFIG.email]);
    
    if (existingAdmin.rows.length > 0) {
      const admin = existingAdmin.rows[0];
      console.log('INFORMATION: Un compte existe deja avec cet email');
      console.log('  - Email: ' + admin.email);
      console.log('  - Nom: ' + admin.first_name + ' ' + admin.last_name);
      console.log('  - Role: ' + admin.role);
      console.log('  - Statut: ' + (admin.is_active ? 'Actif' : 'Inactif'));
      console.log('');
      console.log('Mise a jour du compte en super_admin...');
      console.log('');
    } else {
      console.log('Creation d un nouveau compte super_admin...');
      console.log('');
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CONFIG.password, saltRounds);

    // Inserer ou mettre a jour le super admin
    const result = await client.query(`
      INSERT INTO users (
        id, 
        email, 
        password, 
        first_name, 
        last_name, 
        role, 
        is_active, 
        created_at, 
        updated_at
      ) VALUES (
        gen_random_uuid(), 
        $1, 
        $2, 
        $3, 
        $4, 
        'super_admin', 
        true, 
        NOW(), 
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = 'super_admin',
        is_active = true,
        updated_at = NOW()
      RETURNING id, email, role, first_name, last_name, created_at, updated_at
    `, [
      SUPER_ADMIN_CONFIG.email, 
      hashedPassword, 
      SUPER_ADMIN_CONFIG.firstName, 
      SUPER_ADMIN_CONFIG.lastName
    ]);

    if (result.rows.length === 0) {
      console.log('ERREUR: La creation du super admin a echoue');
      return;
    }

    const admin = result.rows[0];
    
    console.log('');
    console.log('============================================================');
    console.log('COMPTE SUPER ADMINISTRATEUR CONFIGURE AVEC SUCCES');
    console.log('============================================================');
    console.log('');
    console.log('IDENTIFIANTS DE CONNEXION:');
    console.log('------------------------------------------------------------');
    console.log('  Email        : ' + admin.email);
    console.log('  Mot de passe : ' + SUPER_ADMIN_CONFIG.password);
    console.log('  Role         : ' + admin.role);
    console.log('  Nom complet  : ' + admin.first_name + ' ' + admin.last_name);
    console.log('  ID           : ' + admin.id);
    console.log('  Date creation: ' + admin.created_at);
    console.log('------------------------------------------------------------');
    console.log('');
    console.log('ACCES A L APPLICATION:');
    console.log('------------------------------------------------------------');
    console.log('  URL Backend   : http://localhost:4001/api');
    console.log('  Documentation : http://localhost:4001/api/docs');
    console.log('------------------------------------------------------------');
    console.log('');
    console.log('CONSEILS DE SECURITE:');
    console.log('------------------------------------------------------------');
    console.log('  1. Changez ce mot de passe apres la premiere connexion');
    console.log('  2. Utilisez toujours HTTPS en production');
    console.log('  3. Ne partagez jamais ces identifiants');
    console.log('------------------------------------------------------------');
    console.log('');

    // Afficher les statistiques des utilisateurs
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
      FROM users
    `);
    
    console.log('STATISTIQUES DES UTILISATEURS:');
    console.log('------------------------------------------------------------');
    console.log('  Total utilisateurs: ' + stats.rows[0].total_users);
    console.log('  Super admins      : ' + stats.rows[0].super_admins);
    console.log('  Admins            : ' + stats.rows[0].admins);
    console.log('============================================================');
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('ERREUR LORS DE L INITIALISATION:');
    console.log('------------------------------------------------------------');
    console.log('  Message: ' + error.message);
    console.log('  Code   : ' + (error.code || 'Non disponible'));
    
    if (error.code === '42P01') {
      console.log('  Cause  : La table users n existe pas.');
      console.log('  Action : Executez d abord les migrations TypeORM');
    } else if (error.code === '28P01') {
      console.log('  Cause  : Erreur d authentification PostgreSQL');
      console.log('  Action : Verifiez vos identifiants dans le fichier .env');
    }
    console.log('------------------------------------------------------------');
    console.log('');
  } finally {
    await client.end();
    console.log('Connexion PostgreSQL fermee.');
    console.log('');
  }
}

initSuperAdmin();