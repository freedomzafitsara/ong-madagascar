import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private apiKey: string;
  private senderEmail: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get('BREVO_API_KEY');
    this.senderEmail = this.configService.get('BREVO_SENDER_EMAIL', 'noreply@y-mad.mg');
  }

  async sendResetPasswordEmail(to: string, name: string, token: string): Promise<boolean> {
    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    
    // Template HTML de l'email
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Réinitialisation mot de passe - Y-Mad</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="500" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <!-- En-tête -->
                <tr>
                  <td style="background-color: #2563eb; padding: 30px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Y-Mad</h1>
                    <p style="color: #dbeafe; margin: 10px 0 0 0;">Youthful Madagascar</p>
                  </td>
                </tr>
                <!-- Contenu -->
                <tr>
                  <td style="padding: 30px 25px;">
                    <h2 style="color: #1f2937; margin: 0 0 15px 0;">Bonjour ${name},</h2>
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 20px 0;">
                      Nous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte Y-Mad.
                    </p>
                    <p style="color: #4b5563; line-height: 1.6; margin: 0 0 25px 0;">
                      Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" 
                         style="background-color: #2563eb; color: #ffffff; padding: 12px 30px; 
                                text-decoration: none; border-radius: 6px; font-weight: bold; 
                                display: inline-block;">
                        Réinitialiser mon mot de passe
                      </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 20px 0 0 0;">
                      Ce lien est valable pendant <strong>1 heure</strong>.<br>
                      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0 15px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                      Y-Mad - Ensemble, construisons le Madagascar de demain
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      // Appel à l'API Brevo (Sendinblue)
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          sender: { email: this.senderEmail, name: 'Y-Mad' },
          to: [{ email: to, name: name }],
          subject: 'Réinitialisation de votre mot de passe Y-Mad',
          htmlContent: htmlContent,
        }),
      });

      if (response.ok) {
        console.log(`✅ Email de réinitialisation envoyé à ${to}`);
        return true;
      } else {
        const error = await response.text();
        console.error('❌ Erreur Brevo:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur envoi email:', error);
      return false;
    }
  }
}