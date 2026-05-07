// src/app/dashboard/messages/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Trash2,
  Reply,
  User,
  Phone,
  Calendar,
  MessageSquare,
  Filter,
  X,
  Send,
  Star,
  Archive
} from 'lucide-react';
import Link from 'next/link';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'archived';
  isImportant: boolean;
  repliedById?: string;
  repliedAt?: Date;
  reply?: string;
  createdAt: Date;
}

// Messages par défaut
const defaultMessages: ContactMessage[] = [
  {
    id: '1',
    name: 'Jean Rakoto',
    email: 'jean.rakoto@email.com',
    phone: '034 00 000 01',
    subject: 'Question sur les projets éducatifs',
    message: 'Bonjour, je souhaite en savoir plus sur vos projets éducatifs à Antananarivo. Comment puis-je contribuer ?',
    status: 'new',
    isImportant: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Marie Rasoanaivo',
    email: 'marie.raso@email.com',
    phone: '034 00 000 02',
    subject: 'Proposition de partenariat',
    message: 'Notre entreprise souhaite collaborer avec Y-Mad pour un projet environnemental. Merci de me contacter.',
    status: 'read',
    isImportant: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Paul Andria',
    email: 'paul.andria@email.com',
    subject: 'Demande de bénévolat',
    message: 'Je souhaite devenir bénévole chez Y-Mad. Je suis disponible les week-ends.',
    status: 'replied',
    isImportant: false,
    repliedById: 'admin',
    repliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    reply: 'Merci pour votre intérêt ! Nous vous contacterons prochainement.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '4',
    name: 'Société Telma',
    email: 'contact@telma.mg',
    phone: '034 00 000 03',
    subject: 'Partenariat entreprise',
    message: 'Nous souhaitons soutenir vos actions. Merci de nous envoyer un dossier de présentation.',
    status: 'new',
    isImportant: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  }
];

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = () => {
    setLoading(true);
    try {
      const stored = localStorage.getItem('ymad_contact_messages');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir les dates string en Date
        const messagesWithDates = parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt),
          repliedAt: m.repliedAt ? new Date(m.repliedAt) : undefined
        }));
        setMessages(messagesWithDates);
        setFilteredMessages(messagesWithDates);
      } else {
        setMessages(defaultMessages);
        setFilteredMessages(defaultMessages);
        localStorage.setItem('ymad_contact_messages', JSON.stringify(defaultMessages));
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      showMessage('Erreur lors du chargement des messages', 'error');
    } finally {
      setLoading(false);
    }
  };

  const saveMessages = (data: ContactMessage[]) => {
    localStorage.setItem('ymad_contact_messages', JSON.stringify(data));
    setMessages(data);
    applyFilters(data, searchTerm, filterStatus);
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const applyFilters = (data: ContactMessage[], term: string, status: string) => {
    let filtered = [...data];
    if (term) {
      filtered = filtered.filter(m => 
        m.name.toLowerCase().includes(term.toLowerCase()) ||
        m.email.toLowerCase().includes(term.toLowerCase()) ||
        m.subject.toLowerCase().includes(term.toLowerCase()) ||
        m.message.toLowerCase().includes(term.toLowerCase())
      );
    }
    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }
    setFilteredMessages(filtered);
    setCurrentPage(1);
  };

  const updateMessageStatus = (id: string, status: ContactMessage['status']) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, status } : m
    );
    saveMessages(updated);
    showMessage(`Message marqué comme ${getStatusLabel(status)}`, 'success');
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, status });
    }
  };

  const toggleImportant = (id: string) => {
    const updated = messages.map(m =>
      m.id === id ? { ...m, isImportant: !m.isImportant } : m
    );
    saveMessages(updated);
    showMessage('Message mis à jour', 'success');
    if (selectedMessage?.id === id) {
      setSelectedMessage({ ...selectedMessage, isImportant: !selectedMessage.isImportant });
    }
  };

  const handleReply = () => {
    if (!replyText.trim() || !selectedMessage) {
      showMessage('Veuillez écrire une réponse', 'error');
      return;
    }

    const updated = messages.map(m =>
      m.id === selectedMessage.id
        ? {
            ...m,
            status: 'replied' as ContactMessage['status'],
            reply: replyText,
            repliedAt: new Date(),
            repliedById: 'admin'
          }
        : m
    );
    saveMessages(updated);
    showMessage('Réponse envoyée avec succès', 'success');
    setShowReplyModal(false);
    setReplyText('');
    
    // Mettre à jour la sélection
    if (selectedMessage) {
      setSelectedMessage({
        ...selectedMessage,
        status: 'replied',
        reply: replyText,
        repliedAt: new Date()
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('⚠️ Supprimer définitivement ce message ? Cette action est irréversible.')) {
      const filtered = messages.filter(m => m.id !== id);
      saveMessages(filtered);
      showMessage('Message supprimé avec succès', 'success');
      if (selectedMessage?.id === id) {
        setShowDetail(false);
        setSelectedMessage(null);
      }
    }
  };

  const markAsRead = (id: string) => {
    const updated = messages.map(m =>
      m.id === id && m.status === 'new' ? { ...m, status: 'read' as ContactMessage['status'] } : m
    );
    saveMessages(updated);
    if (selectedMessage?.id === id && selectedMessage.status === 'new') {
      setSelectedMessage({ ...selectedMessage, status: 'read' });
    }
  };

  useEffect(() => {
    applyFilters(messages, searchTerm, filterStatus);
  }, [searchTerm, filterStatus, messages]);

  // Pagination
  const paginatedMessages = filteredMessages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage);

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    read: messages.filter(m => m.status === 'read').length,
    replied: messages.filter(m => m.status === 'replied').length,
    archived: messages.filter(m => m.status === 'archived').length,
    important: messages.filter(m => m.isImportant).length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Nouveau</span>;
      case 'read':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1"><Eye className="w-3 h-3" /> Lu</span>;
      case 'replied':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700 flex items-center gap-1"><Reply className="w-3 h-3" /> Répondu</span>;
      case 'archived':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700 flex items-center gap-1"><Archive className="w-3 h-3" /> Archivé</span>;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new': return 'nouveau';
      case 'read': return 'lu';
      case 'replied': return 'répondu';
      case 'archived': return 'archivé';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-ymad-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-ymad-gray-800">📬 Messages de contact</h1>
            {stats.new > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                {stats.new} nouveau(x)
              </span>
            )}
          </div>
          <p className="text-ymad-gray-500 mt-1">Consultez et répondez aux messages reçus via le formulaire de contact</p>
        </div>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Mail className="w-6 h-6 text-ymad-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.total}</p>
          <p className="text-xs text-ymad-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.new}</p>
          <p className="text-xs text-ymad-gray-500">Nouveaux</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Eye className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.read}</p>
          <p className="text-xs text-ymad-gray-500">Lus</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Reply className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.replied}</p>
          <p className="text-xs text-ymad-gray-500">Répondus</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center border border-ymad-gray-100">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-ymad-gray-800">{stats.important}</p>
          <p className="text-xs text-ymad-gray-500">Importants</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ymad-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email, sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
          >
            <option value="">📋 Tous les statuts</option>
            <option value="new">🆕 Nouveaux</option>
            <option value="read">👁️ Lus</option>
            <option value="replied">✅ Répondus</option>
            <option value="archived">📦 Archivés</option>
          </select>
          {(searchTerm || filterStatus) && (
            <button
              onClick={() => { setSearchTerm(''); setFilterStatus(''); }}
              className="px-4 py-2 text-ymad-gray-500 hover:text-ymad-gray-700 border rounded-lg hover:bg-ymad-gray-50 transition"
            >
              ✕ Effacer
            </button>
          )}
        </div>
      </div>

      {/* Liste des messages */}
      {paginatedMessages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm py-16 text-center">
          <Mail className="w-16 h-16 text-ymad-gray-300 mx-auto mb-4" />
          <p className="text-ymad-gray-500 text-lg">Aucun message trouvé</p>
          <p className="text-ymad-gray-400 text-sm mt-1">Les messages du formulaire de contact apparaîtront ici</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="divide-y">
              {paginatedMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`p-4 hover:bg-ymad-gray-50 transition cursor-pointer ${msg.status === 'new' ? 'bg-ymad-blue-50/30' : ''}`}
                  onClick={() => {
                    markAsRead(msg.id);
                    setSelectedMessage(msg);
                    setShowDetail(true);
                  }}
                >
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {msg.isImportant && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                        <h3 className="font-semibold text-ymad-gray-800">{msg.subject}</h3>
                        {getStatusBadge(msg.status)}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-ymad-gray-500 mb-2">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {msg.name}</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {msg.email}</span>
                        {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {msg.phone}</span>}
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(msg.createdAt)}</span>
                      </div>
                      <p className="text-ymad-gray-600 text-sm line-clamp-2">{msg.message}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      {msg.status === 'new' && (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">Nouveau</span>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleImportant(msg.id); }}
                        className="p-1.5 text-ymad-gray-400 hover:text-yellow-500 rounded-lg transition"
                        title={msg.isImportant ? "Retirer des importants" : "Marquer comme important"}
                      >
                        <Star className={`w-4 h-4 ${msg.isImportant ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                        className="p-1.5 text-ymad-gray-400 hover:text-red-500 rounded-lg transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ymad-gray-50"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === page
                      ? 'bg-ymad-blue-600 text-white'
                      : 'border hover:bg-ymad-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ymad-gray-50"
              >
                →
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal Détail du message */}
      {showDetail && selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowDetail(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* En-tête */}
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-ymad-gray-800">Message de {selectedMessage.name}</h2>
                {getStatusBadge(selectedMessage.status)}
              </div>
              <button onClick={() => setShowDetail(false)} className="p-1 hover:bg-ymad-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Informations expéditeur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-ymad-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-ymad-gray-500 flex items-center gap-1"><User className="w-4 h-4" /> Nom complet</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-ymad-gray-500 flex items-center gap-1"><Mail className="w-4 h-4" /> Email</p>
                  <a href={`mailto:${selectedMessage.email}`} className="font-medium text-ymad-blue-600 hover:underline">
                    {selectedMessage.email}
                  </a>
                </div>
                {selectedMessage.phone && (
                  <div>
                    <p className="text-sm text-ymad-gray-500 flex items-center gap-1"><Phone className="w-4 h-4" /> Téléphone</p>
                    <p className="font-medium">{selectedMessage.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-ymad-gray-500 flex items-center gap-1"><Calendar className="w-4 h-4" /> Date d'envoi</p>
                  <p className="font-medium">{formatDate(selectedMessage.createdAt)}</p>
                </div>
              </div>

              {/* Sujet */}
              <div>
                <h3 className="font-semibold text-ymad-gray-800 mb-2">📋 Sujet</h3>
                <p className="text-ymad-gray-700 p-3 bg-ymad-gray-50 rounded-lg">{selectedMessage.subject}</p>
              </div>

              {/* Message */}
              <div>
                <h3 className="font-semibold text-ymad-gray-800 mb-2">💬 Message</h3>
                <div className="p-4 bg-ymad-gray-50 rounded-lg whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Réponse existante */}
              {selectedMessage.reply && (
                <div className="border-l-4 border-ymad-green-500 pl-4">
                  <h3 className="font-semibold text-ymad-gray-800 mb-2 flex items-center gap-2">
                    <Reply className="w-4 h-4 text-ymad-green-600" /> Votre réponse
                  </h3>
                  <div className="p-4 bg-ymad-green-50 rounded-lg">
                    <p className="text-ymad-gray-700 whitespace-pre-wrap">{selectedMessage.reply}</p>
                    <p className="text-xs text-ymad-gray-400 mt-2">
                      Répondu le {selectedMessage.repliedAt ? formatDate(selectedMessage.repliedAt) : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setShowReplyModal(true);
                  }}
                  className="flex-1 bg-ymad-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-ymad-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Reply className="w-4 h-4" /> Répondre
                </button>
                <button
                  onClick={() => {
                    updateMessageStatus(selectedMessage.id, 
                      selectedMessage.status === 'archived' ? 'read' : 'archived'
                    );
                  }}
                  className="flex-1 border border-ymad-gray-300 py-2 rounded-lg hover:bg-ymad-gray-50 transition flex items-center justify-center gap-2"
                >
                  <Archive className="w-4 h-4" />
                  {selectedMessage.status === 'archived' ? 'Désarchiver' : 'Archiver'}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Supprimer ce message ?')) {
                      handleDelete(selectedMessage.id);
                      setShowDetail(false);
                    }
                  }}
                  className="flex-1 border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réponse */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowReplyModal(false)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-ymad-gray-800">✏️ Répondre à {selectedMessage.name}</h2>
              <button onClick={() => setShowReplyModal(false)} className="p-1 hover:bg-ymad-gray-100 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Email du destinataire</label>
                <input
                  type="email"
                  value={selectedMessage.email}
                  readOnly
                  className="w-full px-4 py-2 bg-ymad-gray-50 border border-ymad-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ymad-gray-700 mb-1">Votre réponse</label>
                <textarea
                  rows={6}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-4 py-2 border border-ymad-gray-300 rounded-lg focus:ring-2 focus:ring-ymad-blue-500 outline-none"
                  placeholder="Écrivez votre réponse ici..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 px-4 py-2 border border-ymad-gray-300 rounded-lg hover:bg-ymad-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReply}
                  className="flex-1 px-4 py-2 bg-ymad-blue-600 text-white rounded-lg font-semibold hover:bg-ymad-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Envoyer la réponse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}