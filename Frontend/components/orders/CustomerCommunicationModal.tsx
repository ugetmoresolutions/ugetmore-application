"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Paperclip, 
  Send, 
  XCircle,
  User,
  Download
} from 'lucide-react';

export interface Communication {
  id: string;
  productId?: string;
  type: 'admin_message' | 'customer_message' | 'system_notification';
  message: string;
  sender: {
    id: string | number;
    name: string;
    role: string;
  };
  attachments: Array<{
    id: string;
    url: string;
    fileName: string;
    fileType: string;
  }>;
  createdAt: string;
  isRead: boolean;
}

interface CustomerCommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  communications: Communication[];
  onSendMessage: (message: string, files: File[]) => Promise<void>;
  orderId: string;
  productName: string;
}

const CustomerCommunicationModal: React.FC<CustomerCommunicationModalProps> = ({
  isOpen,
  onClose,
  communications,
  onSendMessage,
  orderId,
  productName
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim() && attachments.length === 0) return;
    
    setIsSending(true);
    try {
      await onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-lg border border-slate-200 h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Design Communication</h3>
              <p className="text-sm text-slate-600">
                {productName} • Order #{orderId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {communications.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No messages yet</p>
                <p className="text-sm">Start a conversation about this design</p>
              </div>
            ) : (
              communications.map((comm) => (
                <div
                  key={comm.id}
                  className={`flex ${comm.sender.role === 'admin' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-md rounded-lg p-4 ${
                      comm.sender.role === 'admin'
                        ? 'bg-blue-50 text-slate-900 border border-blue-200'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{comm.sender.name}</span>
                      <span className="text-xs opacity-75">
                        {formatDate(comm.createdAt)}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2">{comm.message}</p>
                    
                    {comm.attachments.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {comm.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.url}
                            download={attachment.fileName}
                            className={`flex items-center gap-2 p-2 rounded text-sm ${
                              comm.sender.role === 'admin'
                                ? 'bg-blue-100 hover:bg-blue-200 text-blue-900'
                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
                          >
                            <Paperclip className="w-3 h-3" />
                            <span className="truncate flex-1">{attachment.fileName}</span>
                            <Download className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-6 border-t border-slate-200">
            <div className="flex gap-3">
              <div className="flex-1">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-sm"
                />
                
                {attachments.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span className="truncate max-w-xs">{file.name}</span>
                        <button
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                          className="text-slate-500 hover:text-rose-500"
                        >
                          <XCircle className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors">
                  <Paperclip className="w-5 h-5 text-slate-600" />
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setAttachments(prev => [...prev, ...files]);
                    }}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={handleSendMessage}
                  disabled={(!message.trim() && attachments.length === 0) || isSending}
                  className="p-2 bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCommunicationModal;