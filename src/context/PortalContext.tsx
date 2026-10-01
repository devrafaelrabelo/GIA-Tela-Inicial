import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Announcement,
  ForumPost,
  UnitRanking,
  CalendarEvent,
  Comment,
  DynamicCardContent,
  CompanyValueSlide,
  CompanyHighlightItem,
  EmployeeHighlightItem,
  NotificationItem,
  CompanyGoalData,
  TopUnitItem,
  MotivationalThought
} from '../types';
import { INITIAL_UNITS_RANKING } from '../data/mockData';
import { useAuth } from './AuthContext';
import { safeStorage } from '../utils/storage';
import { api } from '../services/api';
import { normalizeText, matchesSeparatedWords } from '../utils/text';

// ── Sub-state hooks ────────────────────────────────────────────────────────
import { useAnnouncementsState } from './hooks/useAnnouncementsState';
import { useForumState } from './hooks/useForumState';
import { useCalendarState } from './hooks/useCalendarState';
import { useHighlightsState } from './hooks/useHighlightsState';
import { useMetricsState } from './hooks/useMetricsState';
import { useCompanyValuesState } from './hooks/useCompanyValuesState';


export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    type: 'announcement',
    title: 'Novo Comunicado da Diretoria',
    message: 'Diretrizes de metas e bônus de performance para o 4º Trimestre foram publicadas.',
    timeAgo: 'Há 15 min',
    timestamp: '2026-09-23T11:45:00Z',
    read: false,
    link: '#comunicados-section',
    authorName: 'Carlos Mendonça',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'notif_2',
    type: 'forum',
    title: 'Nova resposta no Fórum de Ideias',
    message: 'Mariana Silva comentou: "Excelente iniciativa! Podemos aplicar também na filial Campinas."',
    timeAgo: 'Há 1 hora',
    timestamp: '2026-09-23T10:30:00Z',
    read: false,
    link: '#forum',
    authorName: 'Mariana Silva',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'
  },
  {
    id: 'notif_3',
    type: 'calendar',
    title: 'Reunião Geral de Alinhamento',
    message: 'Lembrete: Encontro geral com a presidência começa em 2 horas no auditório e Teams.',
    timeAgo: 'Há 2 horas',
    timestamp: '2026-09-23T09:15:00Z',
    read: false,
    link: '#calendario',
    authorName: 'Recursos Humanos'
  },
  {
    id: 'notif_4',
    type: 'highlight',
    title: 'Filial Campinas em Destaque!',
    message: 'A filial atingiu 125% da meta comercial e foi reconhecida como Empresa Destaque do mês.',
    timeAgo: 'Há 1 dia',
    timestamp: '2026-09-22T14:00:00Z',
    read: true,
    link: '#destaques',
    authorName: 'Diretoria de Expansão'
  },
  {
    id: 'notif_5',
    type: 'system',
    title: 'Manutenção do Sistema GIA',
    message: 'Atualização preventiva programada para domingo às 02h. Não haverá interrupção em horário comercial.',
    timeAgo: 'Há 2 dias',
    timestamp: '2026-09-21T18:00:00Z',
    read: true,
    link: '',
    authorName: 'Segurança & TI'
  }
];

interface PortalContextType {
  announcements: Announcement[];
  featuredAnnouncements: Announcement[];
  filteredAnnouncements: Announcement[];
  forumPosts: ForumPost[];
  filteredPosts: ForumPost[];
  isLoadingPosts: boolean;
  isLoadingAnnouncements: boolean;
  isLoadingGoal: boolean;
  isLoadingThoughts: boolean;
  isLoadingCalendar: boolean;
  isLoadingTopUnits: boolean;
  isLoadingValues: boolean;
  isLoadingHighlights: boolean;
  errorAnnouncements: string | null;
  errorPosts: string | null;
  errorGoal: string | null;
  errorThoughts: string | null;
  errorCalendar: string | null;
  errorTopUnits: string | null;
  errorValues: string | null;
  errorHighlights: string | null;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  visibilityFilter: 'all' | 'public' | 'members_only';
  setVisibilityFilter: (filter: 'all' | 'public' | 'members_only') => void;
  postStatusFilter: 'all' | 'active' | 'inactive';
  setPostStatusFilter: (status: 'all' | 'active' | 'inactive') => void;
  unitsRanking: UnitRanking[];
  calendarEvents: CalendarEvent[];
  dynamicCards: Record<string, DynamicCardContent>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  companyValues: CompanyValueSlide[];
  activeCompanyValues: CompanyValueSlide[];
  companyHighlights: CompanyHighlightItem[];
  employeeHighlights: EmployeeHighlightItem[];
  companyGoal: CompanyGoalData | null;
  motivationalThoughts: MotivationalThought[];
  topUnits: { delivery: TopUnitItem[]; selfService: TopUnitItem[] };
  notifications: NotificationItem[];
  unreadNotificationsCount: number;

