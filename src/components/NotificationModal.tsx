import { useState } from 'react';
import { X, Bell, Trash2 } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (id: string) => void;
}

export function NotificationModal({ 
  isOpen, 
  onClose, 
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete
}: NotificationModalProps) {
  if (!isOpen) return null;

  const hasUnread = notifications.some(n => !n.read);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'promotion': return '🎁';
      case 'reward': return '💰';
      case 'system': return '🔔';
      default: return '📬';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto animate-slide-up">
        <div className="bg-slate-800 border-t border-slate-700 rounded-t-3xl p-6 max-h-[80vh] overflow-hidden flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={22} className="text-blue-400" />
              <h3 className="text-lg font-bold text-white">Notificações</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-smooth p-1"
            >
              <X size={24} />
            </button>
          </div>

          {/* Marcar todas como lidas */}
          {hasUnread && (
            <button
              onClick={onMarkAllAsRead}
              className="mb-4 text-xs text-blue-400 hover:text-blue-300 font-semibold self-end transition-smooth"
            >
              Marcar todas como lidas
            </button>
          )}

          {/* Lista de Notificações */}
          <div className="flex-1 overflow-y-auto space-y-2 -mx-2 px-2">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell size={48} className="text-slate-600 mb-3" />
                <p className="text-slate-400 font-medium">Nenhuma notificação</p>
                <p className="text-slate-500 text-xs mt-1">Você está em dia! 🎉</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => !notification.read && onMarkAsRead(notification.id)}
                  className={`
                    p-4 rounded-xl border transition-smooth cursor-pointer
                    ${notification.read 
                      ? 'bg-slate-800/50 border-slate-700' 
                      : 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Ícone/Badge */}
                    <div className="flex-shrink-0 text-2xl mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-bold ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="flex-shrink-0 w-2 h-2 bg-blue-400 rounded-full mt-1"></div>
                        )}
                      </div>
                      
                      <p className={`text-xs mb-2 ${notification.read ? 'text-slate-500' : 'text-slate-400'}`}>
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-600 font-medium">
                          {formatTimestamp(notification.timestamp)}
                        </span>

                        {/* Botão deletar */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-smooth"
                          aria-label="Deletar notificação"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}