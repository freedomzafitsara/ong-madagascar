import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class QRCodeService {
  private readonly logger = new Logger(QRCodeService.name);

  async generateQRCode(data: any): Promise<string> {
    try {
      const QRCode = await import('qrcode');
      
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
        width: 300,
        margin: 2,
        color: {
          dark: '#1E3A8A',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
      
      this.logger.log('Code QR généré avec succès');
      return qrCodeDataUrl;
    } catch (error) {
      this.logger.error(`Erreur lors de la génération du code QR: ${error.message}`);
      throw new InternalServerErrorException('Impossible de générer le code QR');
    }
  }

  generateQRCodeData(member: any): any {
    const fullName = `${member.user?.firstName || member.user?.first_name || ''} ${member.user?.lastName || member.user?.last_name || ''}`.trim();
    
    return {
      version: '1.0',
      id: member.id,
      memberNumber: member.memberNumber,
      name: fullName || 'Membre Y-Mad',
      email: member.user?.email || '',
      type: member.membershipType,
      validUntil: member.expiryDate,
      issuedAt: new Date().toISOString(),
      organization: 'Y-Mad',
    };
  }
}