import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

// Configuration de la connexion à la base de données
const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ymad_db',
});

// Fonction pour générer un token de sécurité unique
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Fonction principale d'initialisation du Super Admin
async function initSuperAdmin() {
  console.log('============================================================');
  console.log('INITIALISATION DU SUPER ADMIN - Y-MAD');
  console.log('============================================================');
  console.log('');

  try {
    // Étape 1 : Connexion à PostgreSQL
    await client.connect();
    console.log('SUCCES : Connexion à PostgreSQL établie');

    // Étape 2 : Vérifier l'existence de la table users
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('ERREUR : La table "users" n\'existe pas.');
      console.log('ACTION : Veuillez d\'abord exécuter les migrations de base de données.');
      return;
    }

    // Étape 3 : Vérifier les super admins existants
    const existingAdmins = await client.query(`
      SELECT id, email, role, is_active FROM users WHERE role = 'super_admin'
    `);
    
    console.log('Resultat : ' + existingAdmins.rows.length + ' super admin(s) existant(s)');

    if (existingAdmins.rows.length > 0) {
      console.log('');
      console.log('Attention : Super admin(s) existant(s) :');
      for (const admin of existingAdmins.rows) {
        const statut = admin.is_active ? 'actif' : 'inactif';
        console.log('  - ' + admin.email + ' (' + statut + ')');
      }
    }

    // Étape 4 : Configuration du super admin (via variables d'environnement ou valeurs par défaut)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'super@ymad.mg';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'Y-Mad@2025#SuperAdmin!';
    const superAdminFirstName = process.env.SUPER_ADMIN_FIRST_NAME || 'Super';
    const superAdminLastName = process.env.SUPER_ADMIN_LAST_NAME || 'Admin';
    
    // Validation de la sécurité du mot de passe
    if (superAdminPassword.length < 12) {
      console.log('ERREUR : Le mot de passe doit contenir au moins 12 caracteres.');
      return;
    }

    // Étape 5 : Hashage du mot de passe avec Bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superAdminPassword, saltRounds);
    const verificationToken = generateSecureToken();
    const resetToken = generateSecureToken();

    // Étape 6 : Creation ou mise a jour du super admin
    const result = await client.query(`
      INSERT INTO users (
        id, 
        email, 
        password, 
        first_name, 
        last_name, 
        phone,
        role, 
        is_active, 
        email_verified,
        verification_token,
        reset_password_token,
        reset_password_expires,
        login_attempts,
        created_at, 
        updated_at
      ) VALUES (
        gen_random_uuid(), 
        $1, 
        $2, 
        $3, 
        $4, 
        $5,
        $6, 
        true, 
        true,
        $7,
        $8,
        NOW() + INTERVAL '24 hours',
        0,
        NOW(), 
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        role = 'super_admin',
        is_active = true,
        email_verified = true,
        updated_at = NOW()
      RETURNING id, email, role, created_at
    `, [
      superAdminEmail, 
      hashedPassword, 
      superAdminFirstName, 
      superAdminLastName,
      '+261340000000',
      'super_admin',
      verificationToken,
      resetToken
    ]);

    // Verification du succès de l'operation
    if (result.rows.length === 0) {
      console.log('ERREUR : La creation du super admin a echoue');
      return;
    }

    const admin = result.rows[0];

    // Étape 7 : Enregistrement dans le journal d'audit
    await client.query(`
      INSERT INTO audit_logs (
        id, user_id, action, entity_type, entity_id, 
        old_data, new_data, ip_address, user_agent, created_at
      ) VALUES (
        gen_random_uuid(), 
        $1, 
        'CREATE', 
        'users', 
        $2,
        NULL,
        $3,
        '127.0.0.1',
        'system-script',
        NOW()
      )
    `, [admin.id, admin.id, JSON.stringify({ email: admin.email, role: 'super_admin' })]);

    // Affichage des résultats
    console.log('');
    console.log('============================================================');
    console.log('SUCCES : Super Admin cree ou mis a jour avec succes');
    console.log('============================================================');
    console.log('');
    console.log('IDENTIFIANTS DE CONNEXION :');
    console.log('------------------------------------------------------------');
    console.log('  Email        : ' + admin.email);
    console.log('  Mot de passe : ' + superAdminPassword);
    console.log('  Role         : ' + admin.role);
    console.log('  ID           : ' + admin.id);
    console.log('  Date creation: ' + admin.created_at);
    console.log('------------------------------------------------------------');
    console.log('');
    console.log('CONSEIL : Conservez ces identifiants dans un endroit sur.');
    console.log('         Ne les partagez jamais et changez le mot de passe regulierement.');
    console.log('');

    // Étape 8 : Afficher les statistiques des utilisateurs
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'member' THEN 1 END) as members
      FROM users
    `);
    
    console.log('STATISTIQUES DES UTILISATEURS :');
    console.log('------------------------------------------------------------');
    console.log('  Total utilisateurs : ' + stats.rows[0].total_users);
    console.log('  Super admins       : ' + stats.rows[0].super_admins);
    console.log('  Admins             : ' + stats.rows[0].admins);
    console.log('  Membres            : ' + stats.rows[0].members);
    console.log('============================================================');
    console.log('');

  } catch (error) {
    console.log('');
    console.log('ERREUR LORS DE L INITIALISATION :');
    console.log('------------------------------------------------------------');
    console.log('  Message : ' + error.message);
    console.log('  Code    : ' + (error.code || 'Non disponible'));
    
    if (error.code === '42P01') {
      console.log('  Cause   : La table "users" n existe pas.');
      console.log('  Action  : Executez d abord les migrations SQL.');
    }
    console.log('------------------------------------------------------------');
    console.log('');
  } finally {
    await client.end();
    console.log('Connexion PostgreSQL fermee.');
    console.log('');
  }
}

// Lancer le script
initSuperAdmin();