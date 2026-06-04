// components/admin/RichTextEditor.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon,
  List, ListOrdered, Undo, Redo, AlignLeft, AlignCenter, AlignRight,
  Heading1, Heading2, Heading3, Code, Quote, AlignJustify,
  SpellCheck, Languages, RefreshCw, CheckCircle, AlertCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  language?: 'fr' | 'mg';
  minHeight?: string;
}

// Dictionnaire français étendu
const FRENCH_WORDS = new Set([
  'développeur', 'développement', 'développer', 'application', 'applications',
  'logiciel', 'logiciels', 'plateforme', 'plateformes', 'interface', 'interfaces',
  'utilisateur', 'utilisateurs', 'fonctionnalité', 'fonctionnalités', 'base', 'données',
  'serveur', 'serveurs', 'client', 'clients', 'réseau', 'réseaux', 'sécurité',
  'authentification', 'autorisation', 'chiffrement', 'stockage', 'sauvegarde',
  'restauration', 'migration', 'performance', 'optimisation', 'scalabilité',
  'disponibilité', 'redondance', 'microservice', 'api', 'rest', 'graphql',
  'frontend', 'backend', 'fullstack', 'devops', 'cloud', 'docker', 'kubernetes',
  'javascript', 'typescript', 'react', 'nextjs', 'vuejs', 'angular', 'nodejs',
  'python', 'java', 'php', 'symfony', 'laravel', 'spring', 'postgresql', 'mysql',
  'mongodb', 'redis', 'git', 'github', 'gitlab', 'jenkins', 'agile', 'scrum',
  'kanban', 'qualité', 'test', 'tests', 'unitaire', 'intégration', 'déploiement',
  'maintenance', 'support', 'responsable', 'coordinateur', 'administrateur',
  'conception', 'architecture', 'spécification', 'exigence', 'échéance',
  'organisation', 'planification', 'exécution', 'collaboration', 'supervision',
  'projet', 'projets', 'équipe', 'équipes', 'entreprise', 'entreprises',
  'client', 'clients', 'partenaire', 'partenaires', 'contrat', 'contrats',
  'cdi', 'cdd', 'stage', 'freelance', 'alternance', 'mission', 'missions',
  'tâche', 'tâches', 'objectif', 'objectifs', 'livrable', 'livrables', 'délai',
  'délais', 'budget', 'budgets', 'ressource', 'ressources', 'compétence',
  'compétences', 'expérience', 'expériences', 'formation', 'formations',
  'diplôme', 'diplômes', 'salaire', 'salaires', 'avantage', 'avantages',
  'management', 'leadership', 'coordination', 'direction', 'communication',
  'analyse', 'conception', 'développement', 'test', 'déploiement', 'maintenance',
  'support', 'assistance', 'documentation', 'rapport', 'réunion', 'réunions',
  'aujourd', 'hui', 'maintenant', 'demain', 'hier', 'semaine', 'mois', 'année',
  'travail', 'emploi', 'poste', 'carrière', 'opportunité', 'challenge', 'défi',
]);

// Corrections automatiques
const AUTO_CORRECTIONS: Record<string, string> = {
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
  'formation': 'formation',
  'diplome': 'diplôme',
  'contrat': 'contrat',
  'alternance': 'alternance',
  'temporaire': 'temporaire',
  'objectif': 'objectif',
  'livrable': 'livrable',
  'delai': 'délai',
  'ressource': 'ressource',
  'aujourdhui': "aujourd'hui",
};

// Fonctions de correction orthographique
const isCorrect = (word: string): boolean => {
  const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '');
  if (cleanWord.length < 3) return true;
  if (AUTO_CORRECTIONS[cleanWord]) return true;
  return FRENCH_WORDS.has(cleanWord);
};

