// src/components/NotificationBell.tsx (ATUALIZADO)

import { Bell } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationBellProps {
  notifications: Notification[];
  onClick: () => void;
}

export function NotificationBell({ notifications, onClick }: NotificationBellProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700 transition-smooth touch-feedback mr-2"
      aria-label={`Notificações${hasUnread ? ` (${unreadCount} não lidas)` : ''}`}
    >
      <Bell 
        size={24}
        className={`${hasUnread ? 'text-blue-400 animate-wiggle' : 'text-slate-400'}`}
        strokeWidth={hasUnread ? 2.5 : 2}
      />
      
      {/* Badge de contador */}
      {hasUnread && (
        <div className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-[20px] px-1.5 bg-rose-500 border-2 border-slate-900 rounded-full animate-scale-in">
          <span className="text-[10px] font-black text-white leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        </div>
      )}
    </button>
  );
}