import React, { useState, useMemo } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Search,
  CalendarDays,
  ListFilter,
  ArrowRight
} from 'lucide-react';
import { CalendarEvent } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { usePortal } from '../../context/PortalContext';
import { useModalDismiss } from '../../hooks/useModalDismiss';
import { parseEventDate, isFutureEvent } from '../../utils/date';
import { matchesSeparatedWords } from '../../utils/text';
import { CalendarEventDetailModal } from './CalendarEventDetailModal';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const CATEGORY_STYLES: Record<string, { badge: string; dot: string; text: string; bg: string }> = {
  Treinamento: {
    badge: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
    dot: 'bg-indigo-500',
    text: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-50 dark:bg-indigo-950/40'
  },
  Comercial: {
    badge: 'bg-rose-50 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border-[#7c172e]/20',
    dot: 'bg-[#7c172e]',
    text: 'text-[#7c172e] dark:text-rose-300',
    bg: 'bg-rose-50 dark:bg-rose-950/40'
  },
  Corporativo: {
    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
    dot: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
    bg: 'bg-blue-50 dark:bg-blue-950/40'
  },
  Integração: {
    badge: 'bg-amber-50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-50 dark:bg-amber-950/40'
  },
  Operacional: {
    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40'
  }
};

interface FullCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullCalendarModal: React.FC<FullCalendarModalProps> = ({ isOpen, onClose }) => {
  const { authStatus, currentUser, openPublishModal } = useAuth();
  const { calendarEvents } = usePortal();
  const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

