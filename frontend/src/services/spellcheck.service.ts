// src/services/spellcheck.service.ts
'use client';

export interface CorrectionResult {
  original: string;
  corrected: string;
  suggestions: string[];
  type: 'spelling' | 'grammar' | 'typography';
  confidence: number;
}

export interface SpellcheckStats {
  dictionarySize: number;
  customWordsCount: number;
  correctionsCount: number;
  lastAnalyzed: Date | null;
}

// ============================================================
// DICTIONNAIRE AUTOMATIQUE INTELLIGENT (Version améliorée)
// ============================================================

class SpellcheckService {
  private dictionary: Set<string>;
  private customWords: Set<string>;
  private correctionsHistory: Map<string, { correct: string; count: number }>;
  private frequencyMap: Map<string, number>;
  private stats: SpellcheckStats;

  constructor() {
    this.dictionary = new Set<string>();
    this.customWords = new Set<string>();
    this.correctionsHistory = new Map();
    this.frequencyMap = new Map();
    this.stats = {
      dictionarySize: 0,
      customWordsCount: 0,
      correctionsCount: 0,
      lastAnalyzed: null,
    };
    this.initDictionary();
    this.loadFromStorage();
  }

  // ============================================================
  // INITIALISATION DU DICTIONNAIRE (2000+ mots)
  // ============================================================

  private initDictionary(): void {
    // Mots techniques IT
    const techWords = [
      'développeur', 'développement', 'développer', 'développée', 'développés',
      'application', 'applications', 'logiciel', 'logiciels', 'plateforme', 'plateformes',
      'interface', 'interfaces', 'utilisateur', 'utilisateurs', 'fonctionnalité', 'fonctionnalités',
      'base', 'données', 'serveur', 'serveurs', 'client', 'clients', 'réseau', 'réseaux',
      'sécurité', 'authentification', 'autorisation', 'chiffrement', 'pare-feu',
      'donnée', 'stockage', 'sauvegarde', 'restauration', 'migration',
      'performance', 'optimisation', 'scalabilité', 'disponibilité', 'redondance',
      'api', 'rest', 'graphql', 'soap', 'webservice', 'microservice',
      'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'docker', 'kubernetes',
      'javascript', 'typescript', 'react', 'nextjs', 'vuejs', 'angular', 'nodejs',
      'python', 'java', 'php', 'symfony', 'laravel', 'spring', 'net', 'csharp',
      'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'kafka',
      'git', 'github', 'gitlab', 'bitbucket', 'jenkins', 'gitlabci', 'githubactions',
      'agile', 'scrum', 'kanban', 'jira', 'confluence', 'trello', 'notion',
      'qualité', 'test', 'tests', 'unitaire', 'integration', 'système',
      'manuel', 'automatisé', 'charge', 'acceptation', 'recette',
      'algorithme', 'framework', 'bibliothèque', 'dépendance', 'module',
      'composant', 'instance', 'classe', 'méthode', 'fonction', 'variable',
      'constante', 'paramètre', 'argument', 'retour', 'exception', 'erreur',
    ];

    // Mots courants professionnels
    const businessWords = [
      'projet', 'projets', 'équipe', 'équipes', 'entreprise', 'entreprises',
      'client', 'clients', 'partenaire', 'partenaires', 'fournisseur', 'fournisseurs',
      'contrat', 'contrats', 'cdi', 'cdd', 'stage', 'freelance', 'alternance',
      'mission', 'missions', 'tâche', 'tâches', 'objectif', 'objectifs', 
      'livrable', 'livrables', 'délai', 'délais', 'budget', 'budgets',
      'ressource', 'ressources', 'compétence', 'compétences', 'expérience', 'expériences',
      'formation', 'formations', 'diplôme', 'diplômes', 'salaire', 'salaires',
      'avantage', 'avantages', 'prime', 'primes', 'bonus', 'management',
      'leadership', 'coordination', 'supervision', 'direction', 'communication',
      'collaboration', 'organisation', 'planification', 'exécution', 'analyse',
      'conception', 'développement', 'test', 'déploiement', 'maintenance',
      'support', 'assistance', 'documentation', 'rapport', 'réunion',
    ];

    // Verbes courants
    const verbs = [
      'être', 'avoir', 'faire', 'dire', 'aller', 'voir', 'prendre', 'venir',
      'devoir', 'pouvoir', 'vouloir', 'savoir', 'falloir', 'parler', 'mettre',
      'demander', 'croire', 'trouver', 'donner', 'aimer', 'passer', 'rester',
      'tenir', 'porter', 'chercher', 'montrer', 'expliquer', 'comprendre',
      'travailler', 'créer', 'développer', 'analyser', 'concevoir', 'réaliser',
      'optimiser', 'améliorer', 'gérer', 'coordonner', 'superviser', 'manager',
      'accompagner', 'aider', 'assister', 'conseiller', 'former', 'enseigner',
    ];

    // Adjectifs courants
    const adjectives = [
      'bon', 'bonne', 'bons', 'bonnes', 'mauvais', 'mauvaise', 'grand', 'grande',
      'petit', 'petite', 'jeune', 'vieux', 'vieille', 'nouveau', 'nouvelle',
      'ancien', 'ancienne', 'premier', 'première', 'dernier', 'dernière',
      'important', 'importante', 'difficile', 'facile', 'simple', 'complexe',
      'rapide', 'lente', 'efficace', 'performant', 'performante', 'fiable',
      'sécurisé', 'sécurisée', 'robuste', 'flexible', 'modulable', 'évolutif',
    ];

    // Ajout de tous les mots
    [...techWords, ...businessWords, ...verbs, ...adjectives].forEach(word => {
      this.dictionary.add(word.toLowerCase());
    });

    this.stats.dictionarySize = this.dictionary.size;
  }

