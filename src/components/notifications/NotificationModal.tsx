import React, { useState, useMemo } from 'react';
import {
  Bell,
  CheckCheck,
  X,
  Megaphone,
  MessageSquare,
  Calendar,
  Trophy,
  ShieldCheck,
  Check,
  RotateCcw,
  Trash2,
  ExternalLink,
  Search,
  Inbox,
  Clock
} from 'lucide-react';
import { usePortal } from '../../context/PortalContext';
import { NotificationItem, NotificationType } from '../../types';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { matchesSeparatedWords } from '../../utils/text';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
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

  const [searchFilter, setSearchFilter] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [onlyUnread, setOnlyUnread] = useState(false);

  const { modalRef, handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose,
    closeOnEsc: true,
    closeOnOutsideClick: true,
  });

  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Filtro não lidas
      if (onlyUnread && item.read) return false;

      // Filtro por tipo
      if (selectedType !== 'all' && item.type !== selectedType) return false;

      // Filtro por busca com normalização completa de acentos
      if (searchFilter.trim()) {
        const searchable = `${item.title} ${item.message} ${item.authorName || ''} ${item.type || ''}`;
        return matchesSeparatedWords(searchable, searchFilter);
      }

      return true;
    });
  }, [notifications, onlyUnread, selectedType, searchFilter]);

  if (!isOpen) return null;

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#7c172e] dark:text-rose-400" />;
      case 'forum':
        return <MessageSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'calendar':
        return <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'highlight':
        return <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'system':
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
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

  const handleNavigate = (item: NotificationItem) => {
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

  const hasReadNotifications = notifications.some((n) => n.read);

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-white dark:bg-[#1a1516] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden text-stone-900 dark:text-stone-100 transition-all"
      >
        {/* Header do Modal */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-4 bg-gradient-to-r from-stone-50 via-white to-stone-50 dark:from-[#20191b] dark:via-[#1a1516] dark:to-[#20191b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c172e] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="notification-modal-title"
                  className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-tight"
                >
                  Central de Notificações
                </h2>
                {unreadNotificationsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#bd1e3c] text-white shadow-2xs">
                    {unreadNotificationsCount} nova{unreadNotificationsCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Em dia
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Acompanhe avisos da diretoria, interações do fórum, agenda e avisos do sistema
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#7c172e] dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Marcar todas como lidas</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar modal"
              className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="p-4 sm:px-6 border-b border-stone-200/60 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/40 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between shrink-0">
          {/* Campo de Busca */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por título, autor ou mensagem..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-white dark:bg-stone-900 border border-stone-300/80 dark:border-stone-700 text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7c172e] transition-all"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtros em Pílulas */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setOnlyUnread(false);
                setSelectedType('all');
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                !onlyUnread && selectedType === 'all'
                  ? 'bg-[#7c172e] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              Todas ({notifications.length})
            </button>

            <button
              type="button"
              onClick={() => setOnlyUnread(!onlyUnread)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                onlyUnread
                  ? 'bg-[#bd1e3c] text-white shadow-xs'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100'
              }`}
            >
              Não lidas ({unreadNotificationsCount})
            </button>

            <div className="h-4 w-px bg-stone-300 dark:bg-stone-700 mx-1 shrink-0" />

            <button
              type="button"
              onClick={() => setSelectedType(selectedType === 'announcement' ? 'all' : 'announcement')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedType === 'announcement'
                  ? 'bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 font-bold border border-rose-300 dark:border-rose-800'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
              }`}
            >
              Comunicados
            </button>

            <button
              type="button"
              onClick={() => setSelectedType(selectedType === 'forum' ? 'all' : 'forum')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedType === 'forum'
                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
              }`}
            >
              Fórum
            </button>

            <button
              type="button"
              onClick={() => setSelectedType(selectedType === 'calendar' ? 'all' : 'calendar')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedType === 'calendar'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-800'
                  : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
              }`}
            >
              Agenda
            </button>
          </div>
        </div>

        {/* Lista Principal de Notificações */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800/80 text-stone-400 flex items-center justify-center mb-3">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm">
                Não há notificações correspondentes aos filtros selecionados. Tente alterar os termos da busca ou redefinir os filtros.
              </p>
              {(searchFilter || selectedType !== 'all' || onlyUnread) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchFilter('');
                    setSelectedType('all');
                    setOnlyUnread(false);
                  }}
                  className="mt-4 px-4 py-1.5 rounded-xl text-xs font-semibold text-[#7c172e] dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 transition-colors cursor-pointer"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group ${
                  !item.read
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200/80 dark:border-rose-900/40 shadow-xs'
                    : 'bg-white dark:bg-stone-900/80 border-stone-200/80 dark:border-stone-800'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Avatar ou Ícone */}
                  <div className="relative shrink-0 mt-0.5">
                    {item.authorAvatar ? (
                      <div className="relative">
                        <img
                          src={item.authorAvatar}
                          alt={item.authorName || 'Avatar'}
                          className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700 shadow-2xs"
                        />
                        <div
                          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white dark:border-stone-900 flex items-center justify-center shadow-2xs ${getTypeBadgeClass(
                            item.type
                          )}`}
                        >
                          {getTypeIcon(item.type)}
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-2xs ${getTypeBadgeClass(
                          item.type
                        )}`}
                      >
                        {getTypeIcon(item.type)}
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getTypeBadgeClass(
                          item.type
                        )}`}
                      >
                        {getTypeLabel(item.type)}
                      </span>

                      {item.authorName && (
                        <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                          {item.authorName}
                        </span>
                      )}

                      <span className="text-xs text-stone-400">•</span>

                      <div className="flex items-center gap-1 text-xs text-stone-400">
                        <Clock className="w-3 h-3" />
                        <span>{item.timeAgo}</span>
                      </div>

                      {!item.read && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#bd1e3c] text-white">
                          NOVA
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-sm text-stone-900 dark:text-stone-100 ${
                        !item.read ? 'font-bold' : 'font-semibold'
                      }`}
                    >
                      {item.title}
                    </h4>

                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mt-1">
                      {item.message}
                    </p>
                  </div>
                </div>

                {/* Ações da Notificação */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/60 dark:border-stone-800 w-full sm:w-auto justify-end">
                  {item.link && (
                    <button
                      type="button"
                      onClick={() => handleNavigate(item)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#601224] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>Acessar</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.read ? (
                    <button
                      type="button"
                      onClick={() => markNotificationAsUnread(item.id)}
                      title="Marcar como não lida"
                      className="p-1.5 text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => markNotificationAsRead(item.id)}
                      title="Marcar como lida"
                      className="p-1.5 text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteNotification(item.id)}
                    title="Excluir notificação"
                    className="p-1.5 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-stone-200/80 dark:border-stone-800 bg-stone-50 dark:bg-[#20191b] flex items-center justify-between gap-4 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-stone-500 dark:text-stone-400 font-medium">
              Total: <strong className="text-stone-800 dark:text-white font-bold">{notifications.length}</strong>
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="text-stone-500 dark:text-stone-400 font-medium">
              Não lidas: <strong className="text-[#bd1e3c] font-bold">{unreadNotificationsCount}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasReadNotifications && (
              <button
                type="button"
                onClick={clearReadNotifications}
                className="px-3 py-1.5 rounded-xl text-stone-600 dark:text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors font-medium cursor-pointer"
              >
                Limpar lidas
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl font-bold text-stone-700 dark:text-stone-300 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
