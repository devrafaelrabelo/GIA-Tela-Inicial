import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowRight, Plus, Clock, ChevronRight, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { CalendarEvent } from '../../types';
import { isFutureEvent, parseEventDate } from '../../utils/date';
import { CalendarEventDetailModal } from '../modals/CalendarEventDetailModal';
import { FullCalendarModal } from '../modals/FullCalendarModal';

export const CalendarEvents: React.FC = () => {
  const { openPublishModal, authStatus, currentUser } = useAuth();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;
  const { calendarEvents, isLoadingCalendar, errorCalendar, retrySyncAll } = usePortal();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);
  const [filterType, setFilterType] = useState<'future' | 'past'>('future');

  // Eventos futuros ordenados cronologicamente (mais próximo primeiro)
  const futureEvents = useMemo(() => {
    return calendarEvents
      .filter((evt) => isFutureEvent(evt.date, evt.time))
      .sort((a, b) => {
        const timeA = parseEventDate(a.date, a.time)?.getTime() ?? 0;
        const timeB = parseEventDate(b.date, b.time)?.getTime() ?? 0;
        return timeA - timeB;
      });
  }, [calendarEvents]);

  // Eventos anteriores ordenados decrescente (mais recente primeiro)
  const pastEvents = useMemo(() => {
    return calendarEvents
      .filter((evt) => !isFutureEvent(evt.date, evt.time))
      .sort((a, b) => {
        const timeA = parseEventDate(a.date, a.time)?.getTime() ?? 0;
        const timeB = parseEventDate(b.date, b.time)?.getTime() ?? 0;
        return timeB - timeA;
      });
  }, [calendarEvents]);

  const displayedEvents = filterType === 'future' ? futureEvents : pastEvents;

  return (
    <>
      <section
        id="calendario-section"
        aria-label="Calendário Corporativo e Treinamentos"
        className="scroll-mt-24 bg-white dark:bg-[#1f191a] border border-stone-200/70 dark:border-stone-800 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full transition-colors"
      >
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs shrink-0">
                <CalendarIcon size={19} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-100 leading-snug">
                    Calendário
                  </h3>
                  {isEditor && (
                    <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                      Modo Gestão
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                  Eventos & Treinamentos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Filtro Futuros / Anteriores */}
              <div className="flex items-center p-1 rounded-xl bg-stone-100 dark:bg-stone-800/90 border border-stone-200/80 dark:border-stone-700 text-xs font-medium shadow-2xs">
                <button
                  type="button"
                  onClick={() => setFilterType('future')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer touch-manipulation ${
                    filterType === 'future'
                      ? 'bg-[#7c172e] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <span>Próximos</span>
                  <span className="text-[10px] opacity-80 tabular-nums">({futureEvents.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('past')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-bold cursor-pointer touch-manipulation ${
                    filterType === 'past'
                      ? 'bg-[#7c172e] text-white shadow-2xs'
                      : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  <span>Anteriores</span>
                  <span className="text-[10px] opacity-80 tabular-nums">({pastEvents.length})</span>
                </button>
              </div>

              {isEditor && (
                <button
                  type="button"
                  onClick={() => openPublishModal('calendario')}
                  title="Adicionar novo evento no Calendário"
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
                >
                  <Plus size={13} />
                  <span>Novo</span>
                </button>
              )}
            </div>
          </div>

          {/* Events list / Skeleton / Error / Empty States */}
          {isLoadingCalendar && displayedEvents.length === 0 ? (
            <div className="space-y-2.5 my-3 animate-pulse" aria-label="Carregando eventos do calendário">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/80"
                >
                  <div className="w-12 h-10 rounded-lg bg-stone-200 dark:bg-stone-800 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-3/4 bg-stone-200 dark:bg-stone-800 rounded-md" />
                    <div className="h-2.5 w-1/2 bg-stone-100 dark:bg-stone-800/60 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorCalendar && displayedEvents.length === 0 ? (
            <div className="my-3 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl py-8 px-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-2xs">
                <AlertCircle size={22} className="stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                  Não foi possível carregar a agenda
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                  Não foi possível sincronizar os eventos no momento.
                </p>
              </div>
              <button
                type="button"
                onClick={() => retrySyncAll()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-200 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border border-stone-200 dark:border-stone-700 shadow-2xs cursor-pointer touch-manipulation"
              >
                <RefreshCw size={13} />
                <span>Tentar novamente</span>
              </button>
            </div>
          ) : displayedEvents.length === 0 ? (
            <div className="my-3 bg-gradient-to-b from-stone-50/80 to-stone-50/40 dark:from-stone-900/50 dark:to-stone-900/20 border border-stone-200/60 dark:border-stone-800/80 rounded-2xl py-10 px-6 flex flex-col items-center justify-center text-center space-y-2 group">
              <div className="relative mb-1">
                <div className="w-12 h-12 rounded-2xl bg-[#7c172e]/10 dark:bg-rose-950/40 text-[#7c172e] dark:text-rose-400 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                  <CalendarIcon size={22} className="stroke-[2]" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 text-stone-900 text-[10px] font-bold flex items-center justify-center shadow-xs">
                  📅
                </span>
              </div>
              <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                {filterType === 'future' ? 'Nenhum evento futuro agendado' : 'Nenhum evento anterior registrado'}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
                {filterType === 'future'
                  ? 'Os próximos treinamentos, reuniões e datas comemorativas aparecerão aqui.'
                  : 'O histórico de reuniões e capacitações já concluídas aparecerá aqui.'}
              </p>
              {isEditor && (
                <button
                  type="button"
                  onClick={() => openPublishModal('calendario')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7c172e] dark:text-rose-300 bg-[#7c172e]/10 hover:bg-[#7c172e]/15 dark:bg-rose-950/40 transition-colors border border-[#7c172e]/20 cursor-pointer touch-manipulation"
                >
                  <Plus size={13} />
                  <span>Cadastrar evento no calendário</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5 my-3">
              {displayedEvents.slice(0, 4).map((evt) => {
                let evtTime = evt.time;
                let evtLoc = evt.location;
                if (!evtTime && evt.description?.includes('⏰ Horário:')) {
                  const m = evt.description.match(/⏰ Horário:\s*([^•]+)/);
                  if (m) evtTime = m[1].trim();
                }
                if (!evtLoc && evt.description?.includes('📍 Local:')) {
                  const m = evt.description.match(/📍 Local:\s*([^•]+)/);
                  if (m) evtLoc = m[1].trim();
                }

                // Extração da data com mês por numeral (ex: 28/09)
                const parsed = parseEventDate(evt.date);
                const day = parsed ? String(parsed.getDate()).padStart(2, '0') : evt.date.split('/')[0];
                const monthNum = parsed ? String(parsed.getMonth() + 1).padStart(2, '0') : (evt.date.split('/')[1] || '09');

                return (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => setSelectedEvent(evt)}
                    aria-label={`Ver detalhes do evento: ${evt.title}`}
                    className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl bg-stone-50/70 dark:bg-stone-900/50 border border-stone-100 dark:border-stone-800/80 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-100/80 dark:hover:bg-stone-800/70 transition-all text-xs group cursor-pointer touch-manipulation focus-visible:ring-2 focus-visible:ring-[#7c172e] focus-visible:outline-hidden"
                  >
                    {/* Bloco de Data com Mês por Numeral */}
                    <div className="w-12 py-1 px-1 rounded-xl bg-[#7c172e]/10 dark:bg-rose-950/40 text-[#7c172e] dark:text-rose-300 text-center flex-shrink-0 font-extrabold border border-[#7c172e]/15 tabular-nums flex flex-col items-center justify-center leading-tight">
                      <span className="text-sm font-black tracking-tight">{day}</span>
                      <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400 leading-none">/{monthNum}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-stone-800 dark:text-stone-200 font-bold truncate group-hover:text-[#7c172e] dark:group-hover:text-rose-400 transition-colors">
                        {evt.title}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 flex-wrap mt-0.5">
                        <span className="font-semibold text-stone-500 dark:text-stone-400 bg-stone-200/60 dark:bg-stone-800 px-1.5 py-0.2 rounded text-[9px]">
                          {evt.category || 'Geral'}
                        </span>
                        {filterType === 'past' && (
                          <span className="font-semibold text-stone-500 bg-stone-200/80 dark:bg-stone-800 px-1.5 py-0.2 rounded text-[9px]">
                            Realizado
                          </span>
                        )}
                        {evtTime && (
                          <span className="flex items-center gap-1 tabular-nums">
                            <Clock size={10} className="text-[#7c172e] dark:text-rose-400" />
                            <span>{evtTime}</span>
                          </span>
                        )}
                        {evtLoc && (
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <MapPin size={10} className="text-[#7c172e] dark:text-rose-400 shrink-0" />
                            <span className="truncate">{evtLoc}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-stone-300 dark:text-stone-600 group-hover:text-[#7c172e] group-hover:translate-x-0.5 transition-all" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Button footer */}
        <div className="pt-3 flex items-center justify-between text-xs border-t border-stone-100 dark:border-stone-800">
          <span className="text-xs text-stone-400 font-medium flex items-center gap-1.5 tabular-nums">
            <CalendarIcon size={13} className="text-stone-400" />
            {isLoadingCalendar && displayedEvents.length === 0 ? (
              <span>Carregando agenda...</span>
            ) : filterType === 'future' ? (
              <span>{futureEvents.length} {futureEvents.length === 1 ? 'evento futuro agendado' : 'eventos futuros agendados'}</span>
            ) : (
              <span>{pastEvents.length} {pastEvents.length === 1 ? 'evento anterior realizado' : 'eventos anteriores realizados'}</span>
            )}
          </span>

          <button
            type="button"
            onClick={() => setIsFullCalendarOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#7c172e] dark:text-rose-400 hover:underline cursor-pointer"
          >
            <span>Ver calendário completo</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </section>

      {/* Detail Modal */}
      <CalendarEventDetailModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />

      {/* Full Calendar Modal */}
      <FullCalendarModal
        isOpen={isFullCalendarOpen}
        onClose={() => setIsFullCalendarOpen(false)}
      />
    </>
  );
};
