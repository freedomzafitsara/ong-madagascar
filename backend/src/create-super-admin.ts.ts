import { Client } from 'pg';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'ymad_db',
});

const ASSOCIATION_INFO = {
  name: 'Y-Mad',
  fullName: 'Youthful Madagascar',
  slogan: 'Ensemble, construisons le Madagascar de demain',
  address: 'Carion, Antananarivo, Madagascar',
  phone: '+261 32 04 856 97',
  email: 'ymad.mg@gmail.com',
  website: 'https://y-mad.mg',
};

const SUPER_ADMIN_CONFIG = {
  email: 'admin@ymad.mg',
  password: 'admin123',
  firstName: 'Jean',
  lastName: 'Rakoto',
  phone: '+261 32 04 856 97',
  bio: 'Administrateur principal de l association Y-Mad - Youthful Madagascar',
  region: 'Analamanga',
};

function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

async function initSuperAdmin() {
  console.log('');
  console.log('============================================================');
  console.log('Y-Mad - Youthful Madagascar');
  console.log('============================================================');
  console.log('Association : ' + ASSOCIATION_INFO.fullName);
  console.log('Slogan      : ' + ASSOCIATION_INFO.slogan);
  console.log('Adresse     : ' + ASSOCIATION_INFO.address);
  console.log('Contact     : ' + ASSOCIATION_INFO.phone + ' / ' + ASSOCIATION_INFO.email);
  console.log('============================================================');
  console.log('INITIALISATION DU COMPTE ADMINISTRATEUR');
  console.log('============================================================');
  console.log('');

  try {
    await client.connect();
    console.log('SUCCES : Connexion a PostgreSQL etablie');
    console.log('  - Base de donnees : ' + (process.env.DB_DATABASE || 'ymad_db'));
    console.log('  - Hote           : ' + (process.env.DB_HOST || 'localhost'));
    console.log('');

    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('ERREUR : La table users n existe pas.');
      console.log('ACTION : Veuillez d abord executer le fichier database-schema.sql');
      return;
    }
    
    console.log('SUCCES : Table users trouvee');
    console.log('');

    const existingAdmin = await client.query(`
      SELECT id, email, role, is_active, first_name, last_name 
      FROM users 
      WHERE email = $1
    `, [SUPER_ADMIN_CONFIG.email]);
    
    if (existingAdmin.rows.length > 0) {
      const admin = existingAdmin.rows[0];
      console.log('Information : Un compte existe deja avec cet email');
      console.log('  - Email      : ' + admin.email);
      console.log('  - Nom        : ' + admin.first_name + ' ' + admin.last_name);
      console.log('  - Role actuel: ' + admin.role);
      console.log('  - Statut     : ' + (admin.is_active ? 'Actif' : 'Inactif'));
      console.log('');
      console.log('Mise a jour du compte en super_admin...');
      console.log('');
    } else {
      console.log('Creation d un nouveau compte super_admin...');
      console.log('');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CONFIG.password, saltRounds);
    const verificationToken = generateSecureToken();
    const resetToken = generateSecureToken();

    const result = await client.query(`
      INSERT INTO users (
        id, 
        email, 
        password, 
        first_name, 
        last_name, 
        phone,
        bio,
        region,
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
        $7,
        $8, 
        true, 
        true,
        $9,
        $10,
        NOW() + INTERVAL '24 hours',
        0,
        NOW(), 
        NOW()
      ) ON CONFLICT (email) DO UPDATE SET 
        password = EXCLUDED.password,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        bio = EXCLUDED.bio,
        region = EXCLUDED.region,
        role = 'super_admin',
        is_active = true,
        email_verified = true,
        updated_at = NOW()
      RETURNING id, email, role, first_name, last_name, created_at, updated_at
    `, [
      SUPER_ADMIN_CONFIG.email, 
      hashedPassword, 
      SUPER_ADMIN_CONFIG.firstName, 
      SUPER_ADMIN_CONFIG.lastName,
      SUPER_ADMIN_CONFIG.phone,
      SUPER_ADMIN_CONFIG.bio,
      SUPER_ADMIN_CONFIG.region,
      'super_admin',
      verificationToken,
      resetToken
    ]);

    if (result.rows.length === 0) {
      console.log('ERREUR : La creation du super admin a echoue');
      return;
    }

    const admin = result.rows[0];
    
    const auditTableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'audit_logs'
      );
    `);
    
    if (auditTableCheck.rows[0].exists) {
      await client.query(`
        INSERT INTO audit_logs (
          id, user_id, action, entity_type, entity_id, 
          old_data, new_data, ip_address, user_agent, created_at
        ) VALUES (
          gen_random_uuid(), 
          $1, 
          'CREATE_OR_UPDATE', 
          'users', 
          $2,
          NULL,
          $3,
          '127.0.0.1',
          'system-init-script',
          NOW()
        )
      `, [admin.id, admin.id, JSON.stringify({ 
        email: admin.email, 
        role: 'super_admin',
        first_name: admin.first_name,
        last_name: admin.last_name,
        action: 'Initialisation du compte administrateur'
      })]);
      console.log('SUCCES : Entree ajoutee dans le journal d audit');
    }

    console.log('');
    console.log('============================================================');
    console.log('COMPTE ADMINISTRATEUR CONFIGURE AVEC SUCCES');
    console.log('============================================================');
    console.log('');
    console.log('INFORMATIONS DE L ASSOCIATION :');
    console.log('------------------------------------------------------------');
    console.log('  Association : ' + ASSOCIATION_INFO.fullName);
    console.log('  Adresse     : ' + ASSOCIATION_INFO.address);
    console.log('  Telephone   : ' + ASSOCIATION_INFO.phone);
    console.log('  Email       : ' + ASSOCIATION_INFO.email);
    console.log('  Site web    : ' + ASSOCIATION_INFO.website);
    console.log('------------------------------------------------------------');
    console.log('');
    console.log('IDENTIFIANTS DE CONNEXION ADMINISTRATEUR :');
    console.log('------------------------------------------------------------');
    console.log('  Email        : ' + admin.email);
    console.log('  Mot de passe : ' + SUPER_ADMIN_CONFIG.password);
    console.log('  Role         : ' + admin.role);
    console.log('  Nom complet  : ' + admin.first_name + ' ' + admin.last_name);
    console.log('  ID           : ' + admin.id);
    console.log('  Date creation: ' + admin.created_at);
    console.log('------------------------------------------------------------');
    console.log('');
    console.log('ACCES AU DASHBOARD ADMINISTRATION :');
    console.log('------------------------------------------------------------');
    console.log('  URL dashboard : http://localhost:3000/dashboard');
    console.log('  URL API       : http://localhost:4001/api');
    console.log('  Documentation : http://localhost:4001/api/docs');
    console.log('------------------------------------------------------------');
    console.log('');
    console.log('CONSEILS DE SECURITE :');
    console.log('------------------------------------------------------------');
    console.log('  1. Changez ce mot de passe apres la premiere connexion');
    console.log('  2. Utilisez toujours HTTPS en production');
    console.log('  3. Ne partagez jamais ces identifiants');
    console.log('  4. Activez la verification par email');
    console.log('  5. Consultez regulierement le journal d audit');
    console.log('------------------------------------------------------------');
    console.log('');

    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN role = 'super_admin' THEN 1 END) as super_admins,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'staff' THEN 1 END) as staff,
        COUNT(CASE WHEN role = 'member' THEN 1 END) as members,
        COUNT(CASE WHEN role = 'volunteer' THEN 1 END) as volunteers,
        COUNT(CASE WHEN role = 'partner' THEN 1 END) as partners
      FROM users
    `);
    
    console.log('STATISTIQUES DES UTILISATEURS :');
    console.log('------------------------------------------------------------');
    console.log('  Total utilisateurs : ' + stats.rows[0].total_users);
    console.log('  Super admins       : ' + stats.rows[0].super_admins);
    console.log('  Admins             : ' + stats.rows[0].admins);
    console.log('  Staff              : ' + stats.rows[0].staff);
    console.log('  Membres            : ' + stats.rows[0].members);
    console.log('  Benevoles          : ' + stats.rows[0].volunteers);
    console.log('  Partenaires        : ' + stats.rows[0].partners);
    console.log('============================================================');
    console.log('');

  } catch (error: any) {
    console.log('');
    console.log('ERREUR LORS DE L INITIALISATION :');
    console.log('------------------------------------------------------------');
    console.log('  Message : ' + error.message);
    console.log('  Code    : ' + (error.code || 'Non disponible'));
    
    if (error.code === '42P01') {
      console.log('  Cause   : La table users n existe pas.');
      console.log('  Action  : Executez d abord le fichier database-schema.sql');
    } else if (error.code === '28P01') {
      console.log('  Cause   : Erreur d authentification PostgreSQL');
      console.log('  Action  : Verifiez vos identifiants dans le fichier .env');
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