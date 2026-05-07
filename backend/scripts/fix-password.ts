// backend/scripts/fix-password.ts
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    database: 'ymad_db',
});

async function fixPassword(): Promise<void> {
    try {
        await client.connect();
        console.log(' Connecté à PostgreSQL');
        
        const password: string = 'Admin123!';
        const hashedPassword: string = await bcrypt.hash(password, 10);
        
        console.log(` Mot de passe: ${password}`);
        console.log(` Hash généré: ${hashedPassword}`);
        
        const result = await client.query(
            `UPDATE users SET password = $1 WHERE email = $2 RETURNING id, email, role`,
            [hashedPassword, 'admin@ymad.mg']
        );
        
        if (result.rows.length > 0) {
            console.log('\n MOT DE PASSE MIS À JOUR AVEC SUCCÈS !');
            console.log('═══════════════════════════════════════════════');
            console.log(` Email: ${result.rows[0].email}`);
            console.log(`Nouveau mot de passe: ${password}`);
            console.log(` Rôle: ${result.rows[0].role}`);
            console.log('═══════════════════════════════════════════════');
        } else {
            console.log(' Utilisateur non trouvé');
        }
        
    } catch (error) {
        console.error(' Erreur:', error);
    } finally {
        await client.end();
    }
}

fixPassword();