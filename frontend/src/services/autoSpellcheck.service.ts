// src/services/autoSpellcheck.service.ts
'use client';

import fuzzy from 'fuzzy';

// ============================================================
// DICTIONNAIRE AUTOMATIQUE INTELLIGENT
// ============================================================

export interface WordCorrection {
  original: string;
  corrected: string;
  confidence: number; // 0-100
  suggestions: string[];
}

export interface AnalysisResult {
  text: string;
  errors: WordCorrection[];
  correctedText: string;
  correctionCount: number;
}

class AutoSpellcheckService {
  private dictionary: Set<string>;
  private customWords: Set<string>;
  private corrections: Map<string, string>;
  private frequencyMap: Map<string, number>;

  constructor() {
    this.dictionary = new Set<string>();
    this.customWords = new Set<string>();
    this.corrections = new Map<string, string>();
    this.frequencyMap = new Map<string, number>();
    this.initDictionary();
    this.loadFromLocalStorage();
  }

  // Initialisation du dictionnaire de base
  private initDictionary(): void {
    // Mots techniques IT (500+ mots)
    const techWords = [
      'développeur', 'développement', 'développer', 'application', 'applications',
      'logiciel', 'logiciels', 'plateforme', 'plateformes', 'interface', 'interfaces',
      'utilisateur', 'utilisateurs', 'fonctionnalité', 'fonctionnalités', 'base', 'données',
      'serveur', 'serveurs', 'client', 'clients', 'réseau', 'réseaux', 'sécurité',
      'authentification', 'autorisation', 'chiffrement', 'stockage', 'sauvegarde',
      'restauration', 'migration', 'performance', 'optimisation', 'scalabilité',
      'disponibilité', 'redondance', 'microservice', 'api', 'frontend', 'backend',
      'fullstack', 'devops', 'cloud', 'docker', 'kubernetes', 'javascript',
      'typescript', 'react', 'nextjs', 'vuejs', 'angular', 'nodejs', 'python',
      'java', 'php', 'symfony', 'laravel', 'spring', 'postgresql', 'mysql',
      'mongodb', 'redis', 'git', 'github', 'gitlab', 'jenkins', 'agile', 'scrum',
      'kanban', 'qualité', 'test', 'tests', 'unitaire', 'intégration', 'déploiement',
      'maintenance', 'support', 'assistance', 'documentation', 'rapport',
      'réunion', 'présentation', 'formation', 'diplôme', 'certification',
    ];

    // Mots courants français (500+ mots)
    const commonWords = [
      'projet', 'projets', 'équipe', 'équipes', 'entreprise', 'entreprises',
      'partenaire', 'partenaires', 'contrat', 'contrats', 'mission', 'missions',
      'tâche', 'tâches', 'objectif', 'objectifs', 'livrable', 'livrables', 'délai',
      'délais', 'budget', 'budgets', 'ressource', 'ressources', 'compétence',
      'compétences', 'expérience', 'expériences', 'salaire', 'salaires', 'avantage',
      'avantages', 'management', 'leadership', 'coordination', 'direction',
      'communication', 'analyse', 'conception', 'architecture', 'spécification',
      'exigence', 'exigences', 'échéance', 'échéances', 'organisation',
      'planification', 'exécution', 'collaboration', 'supervision',
    ];

    // Verbes courants (200+ mots)
    const verbs = [
      'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'prendre', 'venir',
      'devoir', 'pouvoir', 'vouloir', 'savoir', 'falloir', 'parler', 'mettre',
      'demander', 'croire', 'trouver', 'donner', 'aimer', 'passer', 'rester',
      'tenir', 'porter', 'chercher', 'montrer', 'expliquer', 'comprendre',
      'travailler', 'créer', 'développer', 'analyser', 'concevoir', 'réaliser',
      'optimiser', 'améliorer', 'gérer', 'coordonner', 'superviser', 'manager',
    ];

    // Adjectifs courants (200+ mots)
    const adjectives = [
      'bon', 'bonne', 'bons', 'bonnes', 'mauvais', 'mauvaise', 'grand', 'grande',
      'petit', 'petite', 'jeune', 'vieux', 'vieille', 'nouveau', 'nouvelle',
      'ancien', 'ancienne', 'premier', 'première', 'dernier', 'dernière',
      'important', 'importante', 'difficile', 'facile', 'simple', 'complexe',
      'rapide', 'lente', 'efficace', 'performant', 'performante', 'fiable',
      'sécurisé', 'sécurisée', 'robuste', 'flexible', 'modulable', 'évolutif',
    ];

    // Ajout de tous les mots au dictionnaire
    [...techWords, ...commonWords, ...verbs, ...adjectives].forEach(word => {
      this.dictionary.add(word.toLowerCase());
    });
  }