  // Ações
  retryLoadCompanyGoal: () => Promise<void>;
  retryLoadMotivationalThoughts: () => Promise<void>;
  retrySyncAll: () => Promise<void>;
  toggleLike: (type: 'announcements' | 'forum', id: string) => void;
  togglePostLike: (id: string) => void;
  toggleDynamicCardLike: (cardId: string) => void;
  updateDynamicCard: (cardId: string, content: Partial<DynamicCardContent>) => Promise<void>;
  updateCompanyGoal: (goal: Partial<CompanyGoalData>) => Promise<void>;
  addMotivationalThought: (thought: Partial<MotivationalThought>) => Promise<MotivationalThought>;
  updateMotivationalThought: (id: string, thought: Partial<MotivationalThought>) => Promise<void>;
  deleteMotivationalThought: (id: string) => Promise<void>;
  toggleMotivationalThoughtLike: (id: string) => void;
  updateTopUnit: (id: string, unit: Partial<TopUnitItem>) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => Promise<CalendarEvent>;
  deleteCalendarEvent: (id: string) => Promise<void>;
  addForumComment: (postId: string, comment: Partial<Comment>) => Promise<void>;
  addAnnouncementComment: (announcementId: string, text: string) => Promise<void>;
  addForumPost: (post: Partial<ForumPost>) => Promise<ForumPost>;
  updateForumPost: (id: string, updated: Partial<ForumPost>, reason?: string) => Promise<void>;
  toggleForumPostActive: (id: string, reason?: string) => Promise<void>;
  addAnnouncement: (announcement: Partial<Announcement>) => Promise<Announcement>;
  updateAnnouncement: (id: string, updated: Partial<Announcement>, reason?: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  toggleAnnouncementActive: (id: string, reason?: string) => Promise<void>;
  toggleAnnouncementFeatured: (id: string) => void;
  toggleAnnouncementVisibility: (id: string) => void;
  addCompanyValue: (val: Omit<CompanyValueSlide, 'id'>) => Promise<CompanyValueSlide>;
  updateCompanyValue: (id: string, val: Partial<CompanyValueSlide>) => Promise<void>;
  deleteCompanyValue: (id: string) => Promise<void>;
  toggleCompanyValueActive: (id: string) => void;
  addCompanyHighlight: (item: Omit<CompanyHighlightItem, 'id' | 'likesCount' | 'userLiked'>) => Promise<CompanyHighlightItem>;
  updateCompanyHighlight: (id: string, item: Partial<CompanyHighlightItem>) => Promise<void>;
  deleteCompanyHighlight: (id: string) => Promise<void>;
  toggleCompanyHighlightLike: (id: string) => void;
  addEmployeeHighlight: (item: Omit<EmployeeHighlightItem, 'id' | 'likesCount' | 'userLiked'>) => Promise<EmployeeHighlightItem>;
  updateEmployeeHighlight: (id: string, item: Partial<EmployeeHighlightItem>) => Promise<void>;
  deleteEmployeeHighlight: (id: string) => Promise<void>;
  toggleEmployeeHighlightLike: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationAsUnread: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearReadNotifications: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'timestamp' | 'timeAgo' | 'read'>) => void;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const STORAGE_PORTAL_KEY = 'ambozini_react_portal_state_v2';

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, authStatus, openGiaModal, showToast } = useAuth();

  // ── Shared UI state (stays in orchestrator) ──────────────────────────────
  const [unitsRanking] = useState<UnitRanking[]>(INITIAL_UNITS_RANKING);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // ── Sub-state hooks ──────────────────────────────────────────────────────
  const ann = useAnnouncementsState();
  const metrics = useMetricsState();
  const forum = useForumState(metrics.updateDynamicCard);
  const calendar = useCalendarState();
  const highlights = useHighlightsState();
  const values = useCompanyValuesState();

  // Limpeza de qualquer resíduo de cache do localStorage para garantir fidelidade total ao banco Postgres
  useEffect(() => {
    [
      '_announcements',
      '_posts',
      '_dynamic_cards',
      '_motivational_thoughts',
      '_calendar',
      '_company_values',
      '_company_highlights',
      '_employee_highlights',
      '_company_goal',
      '_top_units',
      '_notifications'
    ].forEach((suffix) => {
      safeStorage.removeItem(STORAGE_PORTAL_KEY + suffix);
    });
  }, []);

  // ── Sync all ─────────────────────────────────────────────────────────────
  const syncWithDatabase = async () => {
    // Trigger parallel loads across all hooks
    await Promise.all([
      ann.loadAnnouncements(),
      forum.loadForumPosts(),
      calendar.loadCalendar(),
      highlights.loadHighlights(),
      values.loadCompanyValues(),
      metrics.loadMetrics(),
    ]);
  };

  useEffect(() => {
    syncWithDatabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retrySyncAll = async (): Promise<void> => {
    await syncWithDatabase();
  };

  // ── Computed values (shared between announcements and forum) ─────────────

  // 5 Avisos Principais em Destaque no Topo - Regra Estrita: Apenas postagens com isFeatured === true e ativas
  const featuredAnnouncements = useMemo(() => {
    const isLogged = authStatus !== 'unauthenticated' && !!currentUser;

    // Regra estrita 1: Apenas comunicados que foram EXPLICITAMENTE marcados como destaque (isFeatured === true) e estão ativos
    const activeFeatured = ann.announcements.filter(
      (a) => a.isFeatured === true && a.isActive !== false
    );

    // Regra estrita 2: Visitantes não logados só podem visualizar comunicados públicos
    const allowedFeatured = isLogged
      ? activeFeatured
      : activeFeatured.filter((a) => a.visibility === 'public');

    // Simplesmente respeitar a ordem do backend (já vem ordenado por prioridade)
    return allowedFeatured.slice(0, 5);
  }, [ann.announcements, authStatus, currentUser]);

  // Filtered Announcements (com suporte à busca por palavras separadas e sem acentos)
  const filteredAnnouncements = useMemo(() => {
    const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
    const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

    return ann.announcements.filter((item) => {
      // Inativos: apenas editores veem se quiserem
      if (!isEditor && item.isActive === false) return false;

      // Exclusivos para membros: precisa de login
      if (!isLogged && item.visibility === 'members_only') return false;

      // Busca na barra superior por palavras separadas sem distinção de acentos
      if (searchQuery.trim()) {
        const commentsText = (item.comments || []).map((c) => `${c.author || ''} ${c.content || ''}`).join(' ');
        const searchableText = `${item.title} ${item.content} ${item.summary || ''} ${item.category || ''} ${item.author || ''} ${item.authorDepartment || ''} ${commentsText}`;
        if (!matchesSeparatedWords(searchableText, searchQuery)) return false;
      }

      return true;
    });
  }, [ann.announcements, searchQuery, authStatus, currentUser]);

  // Filtered Forum Posts (Totalmente separados dos comunicados e avisos oficiais)
  const filteredPosts = useMemo(() => {
    const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
    const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

    return forum.forumPosts.filter((post) => {
      // Separação dos comunicados e avisos oficiais: não aparecem na Comunidade/Fórum
      if (post.targetCard === 'comunicados' || post.targetCard === 'avisos_principais') return false;
      if (post.category === 'Card: Comunicados' || post.category === 'Card: Avisos Principais') return false;

      // Status ativo/desativado
      if (!isEditor) {
        // Colaboradores comuns NUNCA veem posts desativados
        if (post.isActive === false) return false;
      } else {
        // Editores podem filtrar
        if (forum.postStatusFilter === 'active' && post.isActive === false) return false;
        if (forum.postStatusFilter === 'inactive' && post.isActive !== false) return false;
      }

      // REQUISITO: As postagens que precisam de login NÃO devem aparecer para quem não está logado!
      if (!isLogged && post.visibility === 'members_only') {
        return false;
      }

      // Visibility Filter
      if (forum.visibilityFilter === 'public' && post.visibility !== 'public') return false;
      if (forum.visibilityFilter === 'members_only' && post.visibility !== 'members_only') return false;

      // Category Filter (normalizado sem distinção de acentos)
      if (forum.selectedCategory !== 'Todas') {
        if (normalizeText(post.category) !== normalizeText(forum.selectedCategory)) return false;
      }

      // Search Query: Pesquisa por palavras separadas com normalização completa de acentos e diacríticos
      if (searchQuery.trim()) {
        const commentsText = (post.comments || []).map((c) => `${c.author || ''} ${c.content || ''}`).join(' ');
        const searchableText = `${post.title} ${post.content} ${post.category || ''} ${post.tag || ''} ${post.author?.name || ''} ${post.author?.role || ''} ${post.author?.unit || ''} ${commentsText}`;
        if (!matchesSeparatedWords(searchableText, searchQuery)) return false;
      }

      return true;
    });
  }, [forum.forumPosts, forum.visibilityFilter, forum.selectedCategory, searchQuery, authStatus, currentUser, forum.postStatusFilter]);

  // ── toggleLike: unified handler for announcements + forum ────────────────
  const toggleLike = (type: 'announcements' | 'forum', id: string) => {
    if (type === 'announcements') {
      ann.toggleAnnouncementLike(id);
      return;
    }
    if (type === 'forum') {
      forum.togglePostLike(id);
    }
  };

  // ── Notifications (stays in orchestrator) ────────────────────────────────
  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markNotificationAsUnread = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações foram marcadas como lidas.', 'info');
  };

  const clearReadNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
    showToast('Notificações lidas foram removidas.', 'info');
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'timeAgo' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      timeAgo: 'Agora mesmo',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // ── Comment handlers ─────────────────────────────────────────────────────
  const addAnnouncementComment = async (announcementId: string, text: string): Promise<void> => {
    if (authStatus === 'unauthenticated' || !currentUser) {
      showToast('Faça login no GIA para comentar nesta publicação. 🔒', 'info');
      openGiaModal();
      return;
    }
    const newComment: Comment = {
      id: crypto.randomUUID(),
      author: currentUser.name,
      authorRole: currentUser.role,
      authorAvatar: currentUser.avatar,
      timeAgo: 'Agora mesmo',
      content: text
    };
    try {
      await api.addAnnouncementComment(announcementId, newComment);
      ann.setAnnouncements((prev) =>
        prev.map((a) => (a.id === announcementId ? { ...a, comments: [...(a.comments || []), newComment] } : a))
      );
      showToast('Comentário registrado!', 'success');
    } catch (err: unknown) {
      console.error('Erro ao registrar comentário no backend:', err);
      const errMsg = err instanceof Error ? err.message : 'Falha no servidor';
      showToast(`Erro ao registrar comentário: ${errMsg}`, 'error');
      throw err;
    }
  };

  const addForumComment = forum.addForumComment;

  // ── Context value ─────────────────────────────────────────────────────────
  const contextValue = useMemo(
    () => ({
      // Announcements
      announcements: ann.announcements,
      featuredAnnouncements,
      filteredAnnouncements,
      isLoadingAnnouncements: ann.isLoadingAnnouncements,
      errorAnnouncements: ann.errorAnnouncements,
      addAnnouncement: ann.addAnnouncement,
      updateAnnouncement: ann.updateAnnouncement,
      deleteAnnouncement: ann.deleteAnnouncement,
      toggleAnnouncementActive: ann.toggleAnnouncementActive,
      toggleAnnouncementFeatured: ann.toggleAnnouncementFeatured,
      toggleAnnouncementVisibility: ann.toggleAnnouncementVisibility,

      // Forum
      forumPosts: forum.forumPosts,
      filteredPosts,
      isLoadingPosts: forum.isLoadingPosts,
      errorPosts: forum.errorPosts,
      selectedCategory: forum.selectedCategory,
      setSelectedCategory: forum.setSelectedCategory,
      visibilityFilter: forum.visibilityFilter,
      setVisibilityFilter: forum.setVisibilityFilter,
      postStatusFilter: forum.postStatusFilter,
      setPostStatusFilter: forum.setPostStatusFilter,
      addForumPost: forum.addForumPost,
      updateForumPost: forum.updateForumPost,
      toggleForumPostActive: forum.toggleForumPostActive,
      togglePostLike: forum.togglePostLike,

      // Calendar
      calendarEvents: calendar.calendarEvents,
      isLoadingCalendar: calendar.isLoadingCalendar,
      errorCalendar: calendar.errorCalendar,
      addCalendarEvent: calendar.addCalendarEvent,
      deleteCalendarEvent: calendar.deleteCalendarEvent,

      // Highlights
      companyHighlights: highlights.companyHighlights,
      employeeHighlights: highlights.employeeHighlights,
      isLoadingHighlights: highlights.isLoadingHighlights,
      errorHighlights: highlights.errorHighlights,
      addCompanyHighlight: highlights.addCompanyHighlight,
      updateCompanyHighlight: highlights.updateCompanyHighlight,
      deleteCompanyHighlight: highlights.deleteCompanyHighlight,
      toggleCompanyHighlightLike: highlights.toggleCompanyHighlightLike,
      addEmployeeHighlight: highlights.addEmployeeHighlight,
      updateEmployeeHighlight: highlights.updateEmployeeHighlight,
      deleteEmployeeHighlight: highlights.deleteEmployeeHighlight,
      toggleEmployeeHighlightLike: highlights.toggleEmployeeHighlightLike,

      // Metrics
      companyGoal: metrics.companyGoal,
      isLoadingGoal: metrics.isLoadingGoal,
      errorGoal: metrics.errorGoal,
      motivationalThoughts: metrics.motivationalThoughts,
      isLoadingThoughts: metrics.isLoadingThoughts,
      errorThoughts: metrics.errorThoughts,
      topUnits: metrics.topUnits,
      isLoadingTopUnits: metrics.isLoadingTopUnits,
      errorTopUnits: metrics.errorTopUnits,
      dynamicCards: metrics.dynamicCards,
      updateCompanyGoal: metrics.updateCompanyGoal,
      retryLoadCompanyGoal: metrics.retryLoadCompanyGoal,
      addMotivationalThought: metrics.addMotivationalThought,
      updateMotivationalThought: metrics.updateMotivationalThought,
      deleteMotivationalThought: metrics.deleteMotivationalThought,
      toggleMotivationalThoughtLike: metrics.toggleMotivationalThoughtLike,
      retryLoadMotivationalThoughts: metrics.retryLoadMotivationalThoughts,
      updateTopUnit: metrics.updateTopUnit,
      toggleDynamicCardLike: metrics.toggleDynamicCardLike,
      updateDynamicCard: metrics.updateDynamicCard,

      // Company Values
      companyValues: values.companyValues,
      activeCompanyValues: values.activeCompanyValues,
      isLoadingValues: values.isLoadingValues,
      errorValues: values.errorValues,
      addCompanyValue: values.addCompanyValue,
      updateCompanyValue: values.updateCompanyValue,
      deleteCompanyValue: values.deleteCompanyValue,
      toggleCompanyValueActive: values.toggleCompanyValueActive,

      // Shared / Orchestrator
      unitsRanking,
      searchQuery,
      setSearchQuery,
      notifications,
      unreadNotificationsCount,
      toggleLike,
      addAnnouncementComment,
      addForumComment,
      retrySyncAll,
      markNotificationAsRead,
      markNotificationAsUnread,
      markAllNotificationsAsRead,
      clearReadNotifications,
      deleteNotification,
      addNotification,
    }),
    [
      // Announcements
      ann.announcements,
      ann.isLoadingAnnouncements,
      ann.errorAnnouncements,
      featuredAnnouncements,
      filteredAnnouncements,

      // Forum
      forum.forumPosts,
      filteredPosts,
      forum.isLoadingPosts,
      forum.errorPosts,
      forum.selectedCategory,
      forum.visibilityFilter,
      forum.postStatusFilter,

      // Calendar
      calendar.calendarEvents,
      calendar.isLoadingCalendar,
      calendar.errorCalendar,

      // Highlights
      highlights.companyHighlights,
      highlights.employeeHighlights,
      highlights.isLoadingHighlights,
      highlights.errorHighlights,

      // Metrics
      metrics.companyGoal,
      metrics.isLoadingGoal,
      metrics.errorGoal,
      metrics.motivationalThoughts,
      metrics.isLoadingThoughts,
      metrics.errorThoughts,
      metrics.topUnits,
      metrics.isLoadingTopUnits,
      metrics.errorTopUnits,
      metrics.dynamicCards,

      // Company Values
      values.companyValues,
      values.activeCompanyValues,
      values.isLoadingValues,
      values.errorValues,

      // Shared
      unitsRanking,
      searchQuery,
      notifications,
      unreadNotificationsCount,
    ]
  );

  return (
    <PortalContext.Provider value={contextValue}>
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal deve ser usado dentro de um PortalProvider');
  return ctx;
};
