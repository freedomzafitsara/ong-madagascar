// backend/generate-env.js
const fs = require('fs');
const crypto = require('crypto');

// Générer les clés
const jwtSecret = crypto.randomBytes(32).toString('hex');

// Template du fichier .env
const envContent = `# Base de données
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=ymad_db

# JWT - Généré automatiquement le ${new Date().toISOString()}
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development

# Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Frontend URL
FRONTEND_URL=http://localhost:3000
`;

// Écrire le fichier .env
fs.writeFileSync('.env', envContent);
console.log('✅ Fichier .env généré avec succès !');
console.log(`🔑 JWT_SECRET: ${jwtSecret}`);