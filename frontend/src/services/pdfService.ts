// src/services/pdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// ========================================
// TYPES CORRIGÉS
// ========================================

// Styles pour autoTable
interface Styles {
  textColor?: number[];
  fontSize?: number;
  fontStyle?: string;
  fillColor?: number[];
  halign?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  cellPadding?: number;
  lineWidth?: number;
  lineColor?: number[];
}

// Options pour autoTable
interface AutoTableOptions {
  startY?: number;
  head: string[][];
  body: (string | number)[][];
  theme?: 'striped' | 'grid' | 'plain';
  headStyles?: { fillColor?: number[]; textColor?: number[]; fontSize?: number; halign?: 'left' | 'center' | 'right' };
  bodyStyles?: Partial<Styles> | ((row: any) => Partial<Styles>);
  styles?: { fontSize?: number; cellPadding?: number };
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  columnStyles?: { [key: number]: { cellWidth?: number; fontStyle?: string } };
}

// Type correct pour le document jsPDF étendu - Version simplifiée pour éviter les conflits
interface ExtendedJsPDF {
  autoTable: (options: AutoTableOptions) => ExtendedJsPDF;
  lastAutoTable: { finalY: number };
  getNumberOfPages: () => number;
  setPage: (page: number) => ExtendedJsPDF;
  setFontSize: (size: number) => ExtendedJsPDF;
  setTextColor: (r: number, g: number, b: number) => ExtendedJsPDF;
  text: (text: string, x: number, y: number, options?: { align?: 'left' | 'center' | 'right' }) => ExtendedJsPDF;
  addImage: (imageData: string, format: string, x: number, y: number, width: number, height: number) => ExtendedJsPDF;
  rect: (x: number, y: number, width: number, height: number, style: string) => ExtendedJsPDF;
  setFillColor: (r: number, g: number, b: number) => ExtendedJsPDF;
  addPage: () => ExtendedJsPDF;
  output: (type: 'blob') => Blob;
  internal: {
    pageSize: {
      width: number;
      height: number;
    };
  };
}

// Types pour les données des rapports
interface ActivityReportData {
  period: { start: Date; end: Date };
  stats: {
    membersCount: number;
    eventsCount: number;
    projectsCount: number;
    beneficiariesCount: number;
    volunteersCount: number;
  };
  activities: Array<{
    title: string;
    date: string;
    participants: number;
    status: string;
  }>;
}

interface FinancialReportData {
  period: { start: Date; end: Date };
  revenues: Array<{ source: string; amount: number }>;
  expenses: Array<{ category: string; amount: number }>;
  totalRevenue: number;
  totalExpense: number;
  balance: number;
}

interface ImpactReportData {
  period: { start: Date; end: Date };
  beneficiaries: Array<{
    firstName: string;
    lastName: string;
    beforeIncome?: number;
    afterIncome?: number;
    employmentStatus?: string;
    afterYmad?: string;
  }>;
  impact: {
    employmentRate: number;
    averageIncomeIncrease: number;
    businessesCreated: number;
    trainingsCompleted: number;
  };
}

interface MemberCardData {
  memberNumber: string;
  name: string;
  membershipType: string;
  validUntil: Date;
  qrCodeData: string;
}

interface DonationReceiptData {
  receiptNumber: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  date: Date;
  projectName?: string;
}

// ========================================
// SERVICE PDF
// ========================================
export class PDFService {
  
