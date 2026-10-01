import React from 'react';
import { X, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useModalDismiss } from '../../hooks/useModalDismiss';

interface CalendarEventDetailModalProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarEventDetailModal: React.FC<CalendarEventDetailModalProps> = ({
  event,
  isOpen,
  onClose
}) => {
  const { authStatus, currentUser, showToast, openConfirmModal } = useAuth();
  const { deleteCalendarEvent } = usePortal();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen || !event) return null;

  const handleDelete = () => {
    openConfirmModal({
      title: 'Remover Evento do Calendário',
      message: `Deseja realmente remover o evento "${event.title}" do calendário corporativo? Esta ação não pode ser desfeita.`,
      confirmText: 'Remover Evento',
      onConfirm: async () => {
        try {
          await deleteCalendarEvent(event.id);
          showToast('Evento excluído com sucesso.', 'info');
          onClose();
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : 'Falha ao excluir evento no servidor';
          showToast(errMsg, 'error');
        }
      }
    });
  };

  // Extract time, location, clean description if legacy format was used
  let displayTime = event.time;
  let displayLocation = event.location;
  let displayDescription = event.description || '';

  if (!displayTime && displayDescription.includes('⏰ Horário:')) {
    const match = displayDescription.match(/⏰ Horário:\s*([^•]+)/);
    if (match) displayTime = match[1].trim();
  }
  if (!displayLocation && displayDescription.includes('📍 Local:')) {
    const match = displayDescription.match(/📍 Local:\s*([^•]+)/);
    if (match) displayLocation = match[1].trim();
  }
  // Clean description of legacy prefix tokens for display
  displayDescription = displayDescription
    .replace(/⏰ Horário:[^•]+•?/, '')
    .replace(/📍 Local:[^•]+•?/, '')
    .trim();
  if (!displayDescription) {
    displayDescription = 'Nenhuma pauta ou detalhe adicional cadastrado para este evento.';
  }

  const isOnlineLink = displayLocation && (displayLocation.startsWith('http') || displayLocation.toLowerCase().includes('meet.google') || displayLocation.toLowerCase().includes('teams') || displayLocation.toLowerCase().includes('zoom'));

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden overscroll-contain animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-black text-sm shadow-2xs border border-[#7c172e]/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                  {event.category || 'Evento'}
                </span>
                <span className="text-xs font-extrabold text-stone-500">
                  Data: {event.date}
                </span>
              </div>
              <h3 className="font-extrabold text-lg text-stone-900 dark:text-stone-100 mt-0.5">
                Detalhes do Evento
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar detalhes do evento"
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <h2 id="calendar-modal-title" className="text-xl font-black text-stone-900 dark:text-stone-100 leading-snug [text-wrap:balance]">
              {event.title}
            </h2>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 text-xs">
              <Calendar className="w-4 h-4 text-[#7c172e] dark:text-rose-400 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Data Programada</div>
                <div className="font-bold text-stone-800 dark:text-stone-200">{event.date}</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 text-xs">
              <Clock className="w-4 h-4 text-[#7c172e] dark:text-rose-400 shrink-0" />
              <div>
                <div className="text-[10px] text-stone-400 uppercase font-bold">Horário</div>
                <div className="font-bold text-stone-800 dark:text-stone-200">{displayTime || 'Dia todo / A definir'}</div>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-center justify-between gap-2.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/50 border border-stone-200/60 dark:border-stone-800 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#7c172e] dark:text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-stone-400 uppercase font-bold">Local ou Plataforma</div>
                  <div className="font-bold text-stone-800 dark:text-stone-200 truncate">{displayLocation || 'Presencial / Sala da Unidade'}</div>
                </div>
              </div>

              {isOnlineLink && (
                <a
                  href={displayLocation?.startsWith('http') ? displayLocation : `https://${displayLocation}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-[#7c172e] text-white text-[11px] font-bold rounded-lg hover:bg-[#631023] transition-colors shrink-0"
                >
                  Abrir Link ↗
                </a>
              )}
            </div>
          </div>

          {/* Description / Pauta */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-stone-500">
              Pauta & Descrição Completa
            </label>
            <div className="p-4 rounded-2xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800/80 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-line">
              {displayDescription}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50/50 dark:bg-stone-900/30 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between">
          <div>
            {isEditor && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir evento</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#7c172e] hover:bg-[#631023] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#7c172e]/20 cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
