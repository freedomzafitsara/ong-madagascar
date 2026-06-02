"use client";

import { useState, useEffect } from 'react';
import { contactService } from '@/services/contact.service';
import toast from 'react-hot-toast';
import { Mail, User, Calendar, CheckCircle, Clock, Trash2, Eye } from 'lucide-react';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function ContactManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMessages = async () => {
    try {
      const data = await contactService.getAllMessages();
      setMessages(data.data || []);
    } catch (error) {
      toast.error('Erreur chargement des messages');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await contactService.markAsRead(id);
      toast.success('Message marqué comme lu');
      fetchMessages();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      try {
        await contactService.deleteMessage(id);
        toast.success('Message supprimé avec succès');
        fetchMessages();
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleViewMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    if (!message.is_read) {
      handleMarkAsRead(message.id);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const getStatusBadge = (is_read: boolean) => {
    if (!is_read) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
          <Clock className="w-3 h-3" />
          Nouveau
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Lu
      </span>
    );
  };

  const unreadCount = messages.filter(m => !m.is_read).length;
  const totalCount = messages.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ymad-blue-200 border-t-ymad-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ymad-gray-500">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ymad-gray-800">Messages de contact</h1>
        <p className="text-ymad-gray-500 mt-1">
          Gérez les messages envoyés via le formulaire de contact
        </p>
        <div className="mt-2 text-sm text-ymad-gray-500">
          Total: {totalCount} message{totalCount !== 1 ? 's' : ''}
          {unreadCount > 0 && (
            <span className="ml-4 text-ymad-blue-600">
              ({unreadCount} non lu{unreadCount !== 1 ? 's' : ''})
            </span>
          )}
        </div>
      </div>

      {/* Liste des messages */}
      {messages.length === 0 ? (
        <div className="bg-ymad-gray-50 rounded-xl p-12 text-center">
          <Mail className="w-16 h-16 text-ymad-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ymad-gray-600 mb-2">
            Aucun message
          </h3>
          <p className="text-ymad-gray-400">
            Les messages envoyés via le formulaire de contact apparaîtront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-xl shadow-sm border hover:shadow-md ${
                !message.is_read ? 'border-l-4 border-l-ymad-blue-600' : 'border-ymad-gray-200'
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start flex-wrap gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-ymad-gray-400" />
                        <span className="font-semibold text-ymad-gray-800">
                          {message.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-ymad-gray-400" />
                        <a
                          href={`mailto:${message.email}`}
                          className="text-sm text-ymad-blue-600 hover:text-ymad-blue-700"
                        >
                          {message.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-ymad-gray-400" />
                        <span className="text-sm text-ymad-gray-500">
                          {new Date(message.created_at).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-ymad-gray-600 line-clamp-2 mt-2">
                      {message.message}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(message.is_read)}
                    <button
                      onClick={() => handleViewMessage(message)}
                      className="p-2 text-ymad-gray-500 hover:text-ymad-blue-600 hover:bg-ymad-blue-50 rounded-lg"
                      title="Voir le message"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-2 text-ymad-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de visualisation */}
      {isModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-ymad-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-ymad-gray-800">Détail du message</h2>
                <p className="text-sm text-ymad-gray-500 mt-1">
                  De: {selectedMessage.name} ({selectedMessage.email})
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ymad-gray-400 hover:text-ymad-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="bg-ymad-gray-50 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-ymad-gray-500">Nom:</span>
                    <p className="font-medium text-ymad-gray-800">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <span className="text-ymad-gray-500">Email:</span>
                    <p className="font-medium text-ymad-blue-600">{selectedMessage.email}</p>
                  </div>
                  <div>
                    <span className="text-ymad-gray-500">Date:</span>
                    <p className="font-medium text-ymad-gray-800">
                      {new Date(selectedMessage.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <span className="text-ymad-gray-500">Statut:</span>
                    <p>{getStatusBadge(selectedMessage.is_read)}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-ymad-gray-800 mb-2">Message:</h3>
                <div className="bg-ymad-gray-50 rounded-lg p-4 whitespace-pre-wrap text-ymad-gray-700">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-ymad-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-ymad-gray-600 hover:bg-ymad-gray-100 rounded-lg"
              >
                Fermer
              </button>
              {!selectedMessage.is_read && (
                <button
                  onClick={() => {
                    handleMarkAsRead(selectedMessage.id);
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-ymad-blue-600 text-white rounded-lg hover:bg-ymad-blue-700"
                >
                  Marquer comme lu
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}