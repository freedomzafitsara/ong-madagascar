import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QRCodeService {
  async generateQRCode(data: any): Promise<string> {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(data), {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e3a8a',
          light: '#ffffff',
        },
      });
      return qrCodeDataUrl;
    } catch (error) {
      console.error('Erreur génération QR code:', error);
      throw error;
    }
  }

  generateQRCodeData(member: any): any {
    return {
      id: member.id,
      memberNumber: member.memberNumber,
      name: `${member.user?.firstName} ${member.user?.lastName}`,
      email: member.user?.email,
      type: member.membershipType,
      validUntil: member.expiryDate,
      issuedAt: new Date(),
    };
  }
}