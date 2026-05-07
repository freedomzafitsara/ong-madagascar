// backend/create-super-admin.ts
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

// Configuration PostgreSQL
interface DbConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
}

interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

interface QueryResult {
    rows: Array<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
    }>;
}

const dbConfig: DbConfig = {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',  // Remplacez par votre mot de passe
    database: 'ymad_db',
};

async function createSuperAdmin(): Promise<void> {
    const client = new Client(dbConfig);
    
    try {
        // Connexion à PostgreSQL
        await client.connect();
        console.log('✅ Connecté à PostgreSQL');
        
        // Mot de passe du super admin
        const password: string = 'Admin123!';
        const hashedPassword: string = await bcrypt.hash(password, 10);
        
        console.log('\n📝 Informations du super admin:');
        console.log(`   Email: admin@ymad.mg`);
        console.log(`   Mot de passe: ${password}`);
        console.log(`   Hash généré: ${hashedPassword}`);
        
        // Supprimer tous les super admins existants
        const deleteResult = await client.query(
            `DELETE FROM users WHERE role = 'super_admin'`
        );
        console.log(`✅ Anciens super admins supprimés: ${deleteResult.rowCount} ligne(s)`);
        
        // Créer le nouveau super admin
        const insertQuery = `
            INSERT INTO users (
                id,
                email,
                password,
                first_name,
                last_name,
                role,
                is_active,
                email_verified,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
            ) RETURNING id, email, first_name, last_name, role
        `;
        
        const values: any[] = [
            'admin@ymad.mg',
            hashedPassword,
            'Super',
            'Admin',
            'super_admin',
            true,
            true
        ];
        
        const result: QueryResult = await client.query(insertQuery, values);
        const newAdmin = result.rows[0];
        
        console.log('\n✅ SUPER ADMIN CRÉÉ AVEC SUCCÈS !');
        console.log('═══════════════════════════════════════════════');
        console.log(`📧 Email: ${newAdmin.email}`);
        console.log(`🔑 Mot de passe: ${password}`);
        console.log(`👤 Nom: ${newAdmin.first_name} ${newAdmin.last_name}`);
        console.log(`🎭 Rôle: ${newAdmin.role}`);
        console.log(`🆔 ID: ${newAdmin.id}`);
        console.log('═══════════════════════════════════════════════');
        
        // Vérification finale
        const verifyResult = await client.query(
            `SELECT COUNT(*) as count FROM users WHERE role = 'super_admin'`
        );
        console.log(`\n📊 Nombre total de super admins: ${verifyResult.rows[0].count}`);
        
    } catch (error: any) {
        console.error('❌ Erreur:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('   Vérifiez que PostgreSQL est démarré');
        } else if (error.code === '28P01') {
            console.error('   Mot de passe PostgreSQL incorrect');
        }
    } finally {
        await client.end();
        console.log('\n🔌 Déconnexion de PostgreSQL');
    }
}

// Exécution du script
createSuperAdmin();