// src/types/beneficiary.ts
export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: number;
  region: string;
  district: string;
  fokontany: string;
  educationLevel: 'primary' | 'secondary' | 'high_school' | 'university' | 'vocational';
  employmentStatus: 'employed' | 'unemployed' | 'student' | 'self_employed' | 'looking';
  
  // Mesure d'impact BEFORE Y-Mad
  beforeYmad: {
    income: number; // revenu mensuel avant (Ariary)
    skills: string[]; // compétences avant
    confidence: number; // 1-10
    networkSize: number; // nombre de contacts professionnels
    situation: string; // description de la situation avant
    challenges: string[]; // défis rencontrés
  };
  
  // Mesure d'impact AFTER Y-Mad
  afterYmad?: {
    income: number; // revenu mensuel après (Ariary)
    skills: string[]; // nouvelles compétences acquises
    confidence: number; // 1-10
    networkSize: number; // nombre de contacts professionnels
    situation: string; // description de la situation après
    achievements: string[]; // réalisations
    employmentFound?: {
      company: string;
      position: string;
      startDate: Date;
      salary: number;
    };
    businessCreated?: {
      name: string;
      type: string;
      employees: number;
      monthlyRevenue: number;
    };
  };
  
  projects: string[]; // IDs des projets
  status: 'active' | 'inactive' | 'graduated';
  joinedAt: Date;
  updatedAt: Date;
}

export interface BeneficiaryStats {
  totalBeneficiaries: number;
  averageIncomeIncrease: number;
  employmentRate: number;
  businessCreatedCount: number;
  byRegion: Record<string, number>;
  byAgeGroup: Record<string, number>;
}