  // Estados principais
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date(2026, 8, 23)); // Setembro 2026
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyFuture, setOnlyFuture] = useState<boolean>(true);
  const [detailEvent, setDetailEvent] = useState<CalendarEvent | null>(null);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Navegação de mês
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDayNumber(null);
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDayNumber(null);
  };

  const handleGoToday = () => {
    setCurrentDate(new Date(2026, 8, 23));
    setSelectedDayNumber(23);
  };

  // Filtragem Geral de Eventos
  const filteredEvents = useMemo(() => {
    return calendarEvents
      .filter((evt) => {
        // Filtro de futuros
        if (onlyFuture && !isFutureEvent(evt.date, evt.time)) {
          return false;
        }

        // Filtro de categoria
        if (selectedCategory !== 'all' && evt.category !== selectedCategory) {
          return false;
        }

        // Filtro de busca com normalização completa de acentos
        if (searchQuery.trim()) {
          const searchable = `${evt.title} ${evt.category || ''} ${evt.description || ''} ${evt.location || ''}`;
          if (!matchesSeparatedWords(searchable, searchQuery)) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dA = parseEventDate(a.date, a.time);
        const dB = parseEventDate(b.date, b.time);
        if (!dA || !dB) return 0;
        return dA.getTime() - dB.getTime();
      });
  }, [calendarEvents, onlyFuture, selectedCategory, searchQuery]);

  // Eventos do mês atual exibido
  const currentMonthEvents = useMemo(() => {
    return filteredEvents.filter((evt) => {
      const d = parseEventDate(evt.date, evt.time);
      return d && d.getFullYear() === year && d.getMonth() === month;
    });
  }, [filteredEvents, year, month]);

  // Eventos mapeados por dia do mês atual
  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    for (const evt of currentMonthEvents) {
      const d = parseEventDate(evt.date, evt.time);
      if (d) {
        const dayNum = d.getDate();
        const list = map.get(dayNum) || [];
        list.push(evt);
        map.set(dayNum, list);
      }
    }
    return map;
  }, [currentMonthEvents]);

  // Eventos do dia selecionado
  const selectedDayEvents = useMemo(() => {
    if (selectedDayNumber === null) return [];
    return eventsByDay.get(selectedDayNumber) || [];
  }, [selectedDayNumber, eventsByDay]);

  // Eventos do próximo mês para referência rápida
  const nextMonthEvents = useMemo(() => {
    const nextM = (month + 1) % 12;
    const nextY = month === 11 ? year + 1 : year;
    return filteredEvents.filter((evt) => {
      const d = parseEventDate(evt.date, evt.time);
      return d && d.getFullYear() === nextY && d.getMonth() === nextM;
    });
  }, [filteredEvents, year, month]);

  // Células da Grade Mensal
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: Array<{
      dayNumber: number;
      isCurrentMonth: boolean;
      events: CalendarEvent[];
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    // Dias do mês anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        events: [],
        isToday: false,
        isSelected: false
      });
    }

    // Dias do mês atual
    const today = new Date(2026, 8, 23);
    const isThisCurrentRealMonth = today.getFullYear() === year && today.getMonth() === month;

    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const isToday = isThisCurrentRealMonth && today.getDate() === day;
      const isSelected = selectedDayNumber === day;
      cells.push({
        dayNumber: day,
        isCurrentMonth: true,
        events: eventsByDay.get(day) || [],
        isToday,
        isSelected
      });
    }

    // Dias do mês seguinte para completar matriz de 35 células (ou 42)
    const totalCells = cells.length <= 35 ? 35 : 42;
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
      cells.push({
        dayNumber: day,
        isCurrentMonth: false,
        events: [],
        isToday: false,
        isSelected: false
      });
    }

    return cells;
  }, [year, month, eventsByDay, selectedDayNumber]);

  if (!isOpen) return null;

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="full-calendar-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[90vh] sm:h-[88vh] lg:h-[720px] sm:min-h-[580px] lg:max-h-[740px] bg-white dark:bg-[#1a1415] border border-stone-200/90 dark:border-stone-800 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden flex flex-col animate-slide-up"
      >
        {/* ========================================================
            1. CABEÇALHO DO MODAL
            ======================================================== */}
        <div className="px-6 py-4 bg-stone-50/90 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs border border-[#7c172e]/15 shrink-0">
              <CalendarIcon size={20} className="stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="full-calendar-modal-title"
                  className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100 truncate"
                >
                  Calendário Corporativo Completo
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300 border border-[#7c172e]/20">
                  Ambozini
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium truncate">
                Agenda oficial de reuniões, treinamentos corporativos, campanhas e eventos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            {isEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openPublishModal('calendario');
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-2xs cursor-pointer"
              >
                <Plus size={14} />
                <span>Novo Evento</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar calendário"
              className="p-2 rounded-xl text-stone-400 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* ========================================================
            2. BARRA DE FILTROS & NAVEGAÇÃO
            ======================================================== */}
        <div className="px-6 py-3 bg-stone-50/50 dark:bg-stone-900/40 border-b border-stone-200/80 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          {/* Navegador de Mês */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-1 shadow-2xs">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Mês anterior"
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="px-3 text-xs font-extrabold text-stone-800 dark:text-stone-200 min-w-[130px] text-center select-none">
                {MONTH_NAMES[month]} {year}
              </span>

              <button
                type="button"
                onClick={handleNextMonth}
                title="Próximo mês"
                className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoToday}
              className="px-3 py-1.5 text-xs font-bold text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl transition-colors shadow-2xs cursor-pointer"
            >
              Hoje
            </button>
          </div>

          {/* Busca, Categoria e Modo de Exibição */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Input de Busca */}
            <div className="relative min-w-[170px] flex-1 sm:flex-initial">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar evento ou local..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:ring-2 focus:ring-[#7c172e] outline-none shadow-2xs"
              />
            </div>

            {/* Dropdown de Categorias */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-700 dark:text-stone-200 focus:ring-2 focus:ring-[#7c172e] outline-none shadow-2xs cursor-pointer"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Treinamento">Treinamento</option>
              <option value="Comercial">Comercial</option>
              <option value="Corporativo">Corporativo</option>
              <option value="Integração">Integração</option>
              <option value="Operacional">Operacional</option>
            </select>

            {/* Alternância de Modo (Grade vs Lista) */}
            <div className="flex items-center bg-stone-200/70 dark:bg-stone-800 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Modo Grade Mensal + Agenda"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-stone-900 text-[#7c172e] dark:text-rose-400 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <CalendarDays size={13} />
                <span>Mês</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="Modo Lista Completa"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-stone-900 text-[#7c172e] dark:text-rose-400 shadow-2xs'
                    : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <ListFilter size={13} />
                <span>Lista</span>
              </button>
            </div>

            {/* Filtro apenas futuros */}
            <button
              type="button"
              onClick={() => setOnlyFuture((prev) => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                onlyFuture
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#7c172e] dark:text-rose-300 border-[#7c172e]/30'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-100'
              }`}
            >
              {onlyFuture ? 'Futuros ✓' : 'Todos'}
            </button>
          </div>
        </div>

        {/* ========================================================
            3. CORPO PRINCIPAL COM LAYOUT SPLIT (GRADE + AGENDA)
            ======================================================== */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 lg:p-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start lg:items-stretch lg:h-full">
              {/* ==============================================
                  COLUNA ESQUERDA (58%): GRADE MENSAL COMPACTA
                  ============================================== */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-2.5 bg-stone-50/50 dark:bg-stone-900/30 p-4 rounded-3xl border border-stone-200/80 dark:border-stone-800">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-stone-800 dark:text-stone-200">
                      {MONTH_NAMES[month]} {year}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">
                      ({currentMonthEvents.length} {currentMonthEvents.length === 1 ? 'evento' : 'eventos'})
                    </span>
                  </div>

                  {selectedDayNumber !== null && (
                    <button
                      type="button"
                      onClick={() => setSelectedDayNumber(null)}
                      className="text-[11px] text-[#7c172e] dark:text-rose-400 font-bold hover:underline cursor-pointer"
                    >
                      Mostrar todos do mês
                    </button>
                  )}
                </div>

                {/* Cabeçalho dos dias da semana */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {WEEKDAY_NAMES.map((w, idx) => (
                    <div
                      key={idx}
                      className="py-1 text-[11px] font-black uppercase tracking-wider text-stone-400 dark:text-stone-500 select-none"
                    >
                      {w}
                    </div>
                  ))}
                </div>

                {/* Células do Calendário */}
                <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                  {calendarCells.map((cell, idx) => {
                    const hasEvents = cell.events.length > 0;

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          if (cell.isCurrentMonth) {
                            setSelectedDayNumber(cell.dayNumber === selectedDayNumber ? null : cell.dayNumber);
                          }
                        }}
                        className={`h-12 sm:h-13 lg:h-14 p-1 sm:p-1.5 rounded-xl border transition-all flex flex-col justify-between select-none ${
                          !cell.isCurrentMonth
                            ? 'border-transparent text-stone-300 dark:text-stone-700 bg-stone-50/20 dark:bg-stone-900/10 cursor-default'
                            : cell.isSelected
                            ? 'border-[#7c172e] ring-2 ring-[#7c172e]/30 bg-rose-50 dark:bg-rose-950/40 cursor-pointer shadow-xs'
                            : cell.isToday
                            ? 'border-[#7c172e]/60 bg-rose-50/30 dark:bg-rose-950/20 hover:border-[#7c172e] cursor-pointer'
                            : hasEvents
                            ? 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 hover:border-[#7c172e]/50 cursor-pointer shadow-2xs'
                            : 'border-stone-100 dark:border-stone-800/80 bg-white/70 dark:bg-stone-900/40 hover:border-stone-300 dark:hover:border-stone-700 cursor-pointer'
                        }`}
                      >
                        {/* Número do Dia */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-extrabold tabular-nums w-5 h-5 rounded-full flex items-center justify-center ${
                              cell.isToday
                                ? 'bg-[#7c172e] text-white shadow-2xs'
                                : cell.isSelected
                                ? 'bg-[#7c172e] text-white'
                                : cell.isCurrentMonth
                                ? 'text-stone-800 dark:text-stone-200'
                                : 'text-stone-300 dark:text-stone-700'
                            }`}
                          >
                            {cell.dayNumber}
                          </span>

                          {hasEvents && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7c172e]" />
                          )}
                        </div>

                        {/* Indicadores de Eventos no Dia */}
                        <div className="space-y-0.5 overflow-hidden">
                          {cell.events.slice(0, 1).map((evt) => {
                            const catCfg = CATEGORY_STYLES[evt.category || 'Treinamento'] || CATEGORY_STYLES.Treinamento;
                            return (
                              <div
                                key={evt.id}
                                className={`text-[9px] font-bold px-1 py-0.2 rounded truncate flex items-center gap-1 ${catCfg.badge}`}
                              >
                                <span className={`w-1 h-1 rounded-full shrink-0 ${catCfg.dot}`} />
                                <span className="truncate">{evt.title}</span>
                              </div>
                            );
                          })}

                          {cell.events.length > 1 && (
                            <span className="text-[8px] font-black text-stone-400 block text-right pr-0.5">
                              +{cell.events.length - 1} mais
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Legenda de Categorias */}
                <div className="pt-2 border-t border-stone-200/60 dark:border-stone-800 flex items-center gap-3 flex-wrap text-[10px]">
                  {Object.entries(CATEGORY_STYLES).map(([cat, cfg]) => (
                    <div key={cat} className="flex items-center gap-1 text-stone-500 font-medium">
                      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      <span>{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ==============================================
                  COLUNA DIREITA (42%): AGENDA & DETALHES DE EVENTOS
                  ============================================== */}
              <div className="lg:col-span-5 flex flex-col h-full min-h-0 space-y-3">
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={16} className="text-[#7c172e] dark:text-rose-400" />
                    <h3 className="font-extrabold text-sm text-stone-900 dark:text-stone-100">
                      {selectedDayNumber !== null
                        ? `Eventos em ${selectedDayNumber} de ${MONTH_NAMES[month]}`
                        : `Agenda de ${MONTH_NAMES[month]} (${currentMonthEvents.length})`}
                    </h3>
                  </div>

                  {selectedDayNumber !== null && (
                    <span className="text-xs text-stone-400">
                      {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'evento' : 'eventos'}
                    </span>
                  )}
                </div>

                {/* Lista de Eventos do Mês / Dia Selecionado */}
                {(selectedDayNumber !== null ? selectedDayEvents : currentMonthEvents).length === 0 ? (
                  <div className="flex-1 min-h-[220px] p-6 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 flex flex-col items-center justify-center text-center space-y-2">
                    <CalendarIcon size={28} className="mx-auto text-stone-400 stroke-[1.8]" />
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      {selectedDayNumber !== null
                        ? `Nenhum evento agendado para o dia ${selectedDayNumber}`
                        : `Nenhum evento agendado para ${MONTH_NAMES[month]}`}
                    </p>
                    <p className="text-[11px] text-stone-400 max-w-xs mx-auto leading-relaxed">
                      Selecione outro dia com marcador ou avance para o próximo mês para conferir a programação corporativa.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1">
                    {(selectedDayNumber !== null ? selectedDayEvents : currentMonthEvents).map((evt) => {
                      const catCfg = CATEGORY_STYLES[evt.category || 'Treinamento'] || CATEGORY_STYLES.Treinamento;

                      return (
                        <div
                          key={evt.id}
                          onClick={() => setDetailEvent(evt)}
                          className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-[#7c172e]/50 hover:shadow-md transition-all group cursor-pointer space-y-2.5"
                        >
                          {/* Cabeçalho do Card */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              {/* Bloco de Data */}
                              <div className="w-11 h-11 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex flex-col items-center justify-center font-black border border-[#7c172e]/15 shrink-0">
                                <span className="text-sm leading-none tabular-nums font-black">
                                  {evt.date.split('/')[0]}
                                </span>
                                <span className="text-[9px] uppercase font-bold text-stone-500 mt-0.5">
                                  {MONTH_NAMES[parseInt(evt.date.split('/')[1] || '9', 10) - 1]?.slice(0, 3)}
                                </span>
                              </div>

                              <div>
                                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${catCfg.badge}`}>
                                  {evt.category}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailEvent(evt);
                              }}
                              className="text-xs font-bold text-[#7c172e] dark:text-rose-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
                            >
                              <span>Ver</span>
                              <ArrowRight size={12} />
                            </button>
                          </div>

                          {/* Título e Detalhes */}
                          <div className="space-y-1">
                            <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-100 group-hover:text-[#7c172e] dark:group-hover:text-rose-400 transition-colors leading-snug">
                              {evt.title}
                            </h4>

                            <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 flex-wrap pt-0.5">
                              {evt.time && (
                                <span className="flex items-center gap-1 font-medium">
                                  <Clock size={11} className="text-[#7c172e] dark:text-rose-400 shrink-0" />
                                  <span>{evt.time}</span>
                                </span>
                              )}

                              {evt.location && (
                                <span className="flex items-center gap-1 font-medium truncate max-w-[200px]">
                                  <MapPin size={11} className="text-[#7c172e] dark:text-rose-400 shrink-0" />
                                  <span className="truncate">{evt.location}</span>
                                </span>
                              )}
                            </div>

                            {evt.description && (
                              <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 leading-relaxed pt-1">
                                {evt.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Banner de Próximos Eventos em Outubro (quando em Setembro) */}
                {month === 8 && nextMonthEvents.length > 0 && (
                  <div className="shrink-0 p-3.5 rounded-2xl bg-gradient-to-r from-stone-50 to-rose-50/30 dark:from-stone-900/60 dark:to-rose-950/20 border border-stone-200/80 dark:border-stone-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                        +3
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          {nextMonthEvents.length} eventos em Outubro
                        </p>
                        <p className="text-[11px] text-stone-400">
                          Liderança, Inauguração e Convenção Anual
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextMonth}
                      className="px-3 py-1.5 text-xs font-bold text-[#7c172e] dark:text-rose-300 bg-white dark:bg-stone-900 hover:bg-[#7c172e]/10 border border-[#7c172e]/20 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Ver Outubro →
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================================
               4. VISUALIZAÇÃO EM LISTA COMPLETA / CRONOLÓGICA
               ======================================================== */
            <div className="space-y-3 max-w-3xl mx-auto">
              {filteredEvents.length === 0 ? (
                <div className="p-12 rounded-2xl bg-stone-50/60 dark:bg-stone-900/40 border border-stone-200/80 dark:border-stone-800 text-center space-y-2">
                  <CalendarIcon size={26} className="mx-auto text-stone-400" />
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-200">
                    Nenhum evento encontrado
                  </p>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Tente ajustar os filtros ou a busca acima.
                  </p>
                </div>
              ) : (
                filteredEvents.map((evt) => {
                  const catCfg = CATEGORY_STYLES[evt.category || 'Treinamento'] || CATEGORY_STYLES.Treinamento;
                  const isFuture = isFutureEvent(evt.date, evt.time);

                  return (
                    <div
                      key={evt.id}
                      onClick={() => setDetailEvent(evt)}
                      className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 hover:border-[#7c172e]/50 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group cursor-pointer"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                        {/* Bloco de Data */}
                        <div className="w-13 h-13 rounded-2xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex flex-col items-center justify-center font-black border border-[#7c172e]/15 shrink-0">
                          <span className="text-base leading-none tabular-nums font-black">
                            {evt.date.split('/')[0]}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-stone-500 dark:text-stone-400 mt-0.5">
                            {MONTH_NAMES[parseInt(evt.date.split('/')[1] || '9', 10) - 1]?.slice(0, 3)}
                          </span>
                        </div>

                        {/* Informações */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${catCfg.badge}`}>
                              {evt.category}
                            </span>
                            {isFuture && (
                              <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-full">
                                Futuro
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100 group-hover:text-[#7c172e] dark:group-hover:text-rose-400 transition-colors leading-snug">
                            {evt.title}
                          </h4>

                          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400 flex-wrap">
                            {evt.time && (
                              <span className="flex items-center gap-1 font-medium">
                                <Clock size={12} className="text-[#7c172e]" />
                                <span>{evt.time}</span>
                              </span>
                            )}

                            {evt.location && (
                              <span className="flex items-center gap-1 font-medium truncate max-w-xs">
                                <MapPin size={12} className="text-[#7c172e] shrink-0" />
                                <span className="truncate">{evt.location}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailEvent(evt);
                        }}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#7c172e] dark:text-rose-300 bg-[#7c172e]/10 hover:bg-[#7c172e]/15 border border-[#7c172e]/20 transition-colors whitespace-nowrap self-end sm:self-auto cursor-pointer"
                      >
                        Ver Detalhes →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ========================================================
            5. RODAPÉ DO MODAL
            ======================================================== */}
        <div className="px-6 py-3.5 bg-stone-50/90 dark:bg-stone-900/70 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span className="tabular-nums font-bold text-stone-800 dark:text-stone-200">
              {currentMonthEvents.length}
            </span>
            <span>
              {currentMonthEvents.length === 1 ? 'evento em' : 'eventos em'} {MONTH_NAMES[month]}
            </span>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <span className="text-stone-400">
              {filteredEvents.length} no total
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEditor && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openPublishModal('calendario');
                }}
                className="sm:hidden px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#7c172e] hover:bg-[#631023] transition-colors shadow-2xs cursor-pointer"
              >
                + Novo
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 dark:text-stone-300 bg-stone-200/70 dark:bg-stone-800 hover:bg-stone-300/80 dark:hover:bg-stone-700 transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>Fechar</span>
              <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-stone-300/80 dark:bg-stone-700 font-mono text-stone-500 dark:text-stone-400">
                ESC
              </kbd>
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhe Individual (quando clicado) */}
      <CalendarEventDetailModal
        event={detailEvent}
        isOpen={!!detailEvent}
        onClose={() => setDetailEvent(null)}
      />
    </div>
  );
};
