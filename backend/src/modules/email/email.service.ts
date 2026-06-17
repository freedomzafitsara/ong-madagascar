import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private isConnected = false;

  // Durée de validité du token (doit correspondre à AuthService)
  private readonly TOKEN_EXPIRY_MINUTES = 1;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const secure = this.configService.get<boolean>('SMTP_SECURE');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    // Vérification de la présence de la clé API
    if (!pass || pass === 'votre-mot-de-passe' || pass.includes('SG.')) {
      this.logger.warn('Clé API SendGrid manquante ou invalide dans le fichier .env');
      this.logger.warn('Veuillez créer une nouvelle clé sur https://app.sendgrid.com');
      this.logger.warn('Allez dans Settings → API Keys → Create API Key');
    }

    this.logger.log(`Configuration SMTP: ${host}:${port}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3',
      },
      requireTLS: true,
      connectionTimeout: 10000,
    });

    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.isConnected = true;
      this.logger.log('Connexion SMTP etablie avec succes');
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Erreur de connexion SMTP:');
      this.logger.error(`   ${error.message}`);

      if (error.message.includes('535')) {
        this.logger.error('   La clé API est invalide ou a expire.');
        this.logger.error('   Solution: Creez une nouvelle clé sur https://app.sendgrid.com');
        this.logger.error('   Allez dans Settings → API Keys → Create API Key');
      } else if (error.message.includes('ETIMEDOUT')) {
        this.logger.error('   Connexion impossible. Verifiez votre firewall.');
      } else if (error.message.includes('ECONNREFUSED')) {
        this.logger.error('   Serveur SMTP inaccessible. Verifiez le host et le port.');
      }
    }
  }

  // ============================================================
  // VERIFICATION DE LA CONNEXION
  // ============================================================

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.verifyConnection();
    }
    if (!this.isConnected) {
      throw new Error('Service email non disponible. Veuillez verifier la configuration SMTP.');
    }
  }

  // ============================================================
  // ENVOI D'EMAIL DE REINITIALISATION DU MOT DE PASSE
  // ============================================================

  async sendResetPasswordEmail(to: string, token: string, firstName?: string): Promise<void> {
    await this.ensureConnected();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const fromEmail = this.configService.get<string>('SMTP_FROM') || 'ymad.mg@gmail.com';
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'Y-MaD Association';

    const subject = 'Reinitialisation de votre mot de passe - Y-MaD';
    const html = this.getResetPasswordEmailHtml(resetLink, firstName);
    const text = this.getResetPasswordEmailText(resetLink, firstName);

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email de reinitialisation envoye a ${to}`);
      this.logger.log(`   Message ID: ${info.messageId}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email a ${to}:`, error.message);

      if (error.message.includes('535')) {
        this.logger.error('   La clé API est invalide. Creez une nouvelle clé SendGrid.');
      }

      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }

  // ============================================================
  // ENVOI D'EMAIL DE CONFIRMATION DE REINITIALISATION
  // ============================================================

  async sendResetConfirmationEmail(to: string, firstName: string): Promise<void> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM') || 'ymad.mg@gmail.com';
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'Y-MaD Association';

    const subject = 'Confirmation - Votre mot de passe a ete reinitialise';
    const html = this.getResetConfirmationHtml(firstName);
    const text = this.getResetConfirmationText(firstName);

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email de confirmation de reinitialisation envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de confirmation a ${to}:`, error.message);
    }
  }

  // ============================================================
  // ENVOI D'EMAIL DE BIENVENUE
  // ============================================================

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM') || 'ymad.mg@gmail.com';
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'Y-MaD Association';

    const subject = 'Bienvenue chez Y-MaD - Votre inscription est confirmee';
    const html = this.getWelcomeEmailHtml(firstName);
    const text = this.getWelcomeEmailText(firstName);

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email de bienvenue envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de bienvenue a ${to}:`, error.message);
    }
  }

  // ============================================================
  // ENVOI D'EMAIL DE CONFIRMATION DE CANDIDATURE
  // ============================================================

  async sendApplicationConfirmationEmail(
    to: string,
    firstName: string,
    jobTitle: string
  ): Promise<void> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM') || 'ymad.mg@gmail.com';
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'Y-MaD Association';

    const subject = 'Confirmation de votre candidature - Y-MaD';
    const html = this.getApplicationConfirmationEmailHtml(firstName, jobTitle);
    const text = this.getApplicationConfirmationEmailText(firstName, jobTitle);

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email de confirmation de candidature envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de confirmation a ${to}:`, error.message);
    }
  }

  // ============================================================
  // ENVOI D'EMAIL DE STATUT DE CANDIDATURE
  // ============================================================

  async sendApplicationStatusEmail(
    to: string,
    firstName: string,
    jobTitle: string,
    status: string
  ): Promise<void> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM') || 'ymad.mg@gmail.com';
    const fromName = this.configService.get<string>('SMTP_FROM_NAME') || 'Y-MaD Association';

    const subject = 'Mise a jour de votre candidature - Y-MaD';
    const html = this.getApplicationStatusEmailHtml(firstName, jobTitle, status);
    const text = this.getApplicationStatusEmailText(firstName, jobTitle, status);

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`Email de statut de candidature envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de statut a ${to}:`, error.message);
    }
  }

  // ============================================================
  // TEMPLATE - REINITIALISATION DU MOT DE PASSE (HTML)
  // ============================================================

  private getResetPasswordEmailHtml(resetLink: string, firstName?: string): string {
    const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reinitialisation du mot de passe - Y-MaD</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #1E3A8A, #3B82F6);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 5px 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            background: #f8fafc;
            padding: 30px;
            border: 1px solid #e2e8f0;
            border-top: none;
            border-radius: 0 0 10px 10px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #1E3A8A, #3B82F6);
            color: white !important;
            text-decoration: none;
            padding: 14px 35px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background 0.3s;
          }
          .button:hover {
            background: linear-gradient(135deg, #1a3a7a, #2563eb);
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            margin-top: 20px;
          }
          .security-note {
            background: #f1f5f9;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
            color: #475569;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Young for Madagascar Development</p>
        </div>

        <div class="content">
          <p style="font-size: 18px; color: #1e293b;">${greeting}</p>

          <p>Nous avons reçu une demande de reinitialisation de votre mot de passe pour votre compte Y-MaD.</p>

          <p>Cliquez sur le bouton ci-dessous pour creer un nouveau mot de passe :</p>

          <div style="text-align: center;">
            <a href="${resetLink}" class="button">Reinitialiser mon mot de passe</a>
          </div>

          <div class="security-note">
            <strong>Lien securise</strong><br>
            Ce lien est valable pendant <strong>${this.TOKEN_EXPIRY_MINUTES} minute(s)</strong>.<br>
            Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.<br>
            Votre mot de passe ne sera pas modifie.
          </div>

          <p style="font-size: 14px; color: #64748b;">
            Si le bouton ne fonctionne pas, copiez et collez le lien suivant dans votre navigateur :
          </p>
          <p style="font-size: 12px; color: #3B82F6; word-break: break-all; background: #eef2ff; padding: 10px; border-radius: 6px;">
            ${resetLink}
          </p>

          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

          <p style="font-size: 14px; color: #64748b;">
            Pour toute question, contactez-nous à
            <a href="mailto:ymad.mg@gmail.com" style="color: #1E3A8A;">ymad.mg@gmail.com</a>
          </p>
        </div>

        <div class="footer">
          <p>© 2025 Y-MaD Association - Young for Madagascar Development</p>
          <p>Carion, Antananarivo, Madagascar • +261 32 04 856 97</p>
          <p>Cet email a ete envoye automatiquement, merci de ne pas y repondre.</p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================================
  // TEMPLATE - REINITIALISATION DU MOT DE PASSE (TEXTE)
  // ============================================================

  private getResetPasswordEmailText(resetLink: string, firstName?: string): string {
    const greeting = firstName ? `Bonjour ${firstName},` : 'Bonjour,';

    return `
