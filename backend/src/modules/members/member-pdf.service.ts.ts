// backend/src/modules/members/member-pdf.service.ts
// CORRECTION - Ajouter creation automatique du dossier

import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

@Injectable()
export class MemberPDFService {
  async generateMemberCard(member: any, user: any): Promise<string> {
    // Creer le dossier s'il n'existe pas (CORRECTION)
    const uploadDir = path.join(process.cwd(), 'uploads', 'members');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('Dossier cree:', uploadDir);
    }

    const filename = `carte_${member.memberNumber}.pdf`;
    const filepath = path.join(uploadDir, filename);
    
    console.log('Generation PDF:', filepath);
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A6', layout: 'landscape', margin: 10 });
      const stream = fs.createWriteStream(filepath);
      
      doc.pipe(stream);
      
      // Fond bleu Y-Mad
      doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1E3A8A');
      
      // Bordure blanche
      doc.rect(5, 5, doc.page.width - 10, doc.page.height - 10).stroke('#FFFFFF');
      
      // Texte "CARTE MEMBRE"
      doc.fillColor('white').fontSize(16).font('Helvetica-Bold').text('CARTE MEMBRE', 50, 25);
      
      // Nom du membre
      doc.fontSize(12).font('Helvetica').text(`${user.firstName} ${user.lastName}`, 50, 65);
      
      // Numero de membre
      doc.fontSize(10).text(`N°: ${member.memberNumber}`, 50, 95);
      
      // Date d'expiration
      const expiryDate = member.expiryDate || member.endDate;
      doc.fontSize(10).text(`Valable jusqu'au: ${new Date(expiryDate).toLocaleDateString('fr-FR')}`, 50, 115);
      
      // Type de membre
      doc.fontSize(10).text(`Type: ${member.membershipType}`, 50, 135);
      
      // Generer et ajouter QR Code
      QRCode.toBuffer(member.memberNumber, { width: 100 })
        .then(qrBuffer => {
          doc.image(qrBuffer, doc.page.width - 110, 50, { width: 80 });
          doc.end();
        })
        .catch(err => {
          console.error('Erreur QR Code:', err);
          doc.end();
        });
      
      stream.on('finish', () => {
        console.log('PDF generee:', filename);
        resolve(`/uploads/members/${filename}`);
      });
      
      stream.on('error', (err) => {
        console.error('Erreur ecriture PDF:', err);
        reject(err);
      });
    });
  }
}