  // ========================================
  // RAPPORT D'ACTIVITÉ
  // ========================================
  static async generateActivityReport(data: ActivityReportData): Promise<Blob> {
    // Créer un nouveau document
    const doc = new jsPDF() as unknown as ExtendedJsPDF;
    
    // Logo
    try {
      const logo = await this.getLogoBase64();
      if (logo) {
        doc.addImage(logo, 'PNG', 14, 10, 40, 40);
      }
    } catch (error) {
      console.error('Erreur logo:', error);
    }
    
    // En-tête
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("Rapport d'Activité Y-Mad", 105, 30, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Période: ${format(data.period.start, 'dd MMMM yyyy', { locale: fr })} - ${format(data.period.end, 'dd MMMM yyyy', { locale: fr })}`,
      105, 45, { align: 'center' }
    );
    doc.text(`Généré le: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 105, 52, { align: 'center' });
    
    // Indicateurs clés
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Indicateurs clés", 14, 70);
    
    autoTable(doc as any, {
      startY: 75,
      head: [['Indicateur', 'Valeur']],
      body: [
        ['Membres actifs', data.stats.membersCount.toString()],
        ['Événements organisés', data.stats.eventsCount.toString()],
        ['Projets en cours', data.stats.projectsCount.toString()],
        ['Jeunes bénéficiaires', data.stats.beneficiariesCount.toString()],
        ['Bénévoles engagés', data.stats.volunteersCount.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 10, halign: 'left' },
      styles: { fontSize: 9, cellPadding: 5 },
      margin: { left: 14, right: 14 }
    });
    
    // Activités détaillées
    let finalY = (doc as any).lastAutoTable?.finalY + 15 || 100;
    
    if (finalY > (doc.internal?.pageSize?.height || 280) - 50) {
      doc.addPage();
      finalY = 20;
    }
    
    doc.setFontSize(14);
    doc.text("Activités récentes", 14, finalY);
    
    const activityBody = data.activities.slice(0, 10).map(activity => [
      activity.title.length > 30 ? activity.title.substring(0, 30) + '...' : activity.title,
      format(new Date(activity.date), 'dd/MM/yyyy'),
      activity.participants?.toString() || '-',
      activity.status === 'completed' ? 'Terminé' : activity.status === 'upcoming' ? 'À venir' : 'En cours'
    ]);
    
    autoTable(doc as any, {
      startY: finalY + 5,
      head: [['Activité', 'Date', 'Participants', 'Statut']],
      body: activityBody,
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 4 }
    });
    
    // Pied de page
    this.addFooter(doc);
    
    return doc.output('blob');
  }
  