${greeting}

Nous avons reçu une demande de reinitialisation de votre mot de passe pour votre compte Y-MaD.

Pour creer un nouveau mot de passe, veuillez cliquer sur le lien suivant :
${resetLink}

Ce lien est valable pendant ${this.TOKEN_EXPIRY_MINUTES} minute(s).

Si vous n'etes pas a l'origine de cette demande, ignorez simplement cet email.

---
Y-MaD Association - Young for Madagascar Development
Carion, Antananarivo, Madagascar
Email: ymad.mg@gmail.com
Tel: +261 32 04 856 97
    `;
  }

  // ============================================================
  // TEMPLATE - CONFIRMATION DE REINITIALISATION (HTML)
  // ============================================================

  private getResetConfirmationHtml(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmation - Y-MaD</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Confirmation de reinitialisation</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">Bonjour ${firstName},</p>
          <p>Votre mot de passe a ete reinitialise avec succes.</p>
          <p>Si vous n'etes pas a l'origine de cette modification, veuillez nous contacter immediatement.</p>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Young for Madagascar Development</p>
        </div>
      </body>
      </html>
    `;
  }

  private getResetConfirmationText(firstName: string): string {
    return `
Bonjour ${firstName},

Votre mot de passe a ete reinitialise avec succes.

Si vous n'etes pas a l'origine de cette modification, veuillez nous contacter immediatement.

L'equipe Y-MaD
    `;
  }

  // ============================================================
  // TEMPLATE - BIENVENUE (HTML)
  // ============================================================

  private getWelcomeEmailHtml(firstName: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bienvenue chez Y-MaD</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Bienvenue dans la communaute Y-MaD</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">Bonjour ${firstName},</p>
          <p>Nous sommes ravis de vous accueillir au sein de la communaute Y-MaD !</p>
          <p>Votre inscription a ete confirmee avec succes. Vous pouvez maintenant :</p>
          <ul>
            <li>Consulter les offres d'emploi disponibles</li>
            <li>Postuler aux offres qui vous interessent</li>
            <li>Suivre vos candidatures en temps reel</li>
          </ul>
          <p>Pour commencer, connectez-vous a votre espace :</p>
          <div style="text-align: center;">
            <a href="${frontendUrl}/login" style="display: inline-block; background: #1E3A8A; color: white; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: 600;">
              Se connecter
            </a>
          </div>
          <p style="margin-top: 20px;">A tres bientot sur Y-MaD !</p>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Young for Madagascar Development</p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================================
  // TEMPLATE - BIENVENUE (TEXTE)
  // ============================================================

  private getWelcomeEmailText(firstName: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    return `
Bonjour ${firstName},

Nous sommes ravis de vous accueillir au sein de la communaute Y-MaD !

Votre inscription a ete confirmee avec succes.

Pour commencer, connectez-vous a votre espace :
${frontendUrl}/login

A tres bientot sur Y-MaD !

L'equipe Y-MaD
    `;
  }

  // ============================================================
  // TEMPLATE - CONFIRMATION DE CANDIDATURE (HTML)
  // ============================================================

  private getApplicationConfirmationEmailHtml(firstName: string, jobTitle: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmation de candidature - Y-MaD</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Confirmation de votre candidature</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">Bonjour ${firstName},</p>
          <p>Nous accusons reception de votre candidature pour le poste de :</p>
          <p style="font-size: 20px; font-weight: bold; color: #1E3A8A; text-align: center; padding: 10px; background: #eef2ff; border-radius: 8px;">
            ${jobTitle}
          </p>
          <p>Votre dossier est actuellement en cours d'examen par notre equipe.</p>
          <p>Nous vous tiendrons informer de l'avancement de votre candidature.</p>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Young for Madagascar Development</p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================================
  // TEMPLATE - CONFIRMATION DE CANDIDATURE (TEXTE)
  // ============================================================

  private getApplicationConfirmationEmailText(firstName: string, jobTitle: string): string {
    return `
Bonjour ${firstName},

Nous accusons reception de votre candidature pour le poste de :
${jobTitle}

Votre dossier est actuellement en cours d'examen par notre equipe.
Nous vous tiendrons informer de l'avancement de votre candidature.

L'equipe Y-MaD
    `;
  }

  // ============================================================
  // TEMPLATE - STATUT DE CANDIDATURE (HTML)
  // ============================================================

  private getApplicationStatusEmailHtml(firstName: string, jobTitle: string, status: string): string {
    const statusMessages: Record<string, { fr: string; color: string }> = {
      submitted: { fr: 'Recue', color: '#3B82F6' },
      reviewing: { fr: 'En cours d\'examen', color: '#F59E0B' },
      preselected: { fr: 'Preselectionnee', color: '#10B981' },
      rejected: { fr: 'Rejetee', color: '#EF4444' },
      hired: { fr: 'Recrute', color: '#059669' },
    };

    const statusInfo = statusMessages[status] || { fr: status, color: '#6B7280' };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Mise a jour - Y-MaD</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1E3A8A, #3B82F6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; }
          .status { display: inline-block; padding: 8px 25px; border-radius: 20px; font-weight: 600; color: white; background: ${statusInfo.color}; margin: 15px 0; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Mise a jour de votre candidature</p>
        </div>
        <div class="content">
          <p style="font-size: 18px;">Bonjour ${firstName},</p>
          <p>Le statut de votre candidature pour le poste de :</p>
          <p style="font-size: 18px; font-weight: bold; color: #1E3A8A;">${jobTitle}</p>
          <p>a ete mis a jour :</p>
          <div style="text-align: center;">
            <span class="status">${statusInfo.fr.toUpperCase()}</span>
          </div>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Young for Madagascar Development</p>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================================
  // TEMPLATE - STATUT DE CANDIDATURE (TEXTE)
  // ============================================================

  private getApplicationStatusEmailText(firstName: string, jobTitle: string, status: string): string {
    const statusMessages: Record<string, string> = {
      submitted: 'Recue',
      reviewing: 'En cours d\'examen',
      preselected: 'Preselectionnee',
      rejected: 'Rejetee',
      hired: 'Recrute',
    };

    const statusFr = statusMessages[status] || status;

    return `
Bonjour ${firstName},

Le statut de votre candidature pour le poste de :
${jobTitle}

a ete mis a jour : ${statusFr.toUpperCase()}

L'equipe Y-MaD
    `;
  }
}