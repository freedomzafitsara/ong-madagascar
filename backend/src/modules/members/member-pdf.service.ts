// backend/src/modules/members/member-pdf.service.ts
import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

@Injectable()
export class MemberPDFService {
  async generateMemberCard(member: any, user: any): Promise<string> {
    const doc = new PDFDocument({ size: 'A6', layout: 'landscape' });
    const filename = `carte_${member.memberNumber}.pdf`;
    const filepath = path.join(process.cwd(), 'uploads', 'members', filename);
    
    doc.pipe(fs.createWriteStream(filepath));
    
    // Fond bleu Y-Mad
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#1E3A8A');
    
    // Texte "CARTE MEMBRE"
    doc.fillColor('white').fontSize(16).text('CARTE MEMBRE', 50, 30);
    
    // Nom du membre
    doc.fontSize(12).text(`${user.firstName} ${user.lastName}`, 50, 70);
    
    // Numéro de membre
    doc.fontSize(10).text(`N°: ${member.memberNumber}`, 50, 100);
    
    // Date d'expiration
    doc.fontSize(10).text(`Valable jusqu'au: ${new Date(member.endDate).toLocaleDateString('fr-FR')}`, 50, 120);
    
    // QR Code
    const qrBuffer = await QRCode.toBuffer(member.memberNumber);
    doc.image(qrBuffer, 150, 60, { width: 80 });
    
    doc.end();
    
    return `/uploads/members/${filename}`;
  }
}