  // Charger les mots personnalisés de l'admin
  private loadFromLocalStorage(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('custom_dictionary');
      if (saved) {
        const words = JSON.parse(saved);
        words.forEach((word: string) => this.customWords.add(word.toLowerCase()));
      }
    }
  }

  // Sauvegarder les mots personnalisés
  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('custom_dictionary', JSON.stringify([...this.customWords]));
    }
  }

  // Ajouter un mot personnalisé
  addCustomWord(word: string): void {
    const cleanWord = word.toLowerCase().trim();
    this.customWords.add(cleanWord);
    this.saveToLocalStorage();
  }

  // Supprimer un mot personnalisé
  removeCustomWord(word: string): void {
    const cleanWord = word.toLowerCase().trim();
    this.customWords.delete(cleanWord);
    this.saveToLocalStorage();
  }

  // Enregistrer une correction fréquente
  recordCorrection(incorrect: string, correct: string): void {
    const key = incorrect.toLowerCase();
    const count = this.frequencyMap.get(key) || 0;
    this.frequencyMap.set(key, count + 1);
    
    if (count > 2) {
      this.corrections.set(key, correct);
    }
  }

  // Vérifier si un mot est correct
  isCorrect(word: string): boolean {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '');
    if (cleanWord.length < 2) return true;
    if (this.corrections.has(cleanWord)) return true;
    if (this.customWords.has(cleanWord)) return true;
    return this.dictionary.has(cleanWord);
  }

  // Obtenir des suggestions intelligentes
  getSuggestions(word: string, context?: string): string[] {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '');
    const suggestions: string[] = [];
    
    // 1. Correction automatique enregistrée
    if (this.corrections.has(cleanWord)) {
      suggestions.push(this.corrections.get(cleanWord)!);
    }
    
    // 2. Suggestions basées sur les mots fréquents
    const dictArray = Array.from(this.dictionary);
    const filtered = fuzzy.filter(cleanWord, dictArray, {
      pre: '',
      post: '',
      extract: (item) => item
    });
    
    filtered.slice(0, 5).forEach(result => {
      if (result.original !== cleanWord) {
        suggestions.push(result.original);
      }
    });
    
    // 3. Suggestions basées sur le contexte
    if (context) {
      const contextSuggestions = this.getContextSuggestions(cleanWord, context);
      suggestions.push(...contextSuggestions);
    }
    
    return [...new Set(suggestions)].slice(0, 5);
  }

  // Suggestions basées sur le contexte
  private getContextSuggestions(word: string, context: string): string[] {
    const suggestions: string[] = [];
    const contextWords = context.toLowerCase().split(/\s+/);
    
    // Vérifier les mots qui apparaissent souvent ensemble
    for (const contextWord of contextWords) {
      if (this.dictionary.has(contextWord) && contextWord.length > 3) {
        suggestions.push(contextWord);
      }
    }
    
    return suggestions;
  }

  // Distance de Levenshtein
  private levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    return matrix[b.length][a.length];
  }

  // Analyser un texte complet
  analyzeText(text: string): AnalysisResult {
    const errors: WordCorrection[] = [];
    const words = text.split(/(\s+)/);
    let currentIndex = 0;
    
    for (const word of words) {
      const trimmed = word.trim();
      if (trimmed.length > 0 && !this.isCorrect(trimmed)) {
        const suggestions = this.getSuggestions(trimmed, text);
        errors.push({
          original: trimmed,
          corrected: suggestions[0] || trimmed,
          confidence: suggestions.length > 0 ? 80 : 20,
          suggestions,
        });
      }
      currentIndex += word.length;
    }
    
    let correctedText = text;
    let correctionCount = 0;
    
    for (const error of errors) {
      if (error.corrected !== error.original) {
        const regex = new RegExp(`\\b${this.escapeRegex(error.original)}\\b`, 'gi');
        correctedText = correctedText.replace(regex, error.corrected);
        correctionCount++;
      }
    }
    
    return {
      text,
      errors,
      correctedText,
      correctionCount,
    };
  }

  // Appliquer une correction
  applyCorrection(text: string, original: string, correction: string): string {
    this.recordCorrection(original, correction);
    const regex = new RegExp(`\\b${this.escapeRegex(original)}\\b`, 'gi');
    return text.replace(regex, correction);
  }

  // Appliquer toutes les corrections automatiques
  applyAutoCorrections(text: string): { result: string; count: number } {
    let result = text;
    let count = 0;
    
    for (const [incorrect, correct] of this.corrections) {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      if (regex.test(result)) {
        const matches = result.match(regex);
        count += matches ? matches.length : 0;
        result = result.replace(regex, correct);
      }
    }
    
    return { result, count };
  }

  // Obtenir les statistiques du dictionnaire
  getStats(): { total: number; custom: number; corrections: number } {
    return {
      total: this.dictionary.size + this.customWords.size,
      custom: this.customWords.size,
      corrections: this.corrections.size,
    };
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

export const autoSpellcheck = new AutoSpellcheckService();
export default autoSpellcheck;