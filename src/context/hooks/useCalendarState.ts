import { useState, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { api } from '../../services/api';
import { CalendarEvent } from '../../types';

export function useCalendarState() {
  const { showToast } = useAuth();

  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [errorCalendar, setErrorCalendar] = useState<string | null>(null);

  const loadCalendar = useCallback(async () => {
    setIsLoadingCalendar(true);
    setErrorCalendar(null);
    try {
      const data = await api.getCalendarEvents();
      if (Array.isArray(data)) {
        setCalendarEvents(data);
        setErrorCalendar(null);
      } else {
        setErrorCalendar('Não foi possível conectar ao servidor para carregar o calendário corporativo.');
      }
    } catch {
      setErrorCalendar('Não foi possível conectar ao servidor para carregar o calendário corporativo.');
    } finally {
      setIsLoadingCalendar(false);
    }
  }, []);

  const addCalendarEvent = useCallback(async (newEvent: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const event: CalendarEvent = {
      ...newEvent,
      id: crypto.randomUUID()
    };
    try {
      const created = await api.createCalendarEvent(event);
      setCalendarEvents((prev) => [created || event, ...prev]);
      showToast(`Evento "${event.title}" adicionado ao Calendário! 📅`, 'success');
      return created || event;
    } catch (err: unknown) {
      console.error('Erro ao criar evento no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao criar evento: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  const deleteCalendarEvent = useCallback(async (id: string): Promise<void> => {
    try {
      await api.deleteCalendarEvent(id);
      setCalendarEvents((prev) => prev.filter((evt) => evt.id !== id));
      showToast('Evento removido do calendário.', 'info');
    } catch (err: unknown) {
      console.error('Erro ao remover evento do calendário:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao remover evento: ${errMsg}`, 'error');
      throw err;
    }
  }, [showToast]);

  return {
    calendarEvents,
    setCalendarEvents,
    isLoadingCalendar,
    setIsLoadingCalendar,
    errorCalendar,
    setErrorCalendar,
    loadCalendar,
    addCalendarEvent,
    deleteCalendarEvent,
  };
}
