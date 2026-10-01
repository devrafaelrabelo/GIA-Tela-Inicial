import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Clock, MapPin, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { usePortal } from '../../../context/PortalContext';
import { useModalDismiss } from '../../../hooks/useModalDismiss';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useAuth();
  const { addCalendarEvent } = usePortal();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Treinamento');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { handleBackdropClick } = useModalDismiss({
    isOpen,
    onClose
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!title.trim() || !date.trim()) {
      showToast('Por favor, informe o título e a data do evento.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await addCalendarEvent({
        title: title.trim(),
        date: date.trim(),
        category: category.trim(),
        time: time.trim() || undefined,
        location: location.trim() || undefined,
        description: description.trim() || 'Sem descrição adicional'
      });

      showToast('Evento adicionado ao calendário!', 'success');
      onClose();
    } catch (err: any) {
      console.error('Falha ao adicionar evento no servidor:', err);
      const msg = err?.message || 'Falha ao salvar no banco de dados do servidor.';
      setSubmitError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="calendar-publish-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white dark:bg-[#1e1819] border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden overscroll-contain flex flex-col max-h-[92vh] animate-slide-up"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7c172e]/10 text-[#7c172e] dark:text-rose-400 flex items-center justify-center font-bold shadow-2xs">
              <Calendar size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="calendar-publish-title" className="font-extrabold text-base text-stone-900 dark:text-stone-100 [text-wrap:balance]">
                  Agendar Evento no Calendário
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#7c172e]/10 text-[#7c172e] dark:bg-rose-950/60 dark:text-rose-300">
                  Calendário
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                Cadastre treinamentos, reuniões gerais e datas comemorativas
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar agendamento de evento"
            className="text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 p-1.5 rounded-xl hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto overscroll-contain space-y-4 flex-1 text-xs">
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <div className="flex-1">
                <p className="font-bold">Não foi possível adicionar o evento no servidor:</p>
                <p className="text-[11px] opacity-90 mt-0.5">{submitError}</p>
              </div>
            </div>
          )}
          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Título do Evento ou Treinamento *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Treinamento Corporativo GIA - Turma 02"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-bold shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                Data do Evento (Dia/Mês) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 28/09"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-bold shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <Tag size={12} className="text-[#7c172e]" />
                <span>Categoria *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none font-medium shadow-2xs cursor-pointer"
              >
                <option value="Treinamento">Treinamento</option>
                <option value="Comercial">Comercial</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Integração">Integração</option>
                <option value="Operacional">Operacional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <Clock size={12} className="text-stone-400" />
                <span>Horário (Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 14:00 às 16:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none shadow-2xs"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1 flex items-center gap-1">
                <MapPin size={12} className="text-stone-400" />
                <span>Local ou Link (Opcional)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Auditório Central / Google Meet"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
              Pauta / Descrição do Evento (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Descreva o objetivo do encontro, pré-requisitos ou recados para os participantes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-[#7c172e] outline-none leading-relaxed shadow-2xs resize-y"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#7c172e] to-[#631023] hover:from-[#8d1a34] shadow-md transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Adicionando no servidor...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Adicionar ao Calendário</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
