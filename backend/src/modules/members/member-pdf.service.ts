import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class MemberPDFService {
  private readonly logger = new Logger(MemberPDFService.name);

  constructor(private readonly uploadService: UploadService) {}

  async generateMemberCard(member: any, user: any): Promise<string> {
    try {
      const doc = new PDFDocument({ size: 'A6', layout: 'landscape', margin: 20 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));

      return new Promise((resolve, reject) => {
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(buffers);
            
            const filename = `carte_${member.memberNumber}.pdf`;
            const folder = `ymad/members/cards`;
            
            const result = await this.uploadService.uploadGeneratedPDF(pdfBuffer, filename, folder);
            
            this.logger.log(`Carte membre générée: ${result.secureUrl}`);
            resolve(result.secureUrl);
          } catch (error) {
            this.logger.error(`Erreur lors de l upload de la carte: ${error.message}`);
            reject(new InternalServerErrorException('Erreur lors de la génération de la carte'));
          }
        });

        doc.on('error', (error) => {
          this.logger.error(`Erreur PDF: ${error.message}`);
          reject(new InternalServerErrorException('Erreur lors de la création du PDF'));
        });

        this.generatePDFContent(doc, member, user);
        doc.end();
      });
    } catch (error) {
      this.logger.error(`Erreur génération carte membre: ${error.message}`);
      throw new InternalServerErrorException('Impossible de générer la carte membre');
    }
  }

  private generatePDFContent(doc: PDFKit.PDFDocument, member: any, user: any): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.rect(0, 0, pageWidth, pageHeight).fill('#1E3A8A');

    doc.fillColor('#FFFFFF');

    doc.fontSize(18).text('Y-MAD', 50, 25, { align: 'left' });
    doc.fontSize(10).text('Youthful Madagascar', 50, 45, { align: 'left' });

    doc.fontSize(8).text('CARTE MEMBRE', 50, 70);

    doc.fontSize(12).font('Helvetica-Bold');
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    doc.text(fullName, 50, 90);

    doc.fontSize(9).font('Helvetica');
    doc.text(`Numero: ${member.memberNumber}`, 50, 115);
    doc.text(`Type: ${this.getMembershipTypeLabel(member.membershipType)}`, 50, 130);
    
    const expiryDate = new Date(member.expiryDate);
    doc.text(`Valable jusqu au: ${expiryDate.toLocaleDateString('fr-FR')}`, 50, 145);
    doc.text(`Depuis le: ${new Date(member.startDate).toLocaleDateString('fr-FR')}`, 50, 160);

    doc.fontSize(7).text('Association Y-Mad - Ensemble, construisons le Madagascar de demain', 50, pageHeight - 20, {
      align: 'center',
      width: pageWidth - 100,
    });
  }

  private getMembershipTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      standard: 'Standard',
      premium: 'Premium',
      student: 'Etudiant',
      honorary: 'Honoraire',
    };
    return labels[type] || type;
  }
}