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
  AuditLogEntry,
  NotificationItem,
  CompanyGoalData,
  TopUnitItem,
  MotivationalThought
} from '../types';
import {
  INITIAL_UNITS_RANKING
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { safeStorage } from '../utils/storage';
import { api } from '../services/api';
import { getForumPostTimestamp } from '../utils/date';
import { normalizeText, matchesSeparatedWords } from '../utils/text';


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
  addComment: (typeOrPostId: string, idOrComment: string | Partial<Comment>, maybeText?: string) => Promise<void>;
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
  const { currentUser, showToast, authStatus, openGiaModal } = useAuth();

  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true);
  const [isLoadingGoal, setIsLoadingGoal] = useState(true);
  const [isLoadingThoughts, setIsLoadingThoughts] = useState(true);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(true);
  const [isLoadingTopUnits, setIsLoadingTopUnits] = useState(true);
  const [isLoadingValues, setIsLoadingValues] = useState(true);
  const [isLoadingHighlights, setIsLoadingHighlights] = useState(true);

  const [errorAnnouncements, setErrorAnnouncements] = useState<string | null>(null);
  const [errorPosts, setErrorPosts] = useState<string | null>(null);
  const [errorGoal, setErrorGoal] = useState<string | null>(null);
  const [errorThoughts, setErrorThoughts] = useState<string | null>(null);
  const [errorCalendar, setErrorCalendar] = useState<string | null>(null);
  const [errorTopUnits, setErrorTopUnits] = useState<string | null>(null);
  const [errorValues, setErrorValues] = useState<string | null>(null);
  const [errorHighlights, setErrorHighlights] = useState<string | null>(null);

  // SEM CACHE NO FRONTEND: Estados iniciam vazios e são abastecidos estritamente pelo backend Postgres Lite
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
  const [dynamicCards, setDynamicCards] = useState<Record<string, DynamicCardContent>>({});
  const [unitsRanking] = useState<UnitRanking[]>(INITIAL_UNITS_RANKING);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [companyValues, setCompanyValues] = useState<CompanyValueSlide[]>([]);
  const [companyHighlights, setCompanyHighlights] = useState<CompanyHighlightItem[]>([]);
  const [employeeHighlights, setEmployeeHighlights] = useState<EmployeeHighlightItem[]>([]);
  const [companyGoal, setCompanyGoal] = useState<CompanyGoalData | null>(null);
  const [motivationalThoughts, setMotivationalThoughts] = useState<MotivationalThought[]>([]);
  const [topUnits, setTopUnits] = useState<{ delivery: TopUnitItem[]; selfService: TopUnitItem[] }>({
    delivery: [],
    selfService: []
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

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

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'members_only'>('all');
  const [postStatusFilter, setPostStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  // 5 Avisos Principais em Destaque no Topo - Regra Estrita: Apenas postagens com isFeatured === true e ativas
  const featuredAnnouncements = useMemo(() => {
    const isLogged = authStatus !== 'unauthenticated' && !!currentUser;

    // Regra estrita 1: Apenas comunicados que foram EXPLICITAMENTE marcados como destaque (isFeatured === true) e estão ativos
    const activeFeatured = announcements.filter(
      (a) => a.isFeatured === true && a.isActive !== false
    );

    // Regra estrita 2: Visitantes não logados só podem visualizar comunicados públicos
    const allowedFeatured = isLogged
      ? activeFeatured
      : activeFeatured.filter((a) => a.visibility === 'public');

    // Se houver aviso prioritário de folha salarial/pagamento entre os destacados, prioriza na primeira posição
    const sorted = [...allowedFeatured].sort((a, b) => {
      const aIsPayment =
        a.id === 'com_5' ||
        a.tag === 'RH & Folha' ||
        a.title?.toLowerCase().includes('pagamento') ||
        a.title?.toLowerCase().includes('folha');
      const bIsPayment =
        b.id === 'com_5' ||
        b.tag === 'RH & Folha' ||
        b.title?.toLowerCase().includes('pagamento') ||
        b.title?.toLowerCase().includes('folha');
      if (aIsPayment && !bIsPayment) return -1;
      if (!aIsPayment && bIsPayment) return 1;
      return 0;
    });

    return sorted.slice(0, 5);
  }, [announcements, authStatus, currentUser]);

  const activeCompanyValues = useMemo(() => {
    if (!Array.isArray(companyValues) || companyValues.length === 0) {
      return [];
    }
    const active = companyValues.filter((v) => v && v.isActive !== false);
    return active.length > 0 ? active : companyValues;
  }, [companyValues]);

  // Sincronização com o Banco de Dados Postgres Lite via API
  const syncWithDatabase = async () => {
    setIsLoadingAnnouncements(true);
    setIsLoadingPosts(true);
    setIsLoadingGoal(true);
    setIsLoadingThoughts(true);
    setIsLoadingCalendar(true);
    setIsLoadingTopUnits(true);
    setIsLoadingValues(true);
    setIsLoadingHighlights(true);
    setErrorAnnouncements(null);
    setErrorPosts(null);
    setErrorGoal(null);
    setErrorThoughts(null);
    setErrorCalendar(null);
    setErrorTopUnits(null);
    setErrorValues(null);
    setErrorHighlights(null);

    try {
      const [
        dbAnnouncements,
        dbPosts,
        dbCards,
        dbCalendar,
        dbValues,
        dbCompHighlights,
        dbEmpHighlights,
        dbGoal,
        dbTopUnits,
        dbThoughts
      ] = await Promise.allSettled([
        api.getAnnouncements(),
        api.getForumPosts(),
        api.getDynamicCards(),
        api.getCalendarEvents(),
        api.getCompanyValues(),
        api.getCompanyHighlights(),
        api.getEmployeeHighlights(),
        api.getCompanyGoals(),
        api.getTopUnits(),
        api.getMotivationalThoughts()
      ]);

      if (dbAnnouncements.status === 'fulfilled' && Array.isArray(dbAnnouncements.value)) {
        setAnnouncements(dbAnnouncements.value);
        setErrorAnnouncements(null);
      } else {
        setErrorAnnouncements('Falha ao sincronizar comunicados do servidor.');
      }

      if (dbPosts.status === 'fulfilled' && Array.isArray(dbPosts.value)) {
        const syncedPosts = dbPosts.value.map((p) => ({
          ...p,
          timestamp: p.timestamp || new Date(getForumPostTimestamp(p)).toISOString()
        }));
        setForumPosts(syncedPosts);
        setErrorPosts(null);
      } else {
        setErrorPosts('Falha ao sincronizar postagens do fórum.');
      }

      if (dbCards.status === 'fulfilled' && dbCards.value && Object.keys(dbCards.value).length > 0) {
        setDynamicCards(dbCards.value);
      }

      if (dbCalendar.status === 'fulfilled' && Array.isArray(dbCalendar.value)) {
        setCalendarEvents(dbCalendar.value);
        setErrorCalendar(null);
      } else {
        setErrorCalendar('Não foi possível conectar ao servidor para carregar o calendário corporativo.');
      }

      if (dbValues.status === 'fulfilled' && Array.isArray(dbValues.value)) {
        setCompanyValues(dbValues.value);
        setErrorValues(null);
      } else {
        setErrorValues('Não foi possível conectar ao servidor para carregar os valores da empresa.');
      }

      if (dbCompHighlights.status === 'fulfilled' && Array.isArray(dbCompHighlights.value)) {
        setCompanyHighlights(dbCompHighlights.value);
        setErrorHighlights(null);
      } else {
        setErrorHighlights('Não foi possível carregar os destaques corporativos.');
      }

      if (dbEmpHighlights.status === 'fulfilled' && Array.isArray(dbEmpHighlights.value)) {
        setEmployeeHighlights(dbEmpHighlights.value);
      }

      if (dbGoal.status === 'fulfilled' && dbGoal.value) {
        setCompanyGoal(dbGoal.value);
        setErrorGoal(null);
      } else if (dbGoal.status === 'fulfilled' && !dbGoal.value) {
        setErrorGoal('Metas não configuradas no servidor.');
      } else {
        setErrorGoal('Não foi possível conectar ao servidor para obter as metas da empresa.');
      }

      if (dbTopUnits.status === 'fulfilled' && dbTopUnits.value && Array.isArray(dbTopUnits.value.delivery)) {
        setTopUnits(dbTopUnits.value);
        setErrorTopUnits(null);
      } else {
        setErrorTopUnits('Não foi possível conectar ao servidor para obter o ranking das unidades.');
      }

      if (dbThoughts.status === 'fulfilled' && Array.isArray(dbThoughts.value) && dbThoughts.value.length > 0) {
        setMotivationalThoughts(dbThoughts.value);
        setErrorThoughts(null);
      } else if (dbThoughts.status === 'fulfilled' && Array.isArray(dbThoughts.value) && dbThoughts.value.length === 0) {
        if (dbCards.status === 'fulfilled' && dbCards.value && dbCards.value['card_1']) {
          setErrorThoughts(null);
        } else {
          setErrorThoughts('Nenhum pensamento cadastrado no servidor.');
        }
      } else {
        if (dbCards.status === 'fulfilled' && dbCards.value && dbCards.value['card_1']) {
          setErrorThoughts(null);
        } else {
          setErrorThoughts('Não foi possível conectar ao servidor para carregar o pensamento do dia.');
        }
      }
    } catch (err) {
      console.debug('Erro ao carregar dados do banco de dados:', err);
      setErrorGoal('Erro de conexão com o banco de dados.');
      setErrorThoughts('Erro de conexão com o banco de dados.');
      setErrorCalendar('Erro de conexão com o calendário.');
      setErrorTopUnits('Erro de conexão com o ranking.');
      setErrorValues('Erro de conexão com os valores da empresa.');
    } finally {
      setIsLoadingAnnouncements(false);
      setIsLoadingPosts(false);
      setIsLoadingGoal(false);
      setIsLoadingThoughts(false);
      setIsLoadingCalendar(false);
      setIsLoadingTopUnits(false);
      setIsLoadingValues(false);
      setIsLoadingHighlights(false);
    }
  };

  useEffect(() => {
    syncWithDatabase();
  }, []);

  const toggleLike = (type: 'announcements' | 'forum', id: string) => {
    if (type === 'announcements') {
      api.toggleAnnouncementLike(id).catch(() => {});
      setAnnouncements((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            if (item.visibility === 'members_only' && (authStatus === 'unauthenticated' || !currentUser)) {
              showToast('Faça login no GIA para curtir este comunicado. 🔒', 'info');
              openGiaModal();
              return item;
            }
            const nextLiked = !item.userLiked;
            const nextCount = (item.likesCount || 0) + (nextLiked ? 1 : -1);
            return { ...item, userLiked: nextLiked, likesCount: nextCount };
          }
          return item;
        })
      );
      return;
    }

    if (type === 'forum') {
      api.togglePostLike(id).catch(() => {});
      setForumPosts((prev) =>
        prev.map((post) => {
          if (post.id === id) {
            if (post.visibility === 'members_only' && (authStatus === 'unauthenticated' || !currentUser)) {
              showToast('Faça login no GIA para curtir este post exclusivo. 🔒', 'info');
              openGiaModal();
              return post;
            }
            const nextLiked = !post.userLiked && !post.isLiked;
            const nextCount = (post.likes || 0) + (nextLiked ? 1 : -1);
            return { ...post, userLiked: nextLiked, isLiked: nextLiked, likes: nextCount };
          }
          return post;
        })
      );
    }
  };

  const togglePostLike = (id: string) => {
    toggleLike('forum', id);
  };

  const addComment = async (typeOrPostId: string, idOrComment: string | Partial<Comment>, maybeText?: string): Promise<void> => {
    if (authStatus === 'unauthenticated' || !currentUser) {
      showToast('Faça login no GIA para comentar nesta publicação. 🔒', 'info');
      openGiaModal();
      return;
    }

    // Call signature 1: addComment(postId, { content: '...' })
    if (typeof idOrComment === 'object') {
      const commentObj = idOrComment as Partial<Comment>;
      const newComment: Comment = {
        id: 'c_' + Date.now(),
        author: commentObj.author || currentUser.name,
        authorRole: commentObj.authorRole || currentUser.role,
        role: commentObj.authorRole || currentUser.role,
        avatar: commentObj.authorAvatar || currentUser.avatar,
        authorAvatar: commentObj.authorAvatar || currentUser.avatar,
        date: 'Agora mesmo',
        timeAgo: 'Agora mesmo',
        text: commentObj.content || '',
        content: commentObj.content || ''
      };

      try {
        await api.addPostComment(typeOrPostId, newComment);
        setForumPosts((prev) =>
          prev.map((p) =>
            p.id === typeOrPostId
              ? { ...p, comments: [...(p.comments || []), newComment], commentsCount: (p.comments?.length || 0) + 1 }
              : p
          )
        );
        showToast('Comentário registrado!', 'success');
      } catch (err: any) {
        console.error('Erro ao adicionar comentário no backend:', err);
        showToast(`Erro ao registrar comentário: ${err?.message || 'Falha no servidor'}`, 'error');
        throw err;
      }
      return;
    }

    // Call signature 2: addComment(type, id, text)
    const type = typeOrPostId as 'announcements' | 'forum' | 'highlight';
    const id = idOrComment as string;
    const text = maybeText || '';

    const newComment: Comment = {
      id: 'c_' + Date.now(),
      author: currentUser.name,
      authorRole: currentUser.role,
      role: currentUser.role,
      avatar: currentUser.avatar,
      authorAvatar: currentUser.avatar,
      date: 'Agora mesmo',
      timeAgo: 'Agora mesmo',
      text,
      content: text
    };

    try {
      if (type === 'announcements') {
        await api.addAnnouncementComment(id, newComment);
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === id ? { ...a, comments: [...a.comments, newComment] } : a))
        );
        showToast('Comentário registrado!', 'success');
        return;
      }

      if (type === 'forum') {
        await api.addPostComment(id, newComment);
        setForumPosts((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, comments: [...p.comments, newComment], commentsCount: p.comments.length + 1 }
              : p
          )
        );
        showToast('Comentário registrado!', 'success');
      }
    } catch (err: any) {
      console.error('Erro ao registrar comentário no backend:', err);
      showToast(`Erro ao registrar comentário: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const toggleDynamicCardLike = (cardId: string) => {
    setDynamicCards((prev) => {
      const current = prev[cardId];
      if (!current) return prev;
      const nextLiked = !current.userLiked;
      const nextCount = (current.likesCount || 0) + (nextLiked ? 1 : -1);
      showToast(nextLiked ? 'Você curtiu esta publicação! ⭐' : 'Reação removida', 'info');
      const updated = {
        ...prev,
        [cardId]: {
          ...current,
          userLiked: nextLiked,
          likesCount: nextCount
        }
      };
      api.updateDynamicCard(cardId, { userLiked: nextLiked, likesCount: nextCount }).catch(() => {});
      return updated;
    });
  };

  const updateDynamicCard = async (cardId: string, content: Partial<DynamicCardContent>): Promise<void> => {
    try {
      await api.updateDynamicCard(cardId, content);
      setDynamicCards((prev) => ({
        ...prev,
        [cardId]: {
          ...(prev[cardId] || { id: cardId, likesCount: 0, userLiked: false }),
          ...content,
          id: cardId,
        }
      }));
    } catch (err: any) {
      console.error(`Erro ao salvar card dinâmico ${cardId}:`, err);
      showToast(`Erro ao salvar no servidor: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const addForumPost = async (postData: Partial<ForumPost>): Promise<ForumPost> => {
    const targetCard = postData.targetCard || 'forum';
    const nowIso = new Date().toISOString();
    const initialLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      action: 'created',
      timestamp: nowIso,
      authorName: currentUser?.name || 'Colaborador',
      authorRole: currentUser?.role || 'Colaborador',
      authorAvatar: currentUser?.avatar,
      details: 'Publicação criada na Comunidade & Fórum de Trocas'
    };

    const postPayload: Partial<ForumPost> = {
      id: 'post_' + Date.now(),
      targetCard,
      visibility: postData.visibility || 'members_only',
      author: postData.author || {
        name: currentUser?.name || 'Colaborador',
        role: currentUser?.role || 'Colaborador',
        unit: currentUser?.unit || 'Unidade Geral',
        avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        isEditor: currentUser?.isEditor || false,
      },
      title: postData.title || '',
      category: postData.category || 'Geral',
      tag: postData.tag || postData.category || 'Geral',
      createdAt: 'Agora mesmo',
      timeAgo: 'Agora mesmo',
      timestamp: nowIso,
      content: postData.content || '',
      imageUrl: postData.imageUrl,
      image: postData.imageUrl,
      likes: 1,
      userLiked: true,
      isLiked: true,
      commentsCount: 0,
      comments: [],
      pinned: postData.pinned || false,
      isActive: true,
      auditLog: [initialLog],
    };
    
    // REGRA ESTRITA: Postagem criada PRIMEIRO no backend. Se falhar, NÃO cria no frontend e emite erro.
    try {
      const createdPost = await api.createForumPost(postPayload);
      if (!createdPost || !createdPost.id) {
        throw new Error('Servidor não confirmou a criação da publicação.');
      }

      setForumPosts((prev) => [createdPost, ...prev]);

      // Atualiza imediatamente o card livre caso a publicação seja para ele
      if (['card_1', 'card_2', 'card_3', 'card_4'].includes(targetCard)) {
        updateDynamicCard(targetCard, {
          title: postData.title || 'Nova Publicação',
          content: postData.content || '',
          imageUrl: postData.imageUrl,
          authorName: createdPost.author?.name,
          authorRole: createdPost.author?.role,
          authorAvatar: createdPost.author?.avatar,
          updatedAt: 'Agora mesmo'
        });
      }

      return createdPost;
    } catch (err: any) {
      console.error('Falha ao criar postagem no backend:', err);
      const errMsg = err?.message || 'Falha ao salvar postagem no banco de dados.';
      showToast(`Erro ao criar postagem: ${errMsg}`, 'error');
      throw err;
    }
  };

  const updateForumPost = async (id: string, updated: Partial<ForumPost>, reason?: string): Promise<void> => {
    const post = forumPosts.find((p) => p.id === id);
    if (!post) return;

    const changedFields: string[] = [];
    if (updated.title !== undefined && updated.title !== post.title) changedFields.push('título');
    if (updated.content !== undefined && updated.content !== post.content) changedFields.push('conteúdo');
    if (updated.category !== undefined && updated.category !== post.category) changedFields.push('categoria');
    if (updated.visibility !== undefined && updated.visibility !== post.visibility) changedFields.push('visibilidade');
    if (updated.imageUrl !== undefined && updated.imageUrl !== post.imageUrl) changedFields.push('imagem');

    const newLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      action: 'updated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Colaborador',
      authorRole: currentUser?.role || 'Colaborador',
      authorAvatar: currentUser?.avatar,
      details: reason || (changedFields.length > 0 ? `Publicação editada (alterado: ${changedFields.join(', ')})` : 'Publicação atualizada'),
      changedFields
    };

    const newPost = {
      ...post,
      ...updated,
      auditLog: [newLog, ...(post.auditLog || [])]
    };

    try {
      await api.updateForumPost(id, newPost);
      setForumPosts((prev) => prev.map((p) => (p.id === id ? newPost : p)));
      showToast('Publicação atualizada com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar postagem no backend:', err);
      showToast(`Erro ao atualizar postagem: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const toggleForumPostActive = async (id: string, reason?: string): Promise<void> => {
    const post = forumPosts.find((p) => p.id === id);
    if (!post) return;

    const nextActive = post.isActive === false ? true : false;
    const newLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      action: nextActive ? 'reactivated' : 'deactivated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Administrador',
      authorRole: currentUser?.role || 'Gestor',
      authorAvatar: currentUser?.avatar,
      details: nextActive 
        ? (reason || 'Publicação reativada para exibição pública') 
        : (reason || 'Publicação desativada. Ocultada do feed público.')
    };

    const newPost = {
      ...post,
      isActive: nextActive,
      auditLog: [newLog, ...(post.auditLog || [])]
    };

    try {
      await api.toggleForumPostActive(id, {
        actorName: currentUser?.name,
        actorRole: currentUser?.role,
        actorAvatar: currentUser?.avatar,
        reason
      });

      setForumPosts((prev) => prev.map((p) => (p.id === id ? newPost : p)));
      showToast(
        nextActive ? 'Publicação reativada com sucesso! ✨' : 'Publicação desativada. Nenhuma informação foi apagada. 🔒',
        nextActive ? 'success' : 'info'
      );
    } catch (err: any) {
      console.error('Erro ao alterar status da postagem no backend:', err);
      showToast(`Erro ao alterar status da postagem: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const addCalendarEvent = async (newEvent: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> => {
    const event: CalendarEvent = {
      ...newEvent,
      id: 'ev_' + Date.now()
    };
    try {
      const created = await api.createCalendarEvent(event);
      setCalendarEvents((prev) => [created || event, ...prev]);
      showToast(`Evento "${event.title}" adicionado ao Calendário! 📅`, 'success');
      return created || event;
    } catch (err: any) {
      console.error('Erro ao criar evento no backend:', err);
      showToast(`Erro ao criar evento: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const addAnnouncement = async (newAnnData: Partial<Announcement>): Promise<Announcement> => {
    const isFeatured = newAnnData.isFeatured ?? false;
    const initialLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      action: 'created',
      timestamp: new Date().toISOString(),
      authorName: newAnnData.author || currentUser?.name || 'Gestão',
      details: 'Comunicado oficial criado no portal'
    };

    const announcement: Announcement = {
      id: 'com_' + Date.now(),
      targetCard: 'comunicados',
      title: newAnnData.title || '',
      author: newAnnData.author || currentUser?.name || 'Gestão',
      date: 'Hoje',
      visibility: newAnnData.visibility || 'members_only',
      summary: newAnnData.summary || (newAnnData.content ? newAnnData.content.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...' : ''),
      content: newAnnData.content || '',
      badge: isFeatured ? 'Destaque Principal' : (newAnnData.badge || 'Oficial'),
      icon: isFeatured ? 'star' : (newAnnData.icon || 'megaphone'),
      tag: isFeatured ? 'Aviso Principal' : (newAnnData.tag || 'Comunicado'),
      imageUrl: newAnnData.imageUrl,
      image: newAnnData.imageUrl,
      isFeatured,
      likesCount: 1,
      userLiked: true,
      comments: [],
      actionButtonText: newAnnData.actionButtonText,
      actionButtonUrl: newAnnData.actionButtonUrl,
      actionButtonSubtext: newAnnData.actionButtonSubtext,
      isActive: true,
      auditLog: [initialLog],
      // Incorpora todos os campos avançados do Novo Comunicado (categoria, tags, anexos, agendamento, etc)
      ...newAnnData,
    };

    // REGRA ESTRITA: Comunicado criado PRIMEIRO no backend. Se falhar, NÃO cria no frontend e emite erro.
    try {
      const createdAnn = await api.createAnnouncement(announcement);
      if (!createdAnn || !createdAnn.id) {
        throw new Error('Servidor não confirmou o registro do comunicado.');
      }

      setAnnouncements((prev) => {
        let updated = [createdAnn, ...prev];
        if (isFeatured) {
          // Enforce max 5 featured announcements
          let count = 0;
          updated = updated.map((item) => {
            if (item.isFeatured) {
              count++;
              if (count > 5) return { ...item, isFeatured: false };
            }
            return item;
          });
        }
        return updated;
      });

      showToast(
        isFeatured
          ? 'Aviso publicado e adicionado aos Avisos Principais no topo! 🌟'
          : 'Comunicado oficial publicado no mural! 📢',
        'success'
      );

      return createdAnn;
    } catch (err: any) {
      console.error('Falha ao criar comunicado no backend:', err);
      const errMsg = err?.message || 'Falha ao salvar comunicado no banco de dados.';
      showToast(`Erro ao publicar comunicado: ${errMsg}`, 'error');
      throw err;
    }
  };

  const toggleAnnouncementFeatured = (id: string) => {
    setAnnouncements((prev) => {
      const target = prev.find((a) => a.id === id);
      if (!target) return prev;
      const willBeFeatured = !target.isFeatured;

      api.updateAnnouncement(id, { isFeatured: willBeFeatured }).catch(() => {});

      let updated = prev.map((a) => {
        if (a.id === id) {
          return {
            ...a,
            isFeatured: willBeFeatured,
            badge: willBeFeatured ? 'Destaque Principal' : (a.badge === 'Destaque Principal' ? 'Oficial' : a.badge),
            icon: willBeFeatured ? 'star' : (a.icon === 'star' ? 'megaphone' : a.icon),
            tag: willBeFeatured ? 'Aviso Principal' : (a.tag === 'Aviso Principal' ? 'Comunicado' : a.tag)
          };
        }
        return a;
      });

      if (willBeFeatured) {
        let count = 0;
        updated = updated.map((item) => {
          if (item.isFeatured) {
            count++;
            if (count > 5) return { ...item, isFeatured: false };
          }
          return item;
        });
        showToast(`Aviso "${target.title.substring(0, 30)}..." promovido a Destaque no Topo! ⭐`, 'success');
      } else {
        showToast(`Aviso removido dos Destaques no Topo.`, 'info');
      }

      return updated;
    });
  };

  const toggleAnnouncementVisibility = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((ann) => {
        if (ann.id === id) {
          const nextVisibility = ann.visibility === 'public' ? 'members_only' : 'public';
          const newLog: AuditLogEntry = {
            id: 'log_' + Date.now(),
            action: 'updated',
            timestamp: new Date().toISOString(),
            authorName: currentUser?.name || 'Administrador',
            authorRole: currentUser?.role || 'Gestor',
            details: `Visibilidade alterada para ${nextVisibility === 'public' ? 'Público Aberto' : 'Apenas Colaboradores'}`,
            changedFields: ['visibilidade']
          };

          const newAnn: Announcement = {
            ...ann,
            visibility: nextVisibility,
            auditLog: [newLog, ...(ann.auditLog || [])]
          };

          api.updateAnnouncement(id, { visibility: nextVisibility }).catch(() => {});

          showToast(
            nextVisibility === 'public'
              ? 'Visibilidade alterada para Público Aberto 🌐'
              : 'Visibilidade alterada para Apenas Colaboradores 🔒',
            'info'
          );
          return newAnn;
        }
        return ann;
      })
    );
  };

  const updateAnnouncement = async (id: string, updated: Partial<Announcement>, reason?: string): Promise<void> => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;

    const changedFields: string[] = [];
    if (updated.title !== undefined && updated.title !== ann.title) changedFields.push('título');
    if (updated.summary !== undefined && updated.summary !== ann.summary) changedFields.push('resumo');
    if (updated.content !== undefined && updated.content !== ann.content) changedFields.push('conteúdo');
    if (updated.tag !== undefined && updated.tag !== ann.tag) changedFields.push('categoria/tag');
    if (updated.visibility !== undefined && updated.visibility !== ann.visibility) changedFields.push('visibilidade');

    const newLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      action: 'updated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Gestor',
      details: reason || (changedFields.length > 0 ? `Comunicado editado (alterado: ${changedFields.join(', ')})` : 'Comunicado atualizado'),
      changedFields
    };

    const isFeatured = updated.isFeatured ?? ann.isFeatured;
    const finalImage = updated.imageUrl !== undefined ? updated.imageUrl : (updated.image !== undefined ? updated.image : ann.imageUrl);
    const newAnn = {
      ...ann,
      ...updated,
      isFeatured,
      badge: isFeatured ? 'Destaque Principal' : (updated.badge || ann.badge || 'Oficial'),
      tag: isFeatured ? 'Aviso Principal' : (updated.tag || ann.tag || 'Comunicado'),
      imageUrl: finalImage,
      image: finalImage,
      auditLog: [newLog, ...(ann.auditLog || [])]
    };

    try {
      await api.updateAnnouncement(id, newAnn);
      setAnnouncements((prev) => prev.map((a) => (a.id === id ? newAnn : a)));
      showToast('Comunicado atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar comunicado no backend:', err);
      showToast(`Erro ao atualizar comunicado: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const toggleAnnouncementActive = async (id: string, reason?: string): Promise<void> => {
    const ann = announcements.find((a) => a.id === id);
    if (!ann) return;

    const nextActive = ann.isActive === false ? true : false;
    const newLog: AuditLogEntry = {
      id: 'log_' + Date.now(),
      action: nextActive ? 'reactivated' : 'deactivated',
      timestamp: new Date().toISOString(),
      authorName: currentUser?.name || 'Administrador',
      authorRole: currentUser?.role || 'Gestor',
      details: nextActive 
        ? (reason || 'Comunicado reativado para exibição pública') 
        : (reason || 'Comunicado desativado. Ocultado da visualização pública.')
    };

    const newAnn = {
      ...ann,
      isActive: nextActive,
      auditLog: [newLog, ...(ann.auditLog || [])]
    };

    try {
      await api.toggleAnnouncementActive(id, {
        actorName: currentUser?.name,
        actorRole: currentUser?.role,
        reason
      });

      setAnnouncements((prev) => prev.map((a) => (a.id === id ? newAnn : a)));
      showToast(
        nextActive ? 'Comunicado reativado no mural! ✨' : 'Comunicado desativado com segurança (não apagado). 🔒',
        nextActive ? 'success' : 'info'
      );
    } catch (err: any) {
      console.error('Erro ao alterar status do comunicado no backend:', err);
      showToast(`Erro ao alterar status: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const deleteAnnouncement = async (id: string): Promise<void> => {
    // REGRA ESTRITA DO USUÁRIO: "NÃO PODE APAGAR". DESATIVAÇÃO SEGURA!
    await toggleAnnouncementActive(id, 'Desativado pelo gestor');
  };

  // Filtered Announcements (com suporte à busca por palavras separadas e sem acentos)
  const filteredAnnouncements = useMemo(() => {
    const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
    const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

    return announcements.filter((item) => {
      // Inativos: apenas editores veem se quiserem
      if (!isEditor && item.isActive === false) return false;

      // Exclusivos para membros: precisa de login
      if (!isLogged && item.visibility === 'members_only') return false;

      // Busca na barra superior por palavras separadas sem distinção de acentos
      if (searchQuery.trim()) {
        const commentsText = (item.comments || []).map((c) => `${c.author || ''} ${c.text || c.content || ''}`).join(' ');
        const searchableText = `${item.title} ${item.content} ${item.summary || ''} ${item.category || ''} ${item.author || ''} ${item.authorDepartment || ''} ${commentsText}`;
        if (!matchesSeparatedWords(searchableText, searchQuery)) return false;
      }

      return true;
    });
  }, [announcements, searchQuery, authStatus, currentUser]);

  // Filtered Forum Posts (Totalmente separados dos comunicados e avisos oficiais)
  const filteredPosts = useMemo(() => {
    const isLogged = authStatus !== 'unauthenticated' && !!currentUser;
    const isEditor = authStatus === 'editor' && !!currentUser?.isEditor;

    return forumPosts.filter((post) => {
      // Separação dos comunicados e avisos oficiais: não aparecem na Comunidade/Fórum
      if (post.targetCard === 'comunicados' || post.targetCard === 'avisos_principais') return false;
      if (post.category === 'Card: Comunicados' || post.category === 'Card: Avisos Principais') return false;

      // Status ativo/desativado
      if (!isEditor) {
        // Colaboradores comuns NUNCA veem posts desativados
        if (post.isActive === false) return false;
      } else {
        // Editores podem filtrar
        if (postStatusFilter === 'active' && post.isActive === false) return false;
        if (postStatusFilter === 'inactive' && post.isActive !== false) return false;
      }

      // REQUISITO: As postagens que precisam de login NÃO devem aparecer para quem não está logado!
      if (!isLogged && post.visibility === 'members_only') {
        return false;
      }

      // Visibility Filter
      if (visibilityFilter === 'public' && post.visibility !== 'public') return false;
      if (visibilityFilter === 'members_only' && post.visibility !== 'members_only') return false;

      // Category Filter (normalizado sem distinção de acentos)
      if (selectedCategory !== 'Todas') {
        if (normalizeText(post.category) !== normalizeText(selectedCategory)) return false;
      }

      // Search Query: Pesquisa por palavras separadas com normalização completa de acentos e diacríticos
      if (searchQuery.trim()) {
        const commentsText = (post.comments || []).map((c) => `${c.author || ''} ${c.text || c.content || ''}`).join(' ');
        const searchableText = `${post.title} ${post.content} ${post.category || ''} ${post.tag || ''} ${post.author?.name || ''} ${post.author?.role || ''} ${post.author?.unit || ''} ${commentsText}`;
        if (!matchesSeparatedWords(searchableText, searchQuery)) return false;
      }

      return true;
    });
  }, [forumPosts, visibilityFilter, selectedCategory, searchQuery, authStatus, currentUser, postStatusFilter]);

  const addCompanyValue = async (newVal: Omit<CompanyValueSlide, 'id'>): Promise<CompanyValueSlide> => {
    const val: CompanyValueSlide = {
      ...newVal,
      id: 'val_' + Date.now(),
      isActive: newVal.isActive ?? true
    };
    try {
      const created = await api.createCompanyValue(val);
      const finalVal = created || val;
      setCompanyValues((prev) => [...prev, finalVal]);
      showToast('Novo valor corporativo adicionado com sucesso!', 'success');
      return finalVal;
    } catch (err: any) {
      console.error('Erro ao adicionar valor corporativo:', err);
      showToast(`Erro ao adicionar valor: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const updateCompanyValue = async (id: string, updated: Partial<CompanyValueSlide>): Promise<void> => {
    try {
      await api.updateCompanyValue(id, updated);
      setCompanyValues((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updated } : v))
      );
      showToast('Valor corporativo atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar valor corporativo:', err);
      showToast(`Erro ao atualizar valor: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const deleteCompanyValue = async (id: string): Promise<void> => {
    try {
      await api.deleteCompanyValue(id);
      setCompanyValues((prev) => prev.filter((v) => v.id !== id));
      showToast('Valor corporativo removido!', 'info');
    } catch (err: any) {
      console.error('Erro ao remover valor corporativo:', err);
      showToast(`Erro ao remover valor: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const toggleCompanyValueActive = (id: string) => {
    const target = companyValues.find((v) => v.id === id);
    if (target) {
      api.updateCompanyValue(id, { isActive: !target.isActive }).catch(() => {});
    }
    setCompanyValues((prev) =>
      prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    );
  };

  const deleteCalendarEvent = async (id: string): Promise<void> => {
    try {
      await api.deleteCalendarEvent(id);
      setCalendarEvents((prev) => prev.filter((evt) => evt.id !== id));
      showToast('Evento removido do calendário.', 'info');
    } catch (err: any) {
      console.error('Erro ao remover evento do calendário:', err);
      showToast(`Erro ao remover evento: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const addCompanyHighlight = async (newH: Omit<CompanyHighlightItem, 'id' | 'likesCount' | 'userLiked'>): Promise<CompanyHighlightItem> => {
    const item: CompanyHighlightItem = {
      ...newH,
      id: 'highlight_comp_' + Date.now(),
      likesCount: 0,
      userLiked: false
    };
    try {
      const created = await api.createCompanyHighlight(item);
      const finalItem = created || item;
      setCompanyHighlights((prev) => [finalItem, ...prev]);
      showToast('Nova Empresa Destaque adicionada ao Card 2! 🏆', 'success');
      return finalItem;
    } catch (err: any) {
      console.error('Erro ao adicionar destaque da empresa:', err);
      showToast(`Erro ao adicionar destaque: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const updateCompanyHighlight = async (id: string, updated: Partial<CompanyHighlightItem>): Promise<void> => {
    try {
      await api.updateCompanyHighlight(id, updated);
      setCompanyHighlights((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      showToast('Destaque da empresa atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar destaque da empresa:', err);
      showToast(`Erro ao atualizar destaque: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const deleteCompanyHighlight = async (id: string): Promise<void> => {
    try {
      await api.deleteCompanyHighlight(id);
      setCompanyHighlights((prev) => prev.filter((item) => item.id !== id));
      showToast('Destaque da empresa removido!', 'info');
    } catch (err: any) {
      console.error('Erro ao remover destaque da empresa:', err);
      showToast(`Erro ao remover destaque: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const toggleCompanyHighlightLike = (id: string) => {
    api.toggleCompanyHighlightLike(id).catch(() => {});
    setCompanyHighlights((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.userLiked;
          return {
            ...item,
            userLiked: nextLiked,
            likesCount: item.likesCount + (nextLiked ? 1 : -1)
          };
        }
        return item;
      })
    );
  };

  const addEmployeeHighlight = async (newEmp: Omit<EmployeeHighlightItem, 'id' | 'likesCount' | 'userLiked'>): Promise<EmployeeHighlightItem> => {
    const item: EmployeeHighlightItem = {
      ...newEmp,
      id: 'highlight_emp_' + Date.now(),
      likesCount: 0,
      userLiked: false
    };
    try {
      const created = await api.createEmployeeHighlight(item);
      const finalItem = created || item;
      setEmployeeHighlights((prev) => [finalItem, ...prev]);
      showToast('Novo Funcionário Destaque adicionado ao Card 3! ⭐', 'success');
      return finalItem;
    } catch (err: any) {
      console.error('Erro ao adicionar funcionário destaque:', err);
      showToast(`Erro ao adicionar destaque: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const updateEmployeeHighlight = async (id: string, updated: Partial<EmployeeHighlightItem>): Promise<void> => {
    try {
      await api.updateEmployeeHighlight(id, updated);
      setEmployeeHighlights((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
      showToast('Funcionário Destaque atualizado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar funcionário destaque:', err);
      showToast(`Erro ao atualizar destaque: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const deleteEmployeeHighlight = async (id: string): Promise<void> => {
    try {
      await api.deleteEmployeeHighlight(id);
      setEmployeeHighlights((prev) => prev.filter((item) => item.id !== id));
      showToast('Funcionário destaque removido!', 'info');
    } catch (err: any) {
      console.error('Erro ao remover funcionário destaque:', err);
      showToast(`Erro ao remover destaque: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const toggleEmployeeHighlightLike = (id: string) => {
    api.toggleEmployeeHighlightLike(id).catch(() => {});
    setEmployeeHighlights((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextLiked = !item.userLiked;
          return {
            ...item,
            userLiked: nextLiked,
            likesCount: item.likesCount + (nextLiked ? 1 : -1)
          };
        }
        return item;
      })
    );
  };

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
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeAgo: 'Agora mesmo',
      read: false
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateCompanyGoal = async (updated: Partial<CompanyGoalData>): Promise<void> => {
    try {
      await api.updateCompanyGoals(updated);
      setCompanyGoal((prev) => (prev ? { ...prev, ...updated } : (updated as CompanyGoalData)));
      showToast('Metas da empresa atualizadas no servidor com sucesso! 🎯', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar metas da empresa:', err);
      showToast(`Erro ao atualizar metas: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const addMotivationalThought = async (thought: Partial<MotivationalThought>): Promise<MotivationalThought> => {
    try {
      const created = await api.createMotivationalThought(thought);
      setMotivationalThoughts((prev) => [created, ...prev]);
      setDynamicCards((prev) => ({
        ...prev,
        card_1: {
          id: 'card_1',
          title: created.title,
          content: created.content,
          imageUrl: created.imageUrl,
          authorName: created.authorName,
          authorRole: created.authorRole,
          updatedAt: 'Agora mesmo',
          likesCount: created.likesCount,
          userLiked: created.userLiked
        }
      }));
      showToast('Novo Pensamento do Dia salvo com sucesso no banco de dados! 💡', 'success');
      return created;
    } catch (err: any) {
      console.error('Erro ao salvar pensamento do dia:', err);
      showToast(`Erro ao salvar pensamento: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const updateMotivationalThought = async (id: string, thought: Partial<MotivationalThought>): Promise<void> => {
    try {
      await api.updateMotivationalThought(id, thought);
      setMotivationalThoughts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...thought } : t))
      );
      setDynamicCards((prev) => {
        const cur = prev['card_1'] || {};
        return {
          ...prev,
          card_1: {
            ...cur,
            title: thought.title !== undefined ? thought.title : cur.title,
            content: thought.content !== undefined ? thought.content : cur.content,
            imageUrl: thought.imageUrl !== undefined ? thought.imageUrl : cur.imageUrl,
            authorName: thought.authorName !== undefined ? thought.authorName : cur.authorName,
            authorRole: thought.authorRole !== undefined ? thought.authorRole : cur.authorRole,
            updatedAt: 'Agora mesmo'
          }
        };
      });
      showToast('Pensamento do Dia atualizado com sucesso no banco de dados!', 'success');
    } catch (err: any) {
      console.error('Erro ao atualizar pensamento do dia:', err);
      showToast(`Erro ao atualizar pensamento: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const deleteMotivationalThought = async (id: string): Promise<void> => {
    try {
      await api.deleteMotivationalThought(id);
      setMotivationalThoughts((prev) => prev.filter((t) => t.id !== id));
      showToast('Pensamento do Dia removido com sucesso.', 'info');
    } catch (err: any) {
      console.error('Erro ao remover pensamento do dia:', err);
      showToast(`Erro ao remover pensamento: ${err?.message || 'Falha no servidor'}`, 'error');
      throw err;
    }
  };

  const toggleMotivationalThoughtLike = (id: string) => {
    api.toggleMotivationalThoughtLike(id).catch(() => {});
    setMotivationalThoughts((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextLiked = !t.userLiked;
          const nextCount = (t.likesCount || 0) + (nextLiked ? 1 : -1);
          return { ...t, userLiked: nextLiked, likesCount: nextCount };
        }
        return t;
      })
    );
    setDynamicCards((prev) => {
      const cur = prev['card_1'];
      if (!cur) return prev;
      const nextLiked = !cur.userLiked;
      const nextCount = (cur.likesCount || 0) + (nextLiked ? 1 : -1);
      return {
        ...prev,
        card_1: {
          ...cur,
          userLiked: nextLiked,
          likesCount: nextCount
        }
      };
    });
  };

  const updateTopUnit = (id: string, updated: Partial<TopUnitItem>) => {
    api.updateTopUnit(id, updated).catch(() => {});
    setTopUnits((prev) => ({
      delivery: prev.delivery.map((u) => (u.id === id ? { ...u, ...updated } : u)),
      selfService: prev.selfService.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    }));
  };

  const retryLoadCompanyGoal = async (): Promise<void> => {
    setIsLoadingGoal(true);
    setErrorGoal(null);
    try {
      const g = await api.getCompanyGoals();
      if (g) {
        setCompanyGoal(g);
        setErrorGoal(null);
        showToast('Metas sincronizadas com sucesso! 🎯', 'success');
      } else {
        setErrorGoal('Metas não configuradas no servidor.');
      }
    } catch (err: any) {
      console.error('Falha ao reconectar com servidor de metas:', err);
      setErrorGoal(err?.message || 'Falha na comunicação com o servidor.');
      showToast('Não foi possível carregar as metas.', 'error');
    } finally {
      setIsLoadingGoal(false);
    }
  };

  const retryLoadMotivationalThoughts = async (): Promise<void> => {
    setIsLoadingThoughts(true);
    setErrorThoughts(null);
    try {
      const thoughts = await api.getMotivationalThoughts();
      if (Array.isArray(thoughts) && thoughts.length > 0) {
        setMotivationalThoughts(thoughts);
        setErrorThoughts(null);
        showToast('Pensamento do Dia atualizado com sucesso! 💡', 'success');
      } else {
        setErrorThoughts('Nenhum pensamento encontrado no momento.');
      }
    } catch (err: any) {
      console.error('Falha ao reconectar com pensamentos:', err);
      setErrorThoughts(err?.message || 'Falha na comunicação.');
      showToast('Não foi possível carregar os pensamentos.', 'error');
    } finally {
      setIsLoadingThoughts(false);
    }
  };

  const retrySyncAll = async (): Promise<void> => {
    await syncWithDatabase();
  };

  const contextValue = useMemo(
    () => ({
      announcements,
      featuredAnnouncements,
      filteredAnnouncements,
      forumPosts,
      filteredPosts,
      isLoadingPosts,
      isLoadingAnnouncements,
      isLoadingGoal,
      isLoadingThoughts,
      isLoadingCalendar,
      isLoadingTopUnits,
      isLoadingValues,
      isLoadingHighlights,
      errorAnnouncements,
      errorPosts,
      errorGoal,
      errorThoughts,
      errorCalendar,
      errorTopUnits,
      errorValues,
      errorHighlights,
      retryLoadCompanyGoal,
      retryLoadMotivationalThoughts,
      retrySyncAll,
      selectedCategory,
      setSelectedCategory,
      visibilityFilter,
      setVisibilityFilter,
      postStatusFilter,
      setPostStatusFilter,
      unitsRanking,
      calendarEvents,
      dynamicCards,
      searchQuery,
      setSearchQuery,
      companyValues,
      activeCompanyValues,
      companyHighlights,
      employeeHighlights,
      companyGoal,
      motivationalThoughts,
      topUnits,
      notifications,
      unreadNotificationsCount,
      toggleLike,
      togglePostLike,
      toggleDynamicCardLike,
      updateDynamicCard,
      updateCompanyGoal,
      addMotivationalThought,
      updateMotivationalThought,
      deleteMotivationalThought,
      toggleMotivationalThoughtLike,
      updateTopUnit,
      addCalendarEvent,
      deleteCalendarEvent,
      addComment,
      addForumPost,
      updateForumPost,
      toggleForumPostActive,
      addAnnouncement,
      updateAnnouncement,
      deleteAnnouncement,
      toggleAnnouncementActive,
      toggleAnnouncementFeatured,
      toggleAnnouncementVisibility,
      addCompanyValue,
      updateCompanyValue,
      deleteCompanyValue,
      toggleCompanyValueActive,
      addCompanyHighlight,
      updateCompanyHighlight,
      deleteCompanyHighlight,
      toggleCompanyHighlightLike,
      addEmployeeHighlight,
      updateEmployeeHighlight,
      deleteEmployeeHighlight,
      toggleEmployeeHighlightLike,
      markNotificationAsRead,
      markNotificationAsUnread,
      markAllNotificationsAsRead,
      clearReadNotifications,
      deleteNotification,
      addNotification,
    }),
    [
      announcements,
      featuredAnnouncements,
      forumPosts,
      filteredPosts,
      isLoadingPosts,
      isLoadingAnnouncements,
      isLoadingGoal,
      isLoadingThoughts,
      isLoadingCalendar,
      isLoadingTopUnits,
      isLoadingValues,
      isLoadingHighlights,
      errorAnnouncements,
      errorPosts,
      errorGoal,
      errorThoughts,
      errorCalendar,
      errorTopUnits,
      errorValues,
      errorHighlights,
      selectedCategory,
      visibilityFilter,
      postStatusFilter,
      unitsRanking,
      calendarEvents,
      dynamicCards,
      searchQuery,
      companyValues,
      activeCompanyValues,
      companyHighlights,
      employeeHighlights,
      companyGoal,
      motivationalThoughts,
      topUnits,
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
