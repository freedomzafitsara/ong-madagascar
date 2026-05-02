"use client";

import { useState, useEffect } from 'react';
import { contactService } from '@/services/adminService';
import toast from 'react-hot-toast';

export function ContactManagement() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const data = await contactService.getAll();
      setMessages(data.data || []);
    } catch (error) {
      toast.error('Erreur chargement messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (isLoading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold text-marine-900 mb-6">Messages de contact</h2>
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{message.name}</p>
                <p className="text-sm text-gray-500">{message.email}</p>
                <p className="text-sm text-gray-500 mt-1">{message.subject}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${message.status === 'new' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {message.status === 'new' ? 'Nouveau' : 'Lu'}
              </span>
            </div>
            <p className="text-gray-600 mt-2 text-sm">{message.message}</p>
            <p className="text-xs text-gray-400 mt-2">{new Date(message.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
