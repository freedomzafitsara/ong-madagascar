// backend/src/modules/email/email.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private isConnected = false;

  private readonly TOKEN_EXPIRY_MINUTES = 15;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.sendgrid.net');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER', 'apikey');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (!pass || pass === 'votre-mot-de-passe' || !pass.includes('SG.')) {
      this.logger.warn('Cle API SendGrid manquante ou invalide dans le fichier .env');
    }

    this.logger.log(`Configuration SMTP: ${host}:${port}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
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
      this.logger.error('Erreur de connexion SMTP:', error.message);
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.isConnected) {
      await this.verifyConnection();
    }
    if (!this.isConnected) {
      throw new Error('Service email non disponible');
    }
  }

  // ============================================================
  // ENVOI D'EMAIL GENERIQUE
  // ============================================================

  async sendEmail(data: { to: string; subject: string; html: string }): Promise<{ success: boolean; messageId?: string }> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM', 'ymad.mg@gmail.com');
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Y-MaD Association');

    try {
      const info = await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: data.to,
        subject: data.subject,
        html: data.html,
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'normal',
          'X-Mailer': 'Y-MaD Platform',
        },
      });

      this.logger.log(`Email envoye a ${data.to}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error(`Erreur envoi email a ${data.to}:`, error.message);
      return { success: false };
    }
  }

  // ============================================================
  // ✅ ENVOI D'EMAIL DE BIENVENUE
  // ============================================================

  async sendWelcomeEmail(to: string, firstName: string): Promise<void> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM', 'ymad.mg@gmail.com');
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Y-MaD Association');

    const subject = 'Bienvenue sur Y-MaD !';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bienvenue sur Y-MaD</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1E3A8A; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Young for Madagascar Development</p>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Nous sommes ravis de vous accueillir sur la plateforme Y-MaD !</p>
          <p>Votre compte a ete cree avec succes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/login" class="button">Se connecter</a>
          </div>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Carion, Antananarivo, Madagascar</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email de bienvenue envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de bienvenue a ${to}:`, error.message);
    }
  }

  // ============================================================
  // ✅ ENVOI D'EMAIL DE REINITIALISATION DU MOT DE PASSE
  // ============================================================

  async sendResetPasswordEmail(to: string, token: string, firstName?: string): Promise<void> {
    await this.ensureConnected();

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;
    const fromEmail = this.configService.get<string>('SMTP_FROM', 'ymad.mg@gmail.com');
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Y-MaD Association');

    const subject = 'Reinitialisation de votre mot de passe - Y-MaD';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reinitialisation du mot de passe</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #1E3A8A; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; }
          .security-note { background: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Young for Madagascar Development</p>
        </div>
        <div class="content">
          <h2>${firstName ? `Bonjour ${firstName},` : 'Bonjour,'}</h2>
          <p>Nous avons recu une demande de reinitialisation de votre mot de passe.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" class="button">Reinitialiser mon mot de passe</a>
          </div>
          <div class="security-note">
            <strong>Lien securise</strong><br>
            Ce lien est valable pendant <strong>15 minutes</strong>.<br>
            Si vous n'etes pas a l'origine de cette demande, ignorez cet email.
          </div>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Carion, Antananarivo, Madagascar</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email de reinitialisation envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de reinitialisation a ${to}:`, error.message);
    }
  }

  // ============================================================
  // ENVOI D'EMAIL DE STATUT DE CANDIDATURE
  // ============================================================

  async sendApplicationStatusEmail(
    to: string,
    firstName: string,
    jobTitle: string,
    status: 'accepted' | 'rejected' | 'shortlisted' | 'reviewing'
  ): Promise<void> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM', 'ymad.mg@gmail.com');
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Y-MaD Association');

    const statusLabels: Record<string, { fr: string; color: string }> = {
      accepted: { fr: 'Acceptee', color: '#22c55e' },
      rejected: { fr: 'Refusee', color: '#ef4444' },
      shortlisted: { fr: 'Preselectionnee', color: '#3b82f6' },
      reviewing: { fr: 'En revision', color: '#f59e0b' },
    };

    const statusInfo = statusLabels[status] || { fr: status, color: '#6b7280' };
    const subject = `Mise a jour de votre candidature - ${jobTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Mise a jour de votre candidature</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
          .status { display: inline-block; padding: 8px 25px; border-radius: 20px; font-weight: 600; color: white; background: ${statusInfo.color}; margin: 15px 0; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Young for Madagascar Development</p>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Le statut de votre candidature pour le poste de :</p>
          <p style="font-size: 18px; font-weight: bold; color: #1E3A8A; text-align: center;">${jobTitle}</p>
          <p>a ete mis a jour :</p>
          <div style="text-align: center;">
            <span class="status">${statusInfo.fr.toUpperCase()}</span>
          </div>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Carion, Antananarivo, Madagascar</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email de statut de candidature envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de statut a ${to}:`, error.message);
    }
  }

  // ============================================================
  // ENVOI D'EMAIL DE REPONSE PERSONNALISEE
  // ============================================================

  async sendCustomReplyEmail(
    to: string,
    firstName: string,
    jobTitle: string,
    replyMessage: string
  ): Promise<void> {
    await this.ensureConnected();

    const fromEmail = this.configService.get<string>('SMTP_FROM', 'ymad.mg@gmail.com');
    const fromName = this.configService.get<string>('SMTP_FROM_NAME', 'Y-MaD Association');

    const subject = `Reponse a votre candidature - ${jobTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reponse a votre candidature</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1E3A8A; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
          .reply-box { background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Y-MaD</h1>
          <p>Young for Madagascar Development</p>
        </div>
        <div class="content">
          <h2>Bonjour ${firstName},</h2>
          <p>Nous faisons suite a votre candidature pour le poste de :</p>
          <p style="font-size: 18px; font-weight: bold; color: #1E3A8A; text-align: center;">${jobTitle}</p>
          <div class="reply-box">
            <p><strong>Reponse de l'equipe Y-MaD</strong></p>
            <p>${replyMessage}</p>
          </div>
          <p style="color: #64748b;">L'equipe Y-MaD</p>
        </div>
        <div class="footer">
          <p>© 2025 Y-MaD Association - Carion, Antananarivo, Madagascar</p>
        </div>
      </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to,
        subject,
        html,
      });
      this.logger.log(`Email de reponse personnalisee envoye a ${to}`);
    } catch (error) {
      this.logger.error(`Erreur envoi email de reponse a ${to}:`, error.message);
    }
  }
}