  // ========================================
  // RAPPORT FINANCIER
  // ========================================
  static async generateFinancialReport(data: FinancialReportData): Promise<Blob> {
    const doc = new jsPDF() as unknown as ExtendedJsPDF;
    
    try {
      const logo = await this.getLogoBase64();
      if (logo) {
        doc.addImage(logo, 'PNG', 14, 10, 40, 40);
      }
    } catch (error) {
      console.error('Erreur logo:', error);
    }
    
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("Rapport Financier Y-Mad", 105, 30, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Période: ${format(data.period.start, 'dd MMMM yyyy', { locale: fr })} - ${format(data.period.end, 'dd MMMM yyyy', { locale: fr })}`,
      105, 45, { align: 'center' }
    );
    
    // Résumé financier
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Résumé financier", 14, 70);
    
    autoTable(doc as any, {
      startY: 75,
      head: [['Poste', 'Montant (Ar)']],
      body: [
        ['Total revenus', data.totalRevenue.toLocaleString()],
        ['Total dépenses', data.totalExpense.toLocaleString()],
        ['Solde', data.balance.toLocaleString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] }
    });
    
    let finalY = (doc as any).lastAutoTable?.finalY + 15 || 100;
    
    if (finalY > (doc.internal?.pageSize?.height || 280) - 80) {
      doc.addPage();
      finalY = 20;
    }
    
    // Détail des revenus
    doc.setFontSize(14);
    doc.setTextColor(0, 100, 0);
    doc.text("Détail des revenus", 14, finalY);
    
    autoTable(doc as any, {
      startY: finalY + 5,
      head: [['Source', 'Montant (Ar)']],
      body: data.revenues.map(rev => [rev.source, rev.amount.toLocaleString()]),
      theme: 'striped',
      headStyles: { fillColor: [0, 128, 0], textColor: [255, 255, 255] }
    });
    
    finalY = (doc as any).lastAutoTable?.finalY + 15 || 200;
    
    if (finalY > (doc.internal?.pageSize?.height || 280) - 50) {
      doc.addPage();
      finalY = 20;
    }
    
    // Détail des dépenses
    doc.setFontSize(14);
    doc.setTextColor(139, 0, 0);
    doc.text("Détail des dépenses", 14, finalY);
    
    autoTable(doc as any, {
      startY: finalY + 5,
      head: [['Catégorie', 'Montant (Ar)']],
      body: data.expenses.map(exp => [exp.category, exp.amount.toLocaleString()]),
      theme: 'striped',
      headStyles: { fillColor: [139, 0, 0], textColor: [255, 255, 255] }
    });
    
    this.addFooter(doc);
    
    return doc.output('blob');
  }
  
  // ========================================
  // RAPPORT D'IMPACT SOCIAL
  // ========================================
  static async generateImpactReport(data: ImpactReportData): Promise<Blob> {
    const doc = new jsPDF() as unknown as ExtendedJsPDF;
    
    try {
      const logo = await this.getLogoBase64();
      if (logo) {
        doc.addImage(logo, 'PNG', 14, 10, 40, 40);
      }
    } catch (error) {
      console.error('Erreur logo:', error);
    }
    
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text("Rapport d'Impact Social Y-Mad", 105, 30, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Période: ${format(data.period.start, 'dd MMMM yyyy', { locale: fr })} - ${format(data.period.end, 'dd MMMM yyyy', { locale: fr })}`,
      105, 45, { align: 'center' }
    );
    
    // Indicateurs d'impact
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Indicateurs d'impact clés", 14, 70);
    
    autoTable(doc as any, {
      startY: 75,
      head: [['Indicateur', 'Valeur']],
      body: [
        ["Taux d'emploi après Y-Mad", `${data.impact.employmentRate.toFixed(1)}%`],
        ["Augmentation moyenne des revenus", `${data.impact.averageIncomeIncrease.toLocaleString()} Ar`],
        ["Entreprises créées", data.impact.businessesCreated.toString()],
        ["Formations complétées", data.impact.trainingsCompleted.toString()],
        ["Total bénéficiaires", data.beneficiaries.length.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] }
    });
    
    let finalY = (doc as any).lastAutoTable?.finalY + 15 || 100;
    
    if (finalY > (doc.internal?.pageSize?.height || 280) - 100) {
      doc.addPage();
      finalY = 20;
    }
    
    // Top bénéficiaires
    const topBeneficiaries = data.beneficiaries
      .filter(b => b.afterIncome && b.beforeIncome && b.afterIncome > b.beforeIncome)
      .sort((a, b) => ((b.afterIncome || 0) - (b.beforeIncome || 0)) - ((a.afterIncome || 0) - (a.beforeIncome || 0)))
      .slice(0, 5);
    
    if (topBeneficiaries.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Top bénéficiaires par progression", 14, finalY);
      
      autoTable(doc as any, {
        startY: finalY + 5,
        head: [['Nom', 'Avant (Ar)', 'Après (Ar)', 'Progression']],
        body: topBeneficiaries.map(b => [
          `${b.firstName} ${b.lastName}`,
          (b.beforeIncome || 0).toLocaleString(),
          (b.afterIncome || 0).toLocaleString(),
          `+${((b.afterIncome || 0) - (b.beforeIncome || 0)).toLocaleString()} Ar`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 51], textColor: [255, 255, 255] }
      });
      
      finalY = (doc as any).lastAutoTable?.finalY + 15 || 200;
    }
    
    // Témoignages
    const testimonials = data.beneficiaries.filter(b => b.afterYmad && b.afterYmad.length > 10).slice(0, 3);
    
    if (testimonials.length > 0 && finalY < (doc.internal?.pageSize?.height || 280) - 80) {
      if (finalY > (doc.internal?.pageSize?.height || 280) - 100) {
        doc.addPage();
        finalY = 20;
      }
      
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Témoignages", 14, finalY);
      
      testimonials.forEach((beneficiary, index) => {
        const y = finalY + 10 + (index * 35);
        if (y > (doc.internal?.pageSize?.height || 280) - 30) {
          return;
        }
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text(`• ${beneficiary.firstName} ${beneficiary.lastName}:`, 20, y);
        
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        const situation = beneficiary.afterYmad?.substring(0, 70) || '';
        doc.text(`"${situation}..."`, 20, y + 6);
      });
    }
    
    this.addFooter(doc);
    
    return doc.output('blob');
  }
  
