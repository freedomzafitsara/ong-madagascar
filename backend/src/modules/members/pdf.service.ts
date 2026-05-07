import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PDFService {
  async generateMemberCard(member: any, qrCodeUrl: string): Promise<string> {
    const fileName = `member_card_${member.memberNumber}.pdf`;
    const filePath = path.join(__dirname, '../../../uploads/members', fileName);
    
    // Créer le dossier s'il n'existe pas
    const dir = path.join(__dirname, '../../../uploads/members');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A6', margin: 10 });
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      // Fond bleu clair
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#e0f2fe');
      
      // Bordure
      doc.rect(5, 5, doc.page.width - 10, doc.page.height - 10).stroke('#1e3a8a');
      
      // Titre
      doc.fontSize(14).fillColor('#1e3a8a').text('Y-Mad Madagascar', { align: 'center' });
      doc.fontSize(10).fillColor('#475569').text('Carte Membre', { align: 'center' });
      
      doc.moveDown();
      
      // Informations
      doc.fontSize(9).fillColor('#1f2937');
      doc.text(`N° Membre: ${member.memberNumber}`);
      doc.text(`Nom: ${member.user?.firstName} ${member.user?.lastName}`);
      doc.text(`Email: ${member.user?.email}`);
      doc.text(`Type: ${member.membershipType}`);
      doc.text(`Valide jusqu'au: ${new Date(member.expiryDate).toLocaleDateString()}`);
      
      doc.moveDown();
      
      // QR Code
      if (qrCodeUrl) {
        const base64Data = qrCodeUrl.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');
        doc.image(imageBuffer, doc.page.width / 2 - 40, doc.y, { width: 80 });
      }
      
      doc.end();
      
      stream.on('finish', () => {
        resolve(`/uploads/members/${fileName}`);
      });
      
      stream.on('error', reject);
    });
  }
}