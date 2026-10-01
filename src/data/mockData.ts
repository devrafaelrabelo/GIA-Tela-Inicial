import {
  User,
  UnitRanking,
  CalendarEvent,
  Announcement,
  ForumPost,
  CompanyHighlightItem,
  EmployeeHighlightItem
} from '../types';

export const MOCK_USERS: Record<'editor' | 'reader', User> = {
  editor: {
    id: "user_editor",
    email: "ambroziniti@gmail.com",
    name: "João Silva",
    initials: "JS",
    role: "Gerente de Operações (Gestor)",
    unit: "Unidade Centro",
    canEdit: true,
    isEditor: true,
    badge: "👑 Gestor (Pode Publicar)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  reader: {
    id: "user_reader",
    email: "leitor@ambozini.com.br",
    name: "Lucas Pereira",
    initials: "LP",
    role: "Assistente Operacional",
    unit: "Unidade Sul",
    canEdit: false,
    isEditor: false,
    badge: "👤 Colaborador (Somente Leitura)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  }
};

export const INITIAL_UNITS_RANKING: UnitRanking[] = [];

// Dados de teste/mocks removidos da camada do frontend.
// Todas as postagens, comunicados, eventos e destaques agora são gerenciados e fornecidos
// exclusivamente pelo banco de dados PostgreSQL (PGlite) via API backend (/api).
export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [];
export const INITIAL_COMPANY_HIGHLIGHTS: CompanyHighlightItem[] = [];
export const INITIAL_EMPLOYEE_HIGHLIGHTS: EmployeeHighlightItem[] = [];
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [];
export const INITIAL_FORUM_POSTS: ForumPost[] = [];
