// FICHIER: E:\projet-ymad\migrate-bytea.js
// EXECUTION: node migrate-bytea.js

const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// CONFIGURATION BASE SUR .env
const pool = new Pool({
    host: 'localhost',
    port: 5432,
    database: 'ymad_db',
    user: 'postgres',
    password: 'ymad24'
});

async function migrate() {
    console.log('========================================');
    console.log('MIGRATION BYTEA VERS SYSTEME DE FICHIERS');
    console.log('========================================');
    
    try {
        // ETAPE 1: Creation du dossier uploads
        const uploadDir = path.join('E:', 'projet-ymad', 'uploads', 'images');
        await fs.mkdir(uploadDir, { recursive: true });
        console.log('Dossier cree: ' + uploadDir);
        
        // ETAPE 2: Tester la connexion
        const client = await pool.connect();
        console.log('Connexion base de donnees etablie');
        client.release();
        
        // ETAPE 3: Verifier les tables existantes
        const tablesCheck = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name IN ('database_images', 'database_images_backup', 'images_metadata', 'uploaded_files')
        `);
        
        console.log('Tables trouvees:');
        tablesCheck.rows.forEach(row => {
            console.log('  - ' + row.table_name);
        });
        
        // ETAPE 4: Recuperation des images
        let result = await pool.query(`
            SELECT id, original_name, mime_type, 
                   encode(image_data, 'base64') as base64
            FROM database_images_backup
            WHERE image_data IS NOT NULL
        `);
        
        let total = result.rows.length;
        console.log(total + ' images trouvees dans database_images_backup');
        
        if (total === 0) {
            console.log('Recherche dans database_images...');
            
            result = await pool.query(`
                SELECT id, original_name, mime_type, 
                       encode(image_data, 'base64') as base64
                FROM database_images
                WHERE image_data IS NOT NULL
            `);
            
            total = result.rows.length;
            
            if (total === 0) {
                console.log('AUCUNE IMAGE BYTEA TROUVEE');
                console.log('La migration n\'est pas necessaire');
                return;
            }
            
            console.log(total + ' images trouvees dans database_images');
        }
        
        if (total === 0) {
            console.log('Aucune image a migrer');
            return;
        }
        
        // ETAPE 5: Migration des images
        let success = 0;
        let failed = 0;
        
        for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows[i];
            try {
                const buffer = Buffer.from(row.base64, 'base64');
                
                let ext = '.jpg';
                if (row.mime_type === 'image/png') ext = '.png';
                if (row.mime_type === 'image/gif') ext = '.gif';
                if (row.mime_type === 'image/webp') ext = '.webp';
                if (row.mime_type === 'image/jpeg') ext = '.jpg';
                
                const fileName = row.id + ext;
                const filePath = path.join(uploadDir, fileName);
                
                await fs.writeFile(filePath, buffer);
                
                // Verifier si la table images_metadata existe
                const metadataCheck = await pool.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_name = 'images_metadata'
                    )
                `);
                
                if (metadataCheck.rows[0].exists) {
                    await pool.query(`
                        INSERT INTO images_metadata (
                            original_id, 
                            original_name, 
                            file_path, 
                            file_size, 
                            mime_type,
                            migration_date
                        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                    `, [row.id, row.original_name, filePath, buffer.length, row.mime_type]);
                }
                
                // Mettre a jour uploaded_files si la table existe
                const uploadedCheck = await pool.query(`
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables 
                        WHERE table_name = 'uploaded_files'
                    )
                `);
                
                if (uploadedCheck.rows[0].exists) {
                    await pool.query(`
                        INSERT INTO uploaded_files (
                            id,
                            url,
                            file_path,
                            filename,
                            original_name,
                            format,
                            size,
                            type,
                            entity_id,
                            created_at
                        ) VALUES (
                            $1,
                            $2,
                            $3,
                            $4,
                            $5,
                            $6,
                            $7,
                            $8,
                            $9,
                            CURRENT_TIMESTAMP
                        )
                        ON CONFLICT (id) DO UPDATE SET
                            url = EXCLUDED.url,
                            file_path = EXCLUDED.file_path,
                            filename = EXCLUDED.filename,
                            original_name = EXCLUDED.original_name,
                            format = EXCLUDED.format,
                            size = EXCLUDED.size
                    `, [
                        row.id,
                        '/uploads/images/' + fileName,
                        'uploads/images/' + fileName,
                        fileName,
                        row.original_name,
                        ext.replace('.', ''),
                        buffer.length,
                        'job',
                        null
                    ]);
                }
                
                success++;
                const sizeKB = (buffer.length / 1024).toFixed(1);
                console.log('SUCCES [' + success + '/' + total + '] ' + row.original_name + ' (' + sizeKB + ' KB)');
                
            } catch (err) {
                failed++;
                console.log('ECHEC [' + (i+1) + '/' + total + '] ' + row.original_name + ': ' + err.message);
            }
        }
        
        // ETAPE 6: Rapport final
        console.log('========================================');
        console.log('RAPPORT DE MIGRATION');
        console.log('Succes: ' + success);
        console.log('Echecs: ' + failed);
        console.log('Dossier: ' + uploadDir);
        console.log('========================================');
        
        // ETAPE 7: Verification finale
        const verify = await pool.query(`
            SELECT COUNT(*) as count FROM uploaded_files
        `);
        console.log('Total fichiers dans uploaded_files: ' + verify.rows[0].count);
        
        if (success === total && total > 0) {
            console.log('MIGRATION COMPLETEMENT REUSSIE');
        } else if (success > 0) {
            console.log('MIGRATION PARTIELLEMENT REUSSIE');
        }
        
    } catch (err) {
        console.error('ERREUR FATALE: ' + err.message);
        console.error('Verifiez que PostgreSQL est en cours d\'execution');
        console.error('Verifiez les identifiants de connexion');
    } finally {
        await pool.end();
        console.log('Connexion base de donnees fermee');
    }
}

migrate();