import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'ymad_db',
});

const users = [
  { email: 'super@ymad.mg', password: 'Super123!', firstName: 'Super', lastName: 'Admin', role: 'super_admin' },
  { email: 'admin@ymad.mg', password: 'Admin123!', firstName: 'Admin', lastName: 'User', role: 'admin' },
  { email: 'staff@ymad.mg', password: 'Staff123!', firstName: 'Staff', lastName: 'User', role: 'staff' },
  { email: 'member@ymad.mg', password: 'Member123!', firstName: 'Jean', lastName: 'RAKOTO', role: 'member' },
  { email: 'volunteer@ymad.mg', password: 'Volunteer123!', firstName: 'Marie', lastName: 'RANDRIAN', role: 'volunteer' },
  { email: 'partner@ymad.mg', password: 'Partner123!', firstName: 'Entreprise', lastName: 'XYZ', role: 'partner' },
  { email: 'visitor@ymad.mg', password: 'Visitor123!', firstName: 'Visitor', lastName: 'Test', role: 'visitor' },
];

async function seedUsers() {
  try {
    await client.connect();
    console.log('✅ Connecté à PostgreSQL');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      
      await client.query(`
        INSERT INTO users (id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET 
          password = EXCLUDED.password,
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          role = EXCLUDED.role
      `, [user.email, hashedPassword, user.firstName, user.lastName, user.role]);
      
      console.log(`✅ ${user.email} (${user.role})`);
    }

    console.log('\n🎉 7 utilisateurs créés avec succès !');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await client.end();
  }
}

seedUsers();