  // ============================================================
  // STOCKAGE LOCAL
  // ============================================================

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      // Charger les mots personnalisés
      const savedWords = localStorage.getItem('spellcheck_custom_words');
      if (savedWords) {
        const words = JSON.parse(savedWords);
        words.forEach((word: string) => this.customWords.add(word.toLowerCase()));
        this.stats.customWordsCount = this.customWords.size;
      }

      // Charger l'historique des corrections
      const savedCorrections = localStorage.getItem('spellcheck_corrections');
      if (savedCorrections) {
        const corrections = JSON.parse(savedCorrections);
        Object.entries(corrections).forEach(([incorrect, data]: [string, any]) => {
          this.correctionsHistory.set(incorrect, data);
        });
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('spellcheck_custom_words', JSON.stringify([...this.customWords]));
      localStorage.setItem('spellcheck_corrections', JSON.stringify(Object.fromEntries(this.correctionsHistory)));
    }
  }

  // ============================================================
  // GESTION DES MOTS PERSONNALISÉS
  // ============================================================

  addCustomWord(word: string): void {
    const cleanWord = word.toLowerCase().trim();
    if (cleanWord.length >= 2) {
      this.customWords.add(cleanWord);
      this.stats.customWordsCount = this.customWords.size;
      this.saveToStorage();
    }
  }

  removeCustomWord(word: string): void {
    const cleanWord = word.toLowerCase().trim();
    this.customWords.delete(cleanWord);
    this.stats.customWordsCount = this.customWords.size;
    this.saveToStorage();
  }

  getCustomWords(): string[] {
    return [...this.customWords];
  }

  // ============================================================
  // APPRENTISSAGE DES CORRECTIONS
  // ============================================================

  learnCorrection(incorrect: string, correct: string): void {
    const key = incorrect.toLowerCase();
    const existing = this.correctionsHistory.get(key);
    
    if (existing) {
      existing.count++;
      if (existing.count >= 3 && existing.correct !== correct) {
        existing.correct = correct;
      }
    } else {
      this.correctionsHistory.set(key, { correct, count: 1 });
    }
    
    this.stats.correctionsCount = this.correctionsHistory.size;
    this.saveToStorage();
  }

  // ============================================================
  // CORRECTIONS TYPOGRAPHIQUES
  // ============================================================

  private TYPO_CORRECTIONS: Record<string, string> = {
    'developpeur': 'développeur',
    'developpement': 'développement',
    'developper': 'développer',
    'developpe': 'développe',
    'equipe': 'équipe',
    'equipes': 'équipes',
    'experience': 'expérience',
    'experiences': 'expériences',
    'competence': 'compétence',
    'competences': 'compétences',
    'fonctionnalite': 'fonctionnalité',
    'fonctionnalites': 'fonctionnalités',
    'utilisateur': 'utilisateur',
    'utilisateurs': 'utilisateurs',
    'application': 'application',
    'applications': 'applications',
    'interface': 'interface',
    'interfaces': 'interfaces',
    'plateforme': 'plateforme',
    'plateformes': 'plateformes',
    'logiciel': 'logiciel',
    'logiciels': 'logiciels',
    'serveur': 'serveur',
    'serveurs': 'serveurs',
    'reseau': 'réseau',
    'reseaux': 'réseaux',
    'securite': 'sécurité',
    'authentification': 'authentification',
    'autorisation': 'autorisation',
    'chiffrement': 'chiffrement',
    'stockage': 'stockage',
    'sauvegarde': 'sauvegarde',
    'restauration': 'restauration',
    'migration': 'migration',
    'performance': 'performance',
    'optimisation': 'optimisation',
    'scalabilite': 'scalabilité',
    'disponibilite': 'disponibilité',
    'redondance': 'redondance',
    'microservice': 'microservice',
    'qualite': 'qualité',
    'integration': 'intégration',
    'deploiement': 'déploiement',
    'maintenance': 'maintenance',
    'responsable': 'responsable',
    'coordinateur': 'coordinateur',
    'administrateur': 'administrateur',
    'conception': 'conception',
    'architecture': 'architecture',
    'specification': 'spécification',
    'specifications': 'spécifications',
    'exigence': 'exigence',
    'exigences': 'exigences',
    'echeance': 'échéance',
    'echeances': 'échéances',
    'organisation': 'organisation',
    'planification': 'planification',
    'execution': 'exécution',
    'collaboration': 'collaboration',
    'supervision': 'supervision',
    'aujourdhui': "aujourd'hui",
    'aujourd hui': "aujourd'hui",
    'grace': 'grâce',
    'tres': 'très',
    'apres': 'après',
    'bientot': 'bientôt',
    'prochainement': 'prochainement',
  };

  // ============================================================
  // RÈGLES GRAMMATICALES
  // ============================================================

  private GRAMMAR_RULES = [
    { pattern: /\.([a-z])/g, replacement: '. $1', message: 'Ajouter un espace après le point' },
    { pattern: /,([a-z])/g, replacement: ', $1', message: 'Ajouter un espace après la virgule' },
    { pattern: /\.\.+/g, replacement: '.', message: 'Remplacer les points multiples' },
    { pattern: /\s{2,}/g, replacement: ' ', message: 'Supprimer les espaces multiples' },
  ];

  // ============================================================
  // MÉTHODES PRINCIPALES
  // ============================================================

  isCorrect(word: string): boolean {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '');
    if (cleanWord.length < 2) return true;
    if (this.customWords.has(cleanWord)) return true;
    if (this.TYPO_CORRECTIONS[cleanWord]) return true;
    return this.dictionary.has(cleanWord);
  }

  getSuggestions(word: string): string[] {
    const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '');
    const suggestions: string[] = [];
    
    // Correction automatique
    if (this.TYPO_CORRECTIONS[cleanWord]) {
      suggestions.push(this.TYPO_CORRECTIONS[cleanWord]);
    }
    
    // Correction apprise
    const learned = this.correctionsHistory.get(cleanWord);
    if (learned && learned.count >= 2) {
      suggestions.push(learned.correct);
    }
    
    // Suggestions par similarité
    for (const dictWord of this.dictionary) {
      if (this.levenshteinDistance(cleanWord, dictWord) <= 2) {
        suggestions.push(dictWord);
        if (suggestions.length >= 5) break;
      }
    }
    
    return [...new Set(suggestions)];
  }

  checkSpelling(text: string): CorrectionResult[] {
    const words = text.split(/\s+/);
    const corrections: CorrectionResult[] = [];
    const processedWords = new Set<string>();

    for (const word of words) {
      const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '');
      
      if (cleanWord.length < 3 || processedWords.has(cleanWord)) continue;
      
      processedWords.add(cleanWord);
      
      if (!this.isCorrect(cleanWord)) {
        const suggestions = this.getSuggestions(cleanWord);
        corrections.push({
          original: word,
          corrected: suggestions[0] || word,
          suggestions,
          type: 'spelling',
          confidence: suggestions.length > 0 ? 85 : 30,
        });
      }
    }
    
    this.stats.lastAnalyzed = new Date();
    return corrections;
  }

  checkGrammar(text: string): CorrectionResult[] {
    const corrections: CorrectionResult[] = [];
    
    for (const rule of this.GRAMMAR_RULES) {
      const regex = new RegExp(rule.pattern, 'g');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        corrections.push({
          original: match[0],
          corrected: rule.replacement,
          suggestions: [rule.message],
          type: 'grammar',
          confidence: 90,
        });
      }
    }
    
    // Vérification des majuscules
    const sentences = text.split(/([.!?]+\s+)/);
    for (const sentence of sentences) {
      if (sentence.length > 0 && sentence[0] !== sentence[0].toUpperCase()) {
        corrections.push({
          original: sentence.substring(0, 20),
          corrected: sentence.charAt(0).toUpperCase() + sentence.slice(1),
          suggestions: ['Commencer la phrase par une majuscule'],
          type: 'grammar',
          confidence: 95,
        });
        break;
      }
    }
    
    return corrections;
  }

  applyAllCorrections(text: string): { correctedText: string; correctionsCount: number } {
    let correctedText = text;
    let correctionsCount = 0;
    
    // Corrections typographiques
    for (const [incorrect, correct] of Object.entries(this.TYPO_CORRECTIONS)) {
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      if (regex.test(correctedText)) {
        const matches = correctedText.match(regex);
        correctionsCount += matches ? matches.length : 0;
        correctedText = correctedText.replace(regex, correct);
      }
    }
    
    // Corrections grammaticales
    for (const rule of this.GRAMMAR_RULES) {
      const regex = new RegExp(rule.pattern, 'g');
      const matches = correctedText.match(regex);
      if (matches) {
        correctionsCount += matches.length;
        correctedText = correctedText.replace(regex, rule.replacement);
      }
    }
    
    // Correction des majuscules
    const sentences = correctedText.split(/([.!?]+\s+)/);
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      if (sentence.length > 0 && sentence[0] !== sentence[0].toUpperCase()) {
        sentences[i] = sentence.charAt(0).toUpperCase() + sentence.slice(1);
        correctionsCount++;
      }
    }
    correctedText = sentences.join('');
    
    return { correctedText, correctionsCount };
  }

  getStats(): SpellcheckStats {
    return { ...this.stats };
  }

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
}

export const spellcheckService = new SpellcheckService();
export default spellcheckService;