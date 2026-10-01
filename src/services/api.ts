import {
  Announcement,
  ForumPost,
  CalendarEvent,
  Comment,
  DynamicCardContent,
  CompanyValueSlide,
  CompanyHighlightItem,
  EmployeeHighlightItem,
  AuditLogEntry,
  CompanyGoalData,
  TopUnitItem,
  MotivationalThought
} from '../types';

const API_BASE = '/api';

// Helper genérico para requisições com timeout e tratamento de erro estrito
async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errMsg = `Erro ${response.status} ao comunicar com o servidor`;
      try {
        const errorJson = await response.json();
        if (errorJson && errorJson.error) {
          errMsg = errorJson.error;
        }
      } catch (_) {}
      console.warn(`[API] Resposta com erro (${response.status}) em ${endpoint}:`, errMsg);
      throw new Error(errMsg);
    }

    return (await response.json()) as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Tempo limite de conexão esgotado (timeout). O servidor demorou para responder.');
    }
    console.error(`[API] Falha de comunicação em ${endpoint}:`, error);
    throw error;
  }
}


export const api = {
  // 1. Health
  checkHealth: async () => {
    return request<{ status: string; engine: string }>('/health');
  },

  // 2. Comunicados
  getAnnouncements: async (): Promise<Announcement[]> => {
    return request<Announcement[]>('/announcements');
  },

  createAnnouncement: async (announcement: Partial<Announcement>): Promise<Announcement> => {
    return request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcement)
    });
  },

  updateAnnouncement: async (id: string, updated: Partial<Announcement>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updated)
    });
  },

  deleteAnnouncement: async (id: string, actorName?: string, reason?: string): Promise<{ success: boolean; deactivated?: boolean }> => {
    return request<{ success: boolean; deactivated?: boolean }>(`/announcements/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ actorName, reason })
    });
  },

  toggleAnnouncementActive: async (
    id: string,
    actor?: { actorName?: string; actorRole?: string; reason?: string }
  ): Promise<{ success: boolean; isActive: boolean; auditLog: AuditLogEntry[] }> => {
    return request<{ success: boolean; isActive: boolean; auditLog: AuditLogEntry[] }>(`/announcements/${id}/toggle-active`, {
      method: 'PATCH',
      body: JSON.stringify(actor || {})
    });
  },

  toggleAnnouncementLike: async (id: string): Promise<{ userLiked: boolean; likesCount: number }> => {
    return request<{ userLiked: boolean; likesCount: number }>(`/announcements/${id}/like`, {
      method: 'POST'
    });
  },

  addAnnouncementComment: async (id: string, comment: Partial<Comment>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/announcements/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment)
    });
  },

  // 3. Postagens do Fórum
  getForumPosts: async (): Promise<ForumPost[]> => {
    return request<ForumPost[]>('/posts');
  },

  createForumPost: async (post: Partial<ForumPost>): Promise<ForumPost> => {
    return request<ForumPost>('/posts', {
      method: 'POST',
      body: JSON.stringify(post)
    });
  },

  updateForumPost: async (id: string, post: Partial<ForumPost>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post)
    });
  },

  toggleForumPostActive: async (
    id: string,
    actor?: { actorName?: string; actorRole?: string; actorAvatar?: string; reason?: string }
  ): Promise<{ success: boolean; isActive: boolean; auditLog: AuditLogEntry[] }> => {
    return request<{ success: boolean; isActive: boolean; auditLog: AuditLogEntry[] }>(`/posts/${id}/toggle-active`, {
      method: 'PATCH',
      body: JSON.stringify(actor || {})
    });
  },

  togglePostLike: async (id: string): Promise<{ userLiked: boolean; isLiked: boolean; likes: number }> => {
    return request<{ userLiked: boolean; isLiked: boolean; likes: number }>(`/posts/${id}/like`, {
      method: 'POST'
    });
  },

  addPostComment: async (id: string, comment: Partial<Comment>): Promise<{ success: boolean; commentsCount: number }> => {
    return request<{ success: boolean; commentsCount: number }>(`/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment)
    });
  },

  // 4. Calendário
  getCalendarEvents: async (): Promise<CalendarEvent[]> => {
    return request<CalendarEvent[]>('/calendar');
  },

  createCalendarEvent: async (event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    return request<CalendarEvent>('/calendar', {
      method: 'POST',
      body: JSON.stringify(event)
    });
  },

  deleteCalendarEvent: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/calendar/${id}`, {
      method: 'DELETE'
    });
  },

  // 5. Cards Dinâmicos
  getDynamicCards: async (): Promise<Record<string, DynamicCardContent>> => {
    return request<Record<string, DynamicCardContent>>('/dynamic-cards');
  },

  updateDynamicCard: async (id: string, card: Partial<DynamicCardContent>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/dynamic-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(card)
    });
  },

  // 5.1 Pensamentos do Dia (Card 1)
  getMotivationalThoughts: async (): Promise<MotivationalThought[]> => {
    return request<MotivationalThought[]>('/motivational-thoughts');
  },

  createMotivationalThought: async (thought: Partial<MotivationalThought>): Promise<MotivationalThought> => {
    return request<MotivationalThought>('/motivational-thoughts', {
      method: 'POST',
      body: JSON.stringify(thought)
    });
  },

  updateMotivationalThought: async (id: string, thought: Partial<MotivationalThought>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/motivational-thoughts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(thought)
    });
  },

  deleteMotivationalThought: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/motivational-thoughts/${id}`, {
      method: 'DELETE'
    });
  },

  toggleMotivationalThoughtLike: async (id: string): Promise<{ userLiked: boolean; likesCount: number }> => {
    return request<{ userLiked: boolean; likesCount: number }>(`/motivational-thoughts/${id}/like`, {
      method: 'POST'
    });
  },

  // 6. Valores da Empresa
  getCompanyValues: async (): Promise<CompanyValueSlide[]> => {
    return request<CompanyValueSlide[]>('/company-values');
  },

  createCompanyValue: async (val: Omit<CompanyValueSlide, 'id'>): Promise<CompanyValueSlide> => {
    return request<CompanyValueSlide>('/company-values', {
      method: 'POST',
      body: JSON.stringify(val)
    });
  },

  updateCompanyValue: async (id: string, val: Partial<CompanyValueSlide>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/company-values/${id}`, {
      method: 'PUT',
      body: JSON.stringify(val)
    });
  },

  deleteCompanyValue: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/company-values/${id}`, {
      method: 'DELETE'
    });
  },

  // 7. Destaques Empresa & Funcionário
  getCompanyHighlights: async (): Promise<CompanyHighlightItem[]> => {
    return request<CompanyHighlightItem[]>('/company-highlights');
  },

  createCompanyHighlight: async (item: Partial<CompanyHighlightItem>): Promise<CompanyHighlightItem> => {
    return request<CompanyHighlightItem>('/company-highlights', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  updateCompanyHighlight: async (id: string, item: Partial<CompanyHighlightItem>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/company-highlights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  },

  deleteCompanyHighlight: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/company-highlights/${id}`, {
      method: 'DELETE'
    });
  },

  toggleCompanyHighlightLike: async (id: string): Promise<{ userLiked: boolean; likesCount: number }> => {
    return request<{ userLiked: boolean; likesCount: number }>(`/company-highlights/${id}/like`, {
      method: 'POST'
    });
  },

  getEmployeeHighlights: async (): Promise<EmployeeHighlightItem[]> => {
    return request<EmployeeHighlightItem[]>('/employee-highlights');
  },

  createEmployeeHighlight: async (item: Partial<EmployeeHighlightItem>): Promise<EmployeeHighlightItem> => {
    return request<EmployeeHighlightItem>('/employee-highlights', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  updateEmployeeHighlight: async (id: string, item: Partial<EmployeeHighlightItem>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/employee-highlights/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  },

  deleteEmployeeHighlight: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/employee-highlights/${id}`, {
      method: 'DELETE'
    });
  },

  toggleEmployeeHighlightLike: async (id: string): Promise<{ userLiked: boolean; likesCount: number }> => {
    return request<{ userLiked: boolean; likesCount: number }>(`/employee-highlights/${id}/like`, {
      method: 'POST'
    });
  },

  // 8. Meta Geral da Empresa
  getCompanyGoals: async (): Promise<CompanyGoalData | null> => {
    return request<CompanyGoalData>('/company-goals');
  },

  updateCompanyGoals: async (goal: Partial<CompanyGoalData>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>('/company-goals', {
      method: 'PUT',
      body: JSON.stringify(goal)
    });
  },

  // 9. Top Unidades
  getTopUnits: async (): Promise<{ delivery: TopUnitItem[]; selfService: TopUnitItem[] }> => {
    return request<{ delivery: TopUnitItem[]; selfService: TopUnitItem[] }>('/top-units');
  },

  updateTopUnit: async (id: string, unit: Partial<TopUnitItem>): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/top-units/${id}`, {
      method: 'PUT',
      body: JSON.stringify(unit)
    });
  }
};
