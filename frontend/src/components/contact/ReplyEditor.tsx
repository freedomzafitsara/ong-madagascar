// frontend/src/components/contact/ReplyEditor.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  Bold, Italic, Underline, List, Quote, Code,
  AlignLeft, AlignCenter, AlignRight, X,
  Eye, EyeOff, Loader2, Send, Reply
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

// ✅ Import dynamique de ReactQuill - CORRIGÉ
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');
    // ✅ Forward ref correctement
    return function ForwardedQuill(props: any, ref: any) {
      return <RQ {...props} forwardedRef={ref} />;
    };
  },
  { 
    ssr: false,
    loading: () => (
      <div className="h-48 bg-gray-50 animate-pulse rounded-xl flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    )
  }
);

import 'react-quill/dist/quill.snow.css';

// ============================================================
// TYPES
// ============================================================

interface ReplyEditorProps {
  messageId: string;
  clientName: string;
  clientEmail: string;
  originalMessage: string;
  onClose: () => void;
  onSuccess: () => void;
  getText: (fr: string, mg: string) => string;
}

// ============================================================
// CONFIGURATION DE L'EDITEUR
// ============================================================

const QUILL_MODULES = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'align': [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean']
  ],
  clipboard: {
    matchVisual: false,
  }
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'check',
  'indent', 'align', 'blockquote', 'code-block',
  'link', 'image', 'video'
];

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export function ReplyEditor({
  messageId,
  clientName,
  clientEmail,
  originalMessage,
  onClose,
  onSuccess,
  getText
}: ReplyEditorProps) {
  const [replyText, setReplyText] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [ccAdmin, setCcAdmin] = useState(false);
  
  // ✅ Ref correcte pour ReactQuill
  const quillRef = useRef<any>(null);

  // Initialiser le texte avec un template
  useEffect(() => {
    const template = `
      <p>Bonjour ${clientName},</p>
      <br>
      <p>Nous avons bien reçu votre message et vous remercions de nous avoir contactés.</p>
      <br>
      <p>Notre équipe a pris connaissance de votre demande et nous reviendrons vers vous dans les plus brefs délais.</p>
      <br>
      <p>Cordialement,</p>
      <p><strong>L'équipe Y-MaD</strong></p>
      <p>Young for Madagascar Development</p>
    `;
    setReplyText(template);
    updateCharCount(template);
  }, [clientName]);

  // ============================================================
  // TEMPLATES
  // ============================================================

  const templates = {
    standard: `
      <p>Bonjour ${clientName},</p>
      <br>
      <p>Nous avons bien reçu votre message et vous remercions de nous avoir contactés.</p>
      <br>
      <p>Notre équipe a pris connaissance de votre demande et nous reviendrons vers vous dans les plus brefs délais.</p>
      <br>
      <p>Cordialement,</p>
      <p><strong>L'équipe Y-MaD</strong></p>
    `,
    urgent: `
      <p>Bonjour ${clientName},</p>
      <br>
      <p><strong>Message urgent - Traitement prioritaire</strong></p>
      <br>
      <p>Nous avons bien reçu votre message et nous en avons pris connaissance.</p>
      <p>Votre demande a été transmise au service compétent pour traitement prioritaire.</p>
      <br>
      <p>Nous vous tiendrons informé de l'avancement de votre dossier.</p>
      <br>
      <p>Cordialement,</p>
      <p><strong>L'équipe Y-MaD</strong></p>
    `,
    thanks: `
      <p>Bonjour ${clientName},</p>
      <br>
      <p>Nous vous remercions chaleureusement pour votre message et votre intérêt pour notre association.</p>
      <br>
      <p>Votre contribution est précieuse pour nous.</p>
      <br>
      <p>Bien à vous,</p>
      <p><strong>L'équipe Y-MaD</strong></p>
    `
  };

  const loadTemplate = (type: 'standard' | 'urgent' | 'thanks') => {
    setReplyText(templates[type]);
    updateCharCount(templates[type]);
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const updateCharCount = (html: string) => {
    const cleanText = html.replace(/<[^>]*>/g, '');
    setCharCount(cleanText.length);
  };

  const handleTextChange = (value: string) => {
    setReplyText(value);
    updateCharCount(value);
  };

  const insertSignature = () => {
    const signature = `
      <br>
      <p>--</p>
      <p><strong>Y-MaD Association</strong></p>
      <p>Young for Madagascar Development</p>
      <p>Carion, Antananarivo</p>
      <p>Email: ymad.mg@gmail.com</p>
      <p>Tél: +261 32 04 856 97</p>
    `;
    setReplyText(replyText + signature);
    updateCharCount(replyText + signature);
  };

  const insertOriginalMessage = () => {
    const original = `
      <br>
      <hr>
      <p style="color: #666; font-size: 14px;">
        <strong>Message original de ${clientName} :</strong>
      </p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; border-left: 4px solid #1E3A8A; margin: 10px 0;">
        ${originalMessage}
      </div>
      <hr>
    `;
    setReplyText(replyText + original);
    updateCharCount(replyText + original);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || replyText === '<p><br></p>') {
      toast.error(getText('Veuillez saisir votre réponse', 'Ampidiro ny valinteninao'));
      return;
    }

    setSending(true);
    try {
      await api.post(`/contact/${messageId}/reply`, {
        reply: replyText,
        admin_notes: adminNotes,
        cc: ccAdmin ? 'admin@ymad.mg' : undefined,
      });
      
      toast.success(getText('Réponse envoyée avec succès', 'Vita ny fandefasana valiny'));
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.response?.data?.message || getText('Erreur lors de l\'envoi', 'Nisy hadisoana'));
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-800 rounded-lg flex items-center justify-center">
              <Reply className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                {getText('Répondre au message', 'Valio ny hafatra')}
              </h2>
              <p className="text-sm text-gray-500">
                {getText('À', 'Ho an\'i')} {clientName} ({clientEmail})
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {/* Templates */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-600 mr-2">
              {getText('Templates :', 'Modely :')}
            </span>
            <button
              onClick={() => loadTemplate('standard')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition"
            >
              {getText('Standard', 'Mahazatra')}
            </button>
            <button
              onClick={() => loadTemplate('urgent')}
              className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-full text-sm transition"
            >
              {getText('Urgent', 'Maika')}
            </button>
            <button
              onClick={() => loadTemplate('thanks')}
              className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-full text-sm transition"
            >
              {getText('Remerciement', 'Fisaorana')}
            </button>
            <button
              onClick={insertSignature}
              className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full text-sm transition"
            >
              {getText('Signature', 'Sonja')}
            </button>
            <button
              onClick={insertOriginalMessage}
              className="px-3 py-1 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-full text-sm transition"
            >
              {getText('Message original', 'Hafatra tany am-boalohany')}
            </button>
          </div>

          {/* Info caractères */}
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>
              {charCount} {getText('caractères', 'litera')}
            </span>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1 text-gray-500 hover:text-blue-600 transition"
            >
              {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPreview ? getText('Modifier', 'Hanova') : getText('Aperçu', 'Topi-maso')}
            </button>
          </div>

          {/* Éditeur ou Aperçu */}
          {showPreview ? (
            <div className="min-h-[150px] p-4 bg-gray-50 rounded-xl border border-gray-200 prose max-w-none">
              {replyText && replyText !== '<p><br></p>' ? (
                <div dangerouslySetInnerHTML={{ __html: replyText }} />
              ) : (
                <p className="text-gray-400 italic">{getText('Aucun contenu', 'Tsy misy votoaty')}</p>
              )}
            </div>
          ) : (
            <div className="quill-editor">
              <ReactQuill
                forwardedRef={quillRef}
                theme="snow"
                value={replyText}
                onChange={handleTextChange}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder={getText(
                  'Saisissez votre réponse ici... (gras, italique, listes, liens, images)',
                  'Ampidiro ny valinteninao eto... (maitso, lisitra, rohy, sary)'
                )}
              />
            </div>
          )}

          {/* Notes internes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {getText('Notes internes', 'Fanamarihana anatiny')}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder={getText('Ajouter des notes internes...', 'Ampidiro fanamarihana anatiny...')}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-800 outline-none resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Options */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={ccAdmin}
                onChange={(e) => setCcAdmin(e.target.checked)}
                className="rounded text-blue-800 focus:ring-blue-800"
              />
              {getText('M\'envoyer une copie', 'Alefaso koa amiko')}
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
          >
            {getText('Annuler', 'Aoka')}
          </button>
          <button
            onClick={handleSendReply}
            disabled={sending || !replyText.trim() || replyText === '<p><br></p>'}
            className="flex items-center gap-2 px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition disabled:opacity-50 text-sm font-medium"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {getText('Envoi en cours...', 'Fandefasana...')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {getText('Envoyer la réponse', 'Alefaso ny valiny')}
              </>
            )}
          </button>
        </div>

        <style jsx global>{`
          .quill-editor .ql-container {
            min-height: 150px;
            font-size: 15px;
            border-radius: 0 0 12px 12px;
            font-family: 'Segoe UI', Arial, sans-serif;
          }
          .quill-editor .ql-editor {
            min-height: 150px;
          }
          .quill-editor .ql-toolbar {
            border-radius: 12px 12px 0 0;
            border-color: #e5e7eb;
            background-color: #f9fafb;
          }
          .quill-editor .ql-container {
            border-color: #e5e7eb;
          }
          .quill-editor .ql-editor.ql-blank::before {
            font-style: italic;
            color: #9ca3af;
          }
          .prose {
            max-width: none;
          }
          .prose p {
            margin: 0.5rem 0;
          }
          .prose h1, .prose h2, .prose h3 {
            font-weight: bold;
            margin: 0.5rem 0;
          }
          .prose ul, .prose ol {
            margin: 0.5rem 0 0.5rem 1.5rem;
          }
          .prose li {
            margin: 0.2rem 0;
          }
          .prose blockquote {
            border-left: 4px solid #1E3A8A;
            padding-left: 1rem;
            margin: 0.5rem 0;
            color: #4b5563;
          }
          .prose code {
            background-color: #f3f4f6;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: monospace;
            font-size: 0.9em;
          }
          .prose a {
            color: #1E3A8A;
            text-decoration: underline;
          }
          .prose img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
          }
        `}</style>
      </div>
    </div>
  );
}

export default ReplyEditor;