const getSuggestions = (word: string): string[] => {
  const cleanWord = word.toLowerCase().replace(/[.,!?;:()"']/g, '');
  const suggestions: string[] = [];
  
  if (AUTO_CORRECTIONS[cleanWord]) {
    suggestions.push(AUTO_CORRECTIONS[cleanWord]);
  }
  
  for (const dictWord of FRENCH_WORDS) {
    if (dictWord.startsWith(cleanWord[0]) && dictWord.length === cleanWord.length + 1) {
      suggestions.push(dictWord);
      if (suggestions.length >= 3) break;
    }
  }
  
  return suggestions;
};

const applyCorrection = (text: string, original: string, corrected: string): string => {
  const regex = new RegExp(`\\b${original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  return text.replace(regex, corrected);
};

const applyAutoCorrections = (text: string): { correctedText: string; correctionsCount: number } => {
  let correctedText = text;
  let correctionsCount = 0;
  
  for (const [incorrect, correct] of Object.entries(AUTO_CORRECTIONS)) {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    if (regex.test(correctedText)) {
      const matches = correctedText.match(regex);
      correctionsCount += matches ? matches.length : 0;
      correctedText = correctedText.replace(regex, correct);
    }
  }
  
  return { correctedText, correctionsCount };
};

// Composant du menu contextuel
function ContextMenu({ x, y, word, suggestions, onCorrect, onIgnore, onClose }: any) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const adjustedX = Math.min(x, window.innerWidth - 260);
  const adjustedY = Math.min(y, window.innerHeight - 320);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[240px]"
        style={{ top: adjustedY, left: adjustedX }}
      >
        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
          <p className="text-xs text-gray-500">Correction orthographique</p>
          <p className="text-sm font-medium text-red-600">{word}</p>
        </div>
        
        {suggestions.length > 0 && (
          <div className="py-1">
            {suggestions.map((suggestion: string, idx: number) => (
              <button
                key={idx}
                onClick={() => onCorrect(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition flex items-center gap-2"
              >
                <SpellCheck className="w-4 h-4" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
        
        <div className="border-t border-gray-100 my-1"></div>
        
        <button
          onClick={onIgnore}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition flex items-center gap-2"
        >
          <XCircle className="w-4 h-4" />
          Ignorer cette erreur
        </button>
        
        <button
          onClick={onClose}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 transition flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Fermer
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  language = 'fr',
  minHeight = '400px'
}: RichTextEditorProps) {
  const [isSpellcheckEnabled, setIsSpellcheckEnabled] = useState(true);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctionStats, setCorrectionStats] = useState<number | null>(null);
  const [content, setContent] = useState(value);
  const [isMounted, setIsMounted] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; word: string; suggestions: string[] } | null>(null);

  const extensions = [
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Placeholder.configure({
      placeholder: placeholder || (language === 'fr' ? 'Description détaillée du poste...' : 'Famaritana amin\'ny antsipirihany ny asa...'),
    }),
    Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
    TextAlign.configure({ types: ['heading', 'paragraph'], alignments: ['left', 'center', 'right', 'justify'] }),
    Underline, Highlight, Typography,
  ];

  const editor = useEditor({
    extensions,
    content: content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setContent(newContent);
      onChange(newContent);
      setCorrectionStats(null);
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none px-4 py-3 overflow-y-auto bg-white`,
        style: `min-height: ${minHeight}; max-height: 500px;`,
      },
    },
  });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (!editor || !isSpellcheckEnabled) return;
    e.preventDefault();
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    let wordNode = range.startContainer;
    
    while (wordNode && wordNode.nodeType !== Node.TEXT_NODE) {
      wordNode = wordNode.parentNode as Node;
    }
    
    if (wordNode && wordNode.textContent) {
      const offset = range.startOffset;
      const text = wordNode.textContent;
      let start = offset, end = offset;
      
      while (start > 0 && /[a-zA-ZÀ-ÖØ-öø-ÿ]/i.test(text[start - 1])) start--;
      while (end < text.length && /[a-zA-ZÀ-ÖØ-öø-ÿ]/i.test(text[end])) end++;
      
      const word = text.substring(start, end);
      
      if (word && word.length > 2 && !isCorrect(word)) {
        setContextMenu({ x: e.clientX, y: e.clientY, word, suggestions: getSuggestions(word) });
      }
    }
  }, [editor, isSpellcheckEnabled]);

  const handleContextCorrection = useCallback((correction: string) => {
    if (!editor || !contextMenu) return;
    const text = editor.getText();
    const correctedText = applyCorrection(text, contextMenu.word, correction);
    if (correctedText !== text) {
      editor.commands.setContent(correctedText);
      toast.success(`"${contextMenu.word}" → "${correction}"`);
    }
    setContextMenu(null);
  }, [editor, contextMenu]);

  const handleAutoCorrect = useCallback(() => {
    if (!editor) return;
    setIsCorrecting(true);
    const text = editor.getText();
    const { correctedText, correctionsCount } = applyAutoCorrections(text);
    
    if (correctionsCount > 0 && correctedText !== text) {
      editor.commands.setContent(correctedText);
      toast.success(`${correctionsCount} correction(s) appliquée(s)`);
      setCorrectionStats(correctionsCount);
    } else {
      toast.success('Aucune erreur détectée');
      setCorrectionStats(null);
    }
    setIsCorrecting(false);
  }, [editor]);

  const handleQuickSpellCheck = useCallback(() => {
    if (!editor) return;
    const text = editor.getText();
    const words = text.split(/\s+/);
    let errors = 0;
    for (const word of words) {
      if (!isCorrect(word)) errors++;
    }
    if (errors > 0) toast.error(`${errors} erreur(s) orthographique(s) détectée(s)`);
    else toast.success('Aucune erreur orthographique détectée');
  }, [editor]);

  useEffect(() => { setIsMounted(true); }, []);
  
  useEffect(() => {
    if (isMounted && editor && editor.view?.dom) {
      editor.view.dom.setAttribute('spellcheck', isSpellcheckEnabled ? 'true' : 'false');
      editor.view.dom.setAttribute('lang', 'fr');
    }
  }, [editor, isSpellcheckEnabled, isMounted]);
  
  useEffect(() => {
    if (isMounted && editor && value !== content && value !== editor.getHTML()) {
      editor.commands.setContent(value);
      setContent(value);
    }
  }, [editor, value, content, isMounted]);

  if (!isMounted) {
    return <div className="border rounded-lg p-8 bg-gray-50 text-center" style={{ minHeight }}><div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div><p className="text-gray-500">Chargement...</p></div>;
  }

  const ToolbarButton = ({ onClick, isActive, icon: Icon, title, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`p-2 rounded transition ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={title}><Icon className="w-4 h-4" /></button>
  );

  const ToolbarDivider = () => <div className="w-px h-6 bg-gray-300 mx-1" />;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm" onContextMenu={handleContextMenu}>
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} isActive={editor?.isActive('bold') || false} icon={Bold} title="Gras (Ctrl+B)" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleItalic().run()} isActive={editor?.isActive('italic') || false} icon={Italic} title="Italique (Ctrl+I)" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleUnderline().run()} isActive={editor?.isActive('underline') || false} icon={UnderlineIcon} title="Souligné (Ctrl+U)" />
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('left').run()} isActive={editor?.isActive({ textAlign: 'left' }) || false} icon={AlignLeft} title="Aligner à gauche" />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('center').run()} isActive={editor?.isActive({ textAlign: 'center' }) || false} icon={AlignCenter} title="Centrer" />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('right').run()} isActive={editor?.isActive({ textAlign: 'right' }) || false} icon={AlignRight} title="Aligner à droite" />
        <ToolbarButton onClick={() => editor?.chain().focus().setTextAlign('justify').run()} isActive={editor?.isActive({ textAlign: 'justify' }) || false} icon={AlignJustify} title="Justifier" />
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBulletList().run()} isActive={editor?.isActive('bulletList') || false} icon={List} title="Liste à puces" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleOrderedList().run()} isActive={editor?.isActive('orderedList') || false} icon={ListOrdered} title="Liste numérotée" />
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor?.isActive('heading', { level: 1 }) || false} icon={Heading1} title="Titre 1" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor?.isActive('heading', { level: 2 }) || false} icon={Heading2} title="Titre 2" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor?.isActive('heading', { level: 3 }) || false} icon={Heading3} title="Titre 3" />
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleCodeBlock().run()} isActive={editor?.isActive('codeBlock') || false} icon={Code} title="Bloc de code" />
        <ToolbarButton onClick={() => editor?.chain().focus().toggleBlockquote().run()} isActive={editor?.isActive('blockquote') || false} icon={Quote} title="Citation" />
        <ToolbarDivider />
        <ToolbarButton onClick={() => { const url = prompt('Entrez l\'URL :'); if (url && editor) editor.chain().focus().setLink({ href: url }).run(); }} isActive={editor?.isActive('link') || false} icon={LinkIcon} title="Lien" />
        <ToolbarDivider />
        <ToolbarButton onClick={() => setIsSpellcheckEnabled(!isSpellcheckEnabled)} isActive={isSpellcheckEnabled} icon={SpellCheck} title="Correction orthographique (clic droit)" />
        <ToolbarButton onClick={handleQuickSpellCheck} icon={Languages} title="Vérifier l'orthographe" />
        <ToolbarButton onClick={handleAutoCorrect} icon={RefreshCw} title="Correction automatique" disabled={isCorrecting} />
        {isCorrecting && <div className="flex items-center gap-1 ml-2"><div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div><span className="text-xs text-blue-600">Correction...</span></div>}
        {correctionStats !== null && !isCorrecting && <div className="flex items-center gap-2 ml-2 px-2 py-1 bg-green-50 rounded-lg"><CheckCircle className="w-3 h-3 text-green-600" /><span className="text-xs text-green-600">{correctionStats} erreur(s) corrigée(s)</span></div>}
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor?.chain().focus().undo().run()} icon={Undo} title="Annuler" />
        <ToolbarButton onClick={() => editor?.chain().focus().redo().run()} icon={Redo} title="Rétablir" />
      </div>
      
      <EditorContent editor={editor} />
      
      {contextMenu && <ContextMenu {...contextMenu} onCorrect={handleContextCorrection} onIgnore={() => setContextMenu(null)} onClose={() => setContextMenu(null)} />}
      
      <div className="flex justify-between items-center px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-500">
        <div className="flex gap-4">
          <span>{editor?.getText().length || 0} caractères</span>
          <span>•</span>
          <span>{editor?.getText().split(/\s+/).filter((w: string) => w.length > 0).length || 0} mots</span>
          <span>•</span>
          <span>{editor?.getText().split(/\n/).length || 0} lignes</span>
          {isSpellcheckEnabled && <span className="text-green-600 flex items-center gap-1"><SpellCheck className="w-3 h-3" /> Correction active (clic droit)</span>}
        </div>
        <div className="flex gap-2">
          <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+B</kbd>
          <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+I</kbd>
          <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+U</kbd>
          <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">Ctrl+Z</kbd>
          <span className="text-blue-600 ml-1">Clic droit pour suggestions</span>
        </div>
      </div>
    </div>
  );
}

export default RichTextEditor;