  // ========================================
  // CARTE MEMBRE PDF AVEC QR CODE
  // ========================================
  static async generateMemberCard(data: MemberCardData): Promise<Blob> {
    const doc = new jsPDF({
      format: 'a6',
      unit: 'mm'
    }) as unknown as ExtendedJsPDF;
    
    try {
      const logo = await this.getLogoBase64();
      
      // Fond
      doc.setFillColor(0, 51, 102);
      doc.rect(0, 0, 105, 148, 'F');
      
      // Logo
      if (logo) {
        doc.addImage(logo, 'PNG', 10, 10, 25, 25);
      }
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("Y-MAD", 40, 20);
      doc.setFontSize(8);
      doc.text("Youthful Madagascar", 40, 27);
      
      doc.setFontSize(10);
      doc.text("CARTE MEMBRE", 40, 38);
      
      // Informations membre
      doc.setFontSize(12);
      doc.text(data.name, 10, 55);
      
      doc.setFontSize(9);
      doc.text(`N° Membre: ${data.memberNumber}`, 10, 65);
      const membershipLabel = data.membershipType === 'premium' ? 'Premium' : data.membershipType === 'standard' ? 'Standard' : 'Honoraire';
      doc.text(`Type: ${membershipLabel}`, 10, 72);
      doc.text(`Valable jusqu'au: ${format(data.validUntil, 'dd/MM/yyyy')}`, 10, 79);
      
      // QR Code
      try {
        const qrCodeImage = await this.generateQRCode(data.qrCodeData);
        doc.addImage(qrCodeImage, 'PNG', 65, 50, 30, 30);
      } catch (error) {
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("QR Code", 78, 70);
        doc.setFontSize(6);
        doc.text(data.memberNumber.substring(0, 15), 70, 80);
      }
      
      // Pied de page
      doc.setFontSize(7);
      doc.text("Cette carte est strictement personnelle", 10, 140);
      doc.text("Présentez-la lors de vos activités Y-Mad", 10, 145);
    } catch (error) {
      console.error('Erreur génération carte:', error);
    }
    
    return doc.output('blob');
  }
  
  // ========================================
  // REÇU DE DON
  // ========================================
  static async generateDonationReceipt(data: DonationReceiptData): Promise<Blob> {
    const doc = new jsPDF() as unknown as ExtendedJsPDF;
    
    try {
      const logo = await this.getLogoBase64();
      if (logo) {
        doc.addImage(logo, 'PNG', 14, 10, 40, 40);
      }
    } catch (error) {
      console.error('Erreur logo:', error);
    }
    
    doc.setFontSize(22);
    doc.setTextColor(0, 51, 102);
    doc.text("REÇU DE DON", 105, 30, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`N° ${data.receiptNumber}`, 105, 40, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Merci pour votre générosité !", 105, 55, { align: 'center' });
    
    let y = 75;
    
    autoTable(doc as any, {
      startY: y,
      body: [
        ['Nom du donateur', data.donorName],
        ['Email', data.donorEmail],
        ['Montant', `${data.amount.toLocaleString()} ${data.currency}`],
        ['Date', format(data.date, 'dd/MM/yyyy')],
        ['Projet', data.projectName || 'Général Y-Mad'],
      ],
      theme: 'plain',
      styles: { fontSize: 11, cellPadding: 5 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });
    
    y = (doc as any).lastAutoTable?.finalY + 15 || 120;
    
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(
      "Ce reçu vous sera utile pour toute déduction fiscale.",
      105,
      y,
      { align: 'center' }
    );
    
    doc.text(
      "Y-Mad - Association enregistrée N° 001/MG/2025",
      105,
      y + 8,
      { align: 'center' }
    );
    
    this.addFooter(doc);
    
    return doc.output('blob');
  }
  
  // ========================================
  // MÉTHODES PRIVÉES
  // ========================================
  
  private static addFooter(doc: ExtendedJsPDF): void {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const pageWidth = doc.internal?.pageSize?.width || 210;
      const pageHeight = doc.internal?.pageSize?.height || 297;
      doc.text(
        `Y-Mad - Youthful Madagascar - ${format(new Date(), 'yyyy')}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(`Page ${i} / ${pageCount}`, pageWidth - 20, pageHeight - 10);
    }
  }
  
  private static async getLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/images/logo.png');
      if (!response.ok) return null;
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erreur chargement logo:', error);
      return null;
    }
  }
  
  private static async generateQRCode(data: string): Promise<string> {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Erreur génération QR code');
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Erreur lecture QR code'));
      reader.readAsDataURL(blob);
    });
  }
}

export default PDFService;