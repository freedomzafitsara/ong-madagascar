import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class MemberPDFService {
  private readonly logger = new Logger(MemberPDFService.name);

  constructor(private readonly uploadService: UploadService) {}

  async generateMemberCard(member: any, user: any): Promise<string> {
    try {
      const doc = new PDFDocument({ size: 'A6', layout: 'landscape', margin: 10 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));

      return new Promise((resolve, reject) => {
        doc.on('end', async () => {
          try {
            const pdfBuffer = Buffer.concat(buffers);
            const filename = `carte_${member.memberNumber}.pdf`;
            const folder = 'ymad/members/cards';
            
            // Upload vers Cloudinary avec accès public
            const result = await this.uploadService.uploadGeneratedPDF(pdfBuffer, filename, folder);
            
            this.logger.log(`Carte membre générée: ${result.secureUrl}`);
            resolve(result.secureUrl);
          } catch (error) {
            this.logger.error(`Erreur upload: ${error.message}`);
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
      this.logger.error(`Erreur génération: ${error.message}`);
      throw new InternalServerErrorException('Impossible de générer la carte membre');
    }
  }

  private generatePDFContent(doc: PDFKit.PDFDocument, member: any, user: any): void {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Fond bleu Y-Mad
    doc.rect(0, 0, pageWidth, pageHeight).fill('#1E3A8A');
    
    // Bordure blanche
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10).stroke('#FFFFFF');

    doc.fillColor('#FFFFFF');

    // En-tête
    doc.fontSize(16).font('Helvetica-Bold').text('Y-MAD', 50, 25);
    doc.fontSize(8).text('Youthful Madagascar', 50, 45);

    // Titre
    doc.fontSize(12).font('Helvetica-Bold').text('CARTE MEMBRE', 50, 70);

    // Informations du membre
    doc.fontSize(10).font('Helvetica');
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    doc.text(`Nom: ${fullName || 'Membre Y-Mad'}`, 50, 95);
    doc.text(`N°: ${member.memberNumber}`, 50, 115);
    
    const typeLabels: Record<string, string> = {
      standard: 'Standard',
      premium: 'Premium',
      student: 'Etudiant',
      honorary: 'Honoraire'
    };
    doc.text(`Type: ${typeLabels[member.membershipType] || member.membershipType}`, 50, 135);
    
    const expiryDate = new Date(member.expiryDate);
    doc.text(`Valable jusqu'au: ${expiryDate.toLocaleDateString('fr-FR')}`, 50, 155);

    // Pied de page
    doc.fontSize(7);
    doc.text(
      'Association Y-Mad - Ensemble, construisons le Madagascar de demain',
      50,
      pageHeight - 20,
      { align: 'center', width: pageWidth - 100 }
    );
  }
}