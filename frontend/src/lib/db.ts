// src/lib/db.ts
import { Pool } from 'pg';

// Configuration de la connexion PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'YMad2025Secure!',
  database: process.env.DB_NAME || 'ymad_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// ==================== UTILITAIRES ====================

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`✅ Requête exécutée en ${duration}ms`);
    return res;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('❌ Erreur requête:', errorMessage);
    throw error;
  }
}

// ==================== UTILISATEURS ====================

export async function getUserByEmail(email: string) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function getUserById(id: string) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createUser(user: any) {
  const { email, password_hash, first_name, last_name, role, phone, region } = user;
  const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, region) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [email, password_hash, first_name, last_name, role, phone, region]
  );
  return result.rows[0];
}

// ==================== PROJETS ====================

export async function getProjects() {
  const result = await query('SELECT * FROM projects ORDER BY created_at DESC');
  return result.rows;
}

export async function getProjectById(id: string) {
  const result = await query('SELECT * FROM projects WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createProject(project: any) {
  const { title, description, location, category, status, budget } = project;
  const result = await query(
    `INSERT INTO projects (title, description, location, category, status, budget) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, description, location, category, status || 'active', budget || 0]
  );
  return result.rows[0];
}

export async function updateProject(id: string, project: any) {
  const { title, description, location, category, status, budget, progress_percent } = project;
  const result = await query(
    `UPDATE projects 
     SET title = $1, description = $2, location = $3, category = $4, 
         status = $5, budget = $6, progress_percent = $7, updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [title, description, location, category, status, budget, progress_percent, id]
  );
  return result.rows[0];
}

export async function deleteProject(id: string) {
  await query('DELETE FROM projects WHERE id = $1', [id]);
  return true;
}

// ==================== OFFRES D'EMPLOI ====================

export async function getJobOffers() {
  const result = await query("SELECT * FROM job_offers WHERE status = 'open' OR status = 'published' ORDER BY created_at DESC");
  return result.rows;
}

export async function getAllJobOffers() {
  const result = await query('SELECT * FROM job_offers ORDER BY created_at DESC');
  return result.rows;
}

export async function getJobOfferById(id: string) {
  const result = await query('SELECT * FROM job_offers WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createJobOffer(job: any) {
  const { title, department, location, contract_type, description, requirements, salary, deadline, status } = job;
  const result = await query(
    `INSERT INTO job_offers (title, department, location, contract_type, description, requirements, salary, deadline, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [title, department, location, contract_type, description, requirements, salary, deadline, status || 'open']
  );
  return result.rows[0];
}

export async function updateJobOffer(id: string, job: any) {
  const { title, department, location, contract_type, description, requirements, salary, deadline, status } = job;
  const result = await query(
    `UPDATE job_offers 
     SET title = $1, department = $2, location = $3, contract_type = $4, 
         description = $5, requirements = $6, salary = $7, deadline = $8, status = $9, updated_at = NOW()
     WHERE id = $10 RETURNING *`,
    [title, department, location, contract_type, description, requirements, salary, deadline, status, id]
  );
  return result.rows[0];
}

export async function deleteJobOffer(id: string) {
  await query('DELETE FROM job_offers WHERE id = $1', [id]);
  return true;
}

// ==================== CANDIDATURES ====================

export async function getApplications() {
  const result = await query(`
    SELECT a.*, j.title as job_title 
    FROM job_applications a
    LEFT JOIN job_offers j ON a.job_offer_id = j.id
    ORDER BY a.applied_at DESC
  `);
  return result.rows;
}

export async function getApplicationsByJob(jobId: string) {
  const result = await query(`
    SELECT a.*, j.title as job_title 
    FROM job_applications a
    LEFT JOIN job_offers j ON a.job_offer_id = j.id
    WHERE a.job_offer_id = $1
    ORDER BY a.applied_at DESC
  `, [jobId]);
  return result.rows;
}

export async function getApplicationById(id: string) {
  const result = await query(`
    SELECT a.*, j.title as job_title 
    FROM job_applications a
    LEFT JOIN job_offers j ON a.job_offer_id = j.id
    WHERE a.id = $1
  `, [id]);
  return result.rows[0];
}

export async function createApplication(application: any) {
  const { job_offer_id, full_name, email, phone, address, experience, photo_url, cv_url, diploma_url, certificate_url, notes } = application;
  const result = await query(
    `INSERT INTO job_applications (job_offer_id, full_name, email, phone, address, experience, photo_url, cv_url, diploma_url, certificate_url, notes, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending') RETURNING *`,
    [job_offer_id, full_name, email, phone, address, experience, photo_url, cv_url, diploma_url, certificate_url, notes]
  );
  
  // Incrémenter le compteur de candidatures
  await query('UPDATE job_offers SET applications_count = applications_count + 1 WHERE id = $1', [job_offer_id]);
  
  return result.rows[0];
}

export async function updateApplicationStatus(id: string, status: string) {
  const result = await query(
    'UPDATE job_applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  return result.rows[0];
}

// ==================== BANNIÈRES ====================

export async function getBanner() {
  const result = await query('SELECT * FROM banners WHERE is_active = true ORDER BY created_at DESC LIMIT 1');
  return result.rows[0];
}

export async function saveBanner(url: string, filename: string) {
  // Désactiver l'ancienne bannière
  await query('UPDATE banners SET is_active = false');
  const result = await query(
    'INSERT INTO banners (url, filename, is_active) VALUES ($1, $2, true) RETURNING *',
    [url, filename]
  );
  return result.rows[0];
}

export async function deleteBanner() {
  await query('DELETE FROM banners');
  return true;
}

// ==================== FONDS D'ÉCRAN ====================

export async function getPageBackground(page: string) {
  const result = await query('SELECT * FROM page_backgrounds WHERE page = $1', [page]);
  return result.rows[0];
}

export async function savePageBackground(page: string, url: string, filename: string) {
  const result = await query(
    `INSERT INTO page_backgrounds (page, url, filename, is_active, updated_at) 
     VALUES ($1, $2, $3, true, NOW()) 
     ON CONFLICT (page) DO UPDATE SET url = $2, filename = $3, updated_at = NOW(), is_active = true 
     RETURNING *`,
    [page, url, filename]
  );
  return result.rows[0];
}

export async function deletePageBackground(page: string) {
  await query('DELETE FROM page_backgrounds WHERE page = $1', [page]);
  return true;
}

// ==================== STATISTIQUES DASHBOARD ====================

export async function getDashboardStats() {
  const result = await query(`
    SELECT 
      (SELECT COUNT(*) FROM job_offers) as total_jobs,
      (SELECT COUNT(*) FROM job_offers WHERE status = 'open' OR status = 'published') as active_jobs,
      (SELECT COUNT(*) FROM job_applications) as total_applications,
      (SELECT COUNT(*) FROM job_applications WHERE status = 'pending') as pending_applications,
      (SELECT COUNT(*) FROM job_applications WHERE status = 'accepted') as accepted_applications,
      (SELECT COUNT(*) FROM job_applications WHERE status = 'rejected') as rejected_applications,
      (SELECT COUNT(*) FROM projects) as total_projects,
      (SELECT COUNT(*) FROM projects WHERE status = 'active') as active_projects,
      (SELECT COUNT(*) FROM users) as total_users,
      (SELECT COUNT(*) FROM donations) as total_donations
  `);
  return result.rows[0];
}

export async function getRecentApplications(limit: number = 5) {
  const result = await query(`
    SELECT a.*, j.title as job_title 
    FROM job_applications a
    LEFT JOIN job_offers j ON a.job_offer_id = j.id
    ORDER BY a.applied_at DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
}

export async function getRecentJobs(limit: number = 5) {
  const result = await query(`
    SELECT * FROM job_offers 
    ORDER BY created_at DESC 
    LIMIT $1
  `, [limit]);
  return result.rows;
}

// ==================== ÉVÉNEMENTS ====================

export async function getEvents() {
  const result = await query('SELECT * FROM events ORDER BY start_datetime DESC');
  return result.rows;
}

export async function getEventById(id: string) {
  const result = await query('SELECT * FROM events WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createEvent(event: any) {
  const { title, description, event_type, location, region, start_datetime, end_datetime, max_capacity, is_free, price_mga } = event;
  const result = await query(
    `INSERT INTO events (title, description, event_type, location, region, start_datetime, end_datetime, max_capacity, is_free, price_mga) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
    [title, description, event_type, location, region, start_datetime, end_datetime, max_capacity, is_free, price_mga]
  );
  return result.rows[0];
}

// ==================== DONS ====================

export async function getDonations() {
  const result = await query('SELECT * FROM donations ORDER BY created_at DESC');
  return result.rows;
}

export async function createDonation(donation: any) {
  const { donor_name, donor_email, donor_phone, amount, currency, payment_method, message } = donation;
  const receipt_number = `RC-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const result = await query(
    `INSERT INTO donations (donor_name, donor_email, donor_phone, amount, currency, payment_method, receipt_number, message, status) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'confirmed') RETURNING *`,
    [donor_name, donor_email, donor_phone, amount, currency, payment_method, receipt_number, message]
  );
  return result.rows[0];
}

export default pool;