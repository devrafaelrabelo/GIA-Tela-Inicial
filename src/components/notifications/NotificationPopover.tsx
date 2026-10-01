import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  CheckCheck,
  Maximize2,
  X,
  Megaphone,
  MessageSquare,
  Calendar,
  Trophy,
  ShieldCheck,
  Check,
  RotateCcw,
  Trash2,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { NotificationItem, NotificationType } from '../../types';

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenModal: () => void;
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({
  isOpen,
  onClose,
  onOpenModal,
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markNotificationAsUnread,
    markAllNotificationsAsRead,
    clearReadNotifications,
    deleteNotification,
  } = usePortal();

  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou pressionar ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (popoverRef.current && !popoverRef.current.contains(target) && !target.closest('.notification-bell-container')) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const hasReadNotifications = notifications.some((n) => n.read);

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-3.5 h-3.5 text-[#7c172e] dark:text-rose-400" />;
      case 'forum':
        return <MessageSquare className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
      case 'calendar':
        return <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
      case 'highlight':
        return <Trophy className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
      case 'system':
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getTypeBadgeClass = (type: NotificationType) => {
    switch (type) {
      case 'announcement':
        return 'bg-rose-100 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300';
      case 'forum':
        return 'bg-amber-100 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300';
      case 'calendar':
        return 'bg-emerald-100 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300';
      case 'highlight':
        return 'bg-purple-100 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900/60 text-purple-800 dark:text-purple-300';
      case 'system':
      default:
        return 'bg-blue-100 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900/60 text-blue-800 dark:text-blue-300';
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'announcement':
        return 'Comunicado';
      case 'forum':
        return 'Fórum';
      case 'calendar':
        return 'Agenda';
      case 'highlight':
        return 'Destaque';
      case 'system':
      default:
        return 'Sistema';
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      markNotificationAsRead(item.id);
    }
    onClose();

    if (item.link) {
      const targetId = item.link.startsWith('#') ? item.link.substring(1) : item.link;
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-2', 'ring-[#7c172e]', 'transition-all', 'duration-500');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-[#7c172e]');
        }, 2000);
      }
    }
  };

  return (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label="Central de Notificações"
      className="absolute right-0 top-full mt-2 w-[350px] sm:w-[410px] max-w-[calc(100vw-24px)] z-50 bg-white dark:bg-[#1a1516] rounded-2xl shadow-2xl border border-stone-200/90 dark:border-stone-800/90 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 origin-top-right text-stone-800 dark:text-stone-200"
    >
      {/* Pequeno indicador triangular (caret) apontando para o sino */}
      <div className="absolute -top-1.5 right-3.5 w-3.5 h-3.5 bg-white dark:bg-[#1a1516] border-t border-l border-stone-200/90 dark:border-stone-800/90 rotate-45 pointer-events-none" />

      {/* Header do Popover */}
      <div className="px-4 py-3 border-b border-stone-200/70 dark:border-stone-800 flex items-center justify-between gap-2 bg-gradient-to-r from-stone-50 via-white to-stone-50 dark:from-[#20191b] dark:via-[#1a1516] dark:to-[#20191b] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#7c172e]/10 dark:bg-rose-950/40 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-white leading-tight">
              Notificações
            </h3>
            <span className="text-[10px] text-stone-500 dark:text-stone-400">
              {unreadNotificationsCount > 0 ? (
                <span className="text-[#bd1e3c] dark:text-rose-400 font-semibold">
                  {unreadNotificationsCount} não lida{unreadNotificationsCount > 1 ? 's' : ''}
                </span>
              ) : (
                'Tudo em dia ✓'
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              title="Marcar todas como lidas"
              aria-label="Marcar todas como lidas"
              className="p-1.5 text-stone-500 hover:text-[#7c172e] dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onOpenModal}
            title="Expandir central em tela cheia"
            aria-label="Expandir central em tela cheia"
            className="p-1.5 text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            title="Fechar"
            aria-label="Fechar painel"
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Filtro */}
      <div className="px-4 py-2 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#7c172e] text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            Todas <span className="opacity-80 text-[10px]">({notifications.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('unread')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all text-xs cursor-pointer ${
              activeTab === 'unread'
                ? 'bg-[#7c172e] text-white shadow-2xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-200/60 dark:hover:bg-stone-800'
            }`}
          >
            Não lidas{' '}
            {unreadNotificationsCount > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  activeTab === 'unread'
                    ? 'bg-white/20 text-white'
                    : 'bg-[#bd1e3c] text-white'
                }`}
              >
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>

        {hasReadNotifications && (
          <button
            type="button"
            onClick={clearReadNotifications}
            title="Limpar notificações lidas"
            className="text-[11px] text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 font-medium hover:underline cursor-pointer"
          >
            Limpar lidas
          </button>
        )}
      </div>

      {/* Lista de Notificações */}
      <div className="overflow-y-auto max-h-[350px] divide-y divide-stone-100 dark:divide-stone-800/60">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-400 flex items-center justify-center mb-2.5">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
              {activeTab === 'unread'
                ? 'Nenhuma notificação não lida'
                : 'Nenhuma notificação encontrada'}
            </p>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 max-w-[220px]">
              {activeTab === 'unread'
                ? 'Você está em dia com todas as atualizações do portal!'
                : 'Avisos e novidades aparecerão aqui quando forem publicados.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNotificationClick(item);
                }
              }}
              className={`p-3 sm:p-3.5 flex items-start gap-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer group relative ${
                !item.read
                  ? 'bg-rose-50/40 dark:bg-rose-950/20'
                  : 'bg-transparent opacity-85'
              }`}
            >
              {/* Ícone de Categoria ou Avatar */}
              <div className="relative shrink-0 mt-0.5">
                {item.authorAvatar ? (
                  <div className="relative">
                    <img
                      src={item.authorAvatar}
                      alt={item.authorName || 'Avatar'}
                      className="w-8 h-8 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-white dark:border-stone-900 flex items-center justify-center shadow-2xs ${getTypeBadgeClass(
                        item.type
                      )}`}
                    >
                      {getTypeIcon(item.type)}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center shadow-2xs ${getTypeBadgeClass(
                      item.type
                    )}`}
                  >
                    {getTypeIcon(item.type)}
                  </div>
                )}
              </div>

              {/* Informações da Notificação */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md border ${getTypeBadgeClass(
                      item.type
                    )}`}
                  >
                    {getTypeLabel(item.type)}
                  </span>
                  <span className="text-[10px] text-stone-400">•</span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    {item.timeAgo}
                  </span>
                  {!item.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#bd1e3c] shrink-0" />
                  )}
                </div>

                <h4
                  className={`text-xs text-stone-900 dark:text-stone-100 truncate ${
                    !item.read ? 'font-bold' : 'font-medium text-stone-700 dark:text-stone-300'
                  }`}
                >
                  {item.title}
                </h4>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 leading-snug mt-0.5">
                  {item.message}
                </p>

                {item.link && (
                  <div className="flex items-center gap-1 text-[10px] text-[#7c172e] dark:text-rose-400 font-semibold mt-1.5 group-hover:translate-x-0.5 transition-transform">
                    <span>Acessar</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Ações rápidas ao passar o mouse */}
              <div className="absolute top-2.5 right-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs p-0.5 rounded-lg border border-stone-200 dark:border-stone-800 shadow-xs">
                {item.read ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsUnread(item.id);
                    }}
                    title="Marcar como não lida"
                    aria-label="Marcar como não lida"
                    className="p-1 text-stone-400 hover:text-amber-600 rounded-md transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationAsRead(item.id);
                    }}
                    title="Marcar como lida"
                    aria-label="Marcar como lida"
                    className="p-1 text-stone-400 hover:text-emerald-600 rounded-md transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(item.id);
                  }}
                  title="Excluir notificação"
                  aria-label="Excluir notificação"
                  className="p-1 text-stone-400 hover:text-rose-600 rounded-md transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer do Popover */}
      <div className="px-3.5 py-2.5 bg-stone-50 dark:bg-[#1f191b] border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between text-xs">
        <span className="text-[11px] text-stone-400 font-medium">
          {notifications.length} notificaç{notifications.length === 1 ? 'ão' : 'ões'}
        </span>

        <button
          type="button"
          onClick={onOpenModal}
          className="text-[11px] font-bold text-[#7c172e] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Abrir Central Completa</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
