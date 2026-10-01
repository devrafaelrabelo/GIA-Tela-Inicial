export type AuthStatus = 'unauthenticated' | 'reader' | 'editor';

export type Visibility = 'public' | 'members_only';

export interface User {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: string;
  unit: string;
  canEdit: boolean;
  isEditor: boolean;
  badge: string;
  avatar: string;
}

export interface Comment {
  id: string;
  author: string;
  authorRole?: string;
  role?: string;
  authorAvatar?: string;
  avatar?: string;
  date?: string;
  timeAgo?: string;
  text?: string;
  content?: string;
}

export interface DynamicCardContent {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  updatedAt?: string;
  likesCount?: number;
  userLiked?: boolean;
}

export interface PortalCardInfo {
  id: string;
  name: string;
  badge: string;
  icon: string;
  description: string;
  category: string;
  isFixed: boolean;
}

export interface CompanyValueSlide {
  id: string;
  number: string;
  title: string;
  description: string;
  quote?: string;
  image?: string;
  isActive?: boolean;
  mode?: 'banner' | 'custom'; // 'banner': arte/fundo pronto já com as informações; 'custom': preencher com campos
}

export const PORTAL_CARDS: PortalCardInfo[] = [
  // 1. Avisos Principais (antigo Card: Pagamento) - máx 5 em destaque
  {
    id: 'avisos_principais',
    name: 'Avisos Principais (Destaques)',
    badge: 'Card: Avisos Principais',
    icon: 'Megaphone',
    description: 'Avisos principais em destaque no topo do portal (no máximo 5 avisos em destaque).',
    category: 'Destaques',
    isFixed: true
  },
  // 2. Calendário corporativo
  {
    id: 'calendario',
    name: 'Calendário & Eventos',
    badge: 'Card: Calendário',
    icon: 'Calendar',
    description: 'Eventos corporativos, datas importantes, feriados e treinamentos.',
    category: 'Eventos',
    isFixed: true
  },
  // 3. Top Unidades (Automático)
  {
    id: 'unidades',
    name: 'Top Unidades (Ranking Automático)',
    badge: 'Card: Top Unidades',
    icon: 'Trophy',
    description: 'Ranking atualizado automaticamente via integração com backend externo.',
    category: 'Automático',
    isFixed: true
  },
  // 4. Meta Geral (Automático)
  {
    id: 'metas',
    name: 'Meta Geral da Empresa (Automático)',
    badge: 'Card: Meta Geral',
    icon: 'Target',
    description: 'Indicadores e metas da empresa atualizados automaticamente via ERP/BI.',
    category: 'Automático',
    isFixed: true
  },
  // 5. Card 1: Pensamento do dia
  {
    id: 'card_1',
    name: 'Card 1: Pensamento do Dia',
    badge: 'Card 1',
    icon: 'Sparkles',
    description: 'Pensamento do dia e pílulas de inspiração diária para a equipe.',
    category: 'Inspiração',
    isFixed: false
  },
  // 6. Card 2: Empresa destaque
  {
    id: 'card_2',
    name: 'Card 2: Empresa Destaque',
    badge: 'Card 2',
    icon: 'Building2',
    description: 'Reconhecimento da empresa/filial destaque do mês.',
    category: 'Destaque',
    isFixed: false
  },
  // 7. Card 3: Funcionário destaque
  {
    id: 'card_3',
    name: 'Card 3: Funcionário Destaque',
    badge: 'Card 3',
    icon: 'Star',
    description: 'Homenagem e reconhecimento ao colaborador destaque do período.',
    category: 'Reconhecimento',
    isFixed: false
  },
  // 8. Card: Comunicados
  {
    id: 'comunicados',
    name: 'Card: Comunicados Gerais',
    badge: 'Card: Comunicados',
    icon: 'Megaphone',
    description: 'Comunicados gerais da empresa com opção de marcar como aviso em destaque no topo.',
    category: 'Oficial',
    isFixed: true
  },
  // 9. Card 4: Slides de Valores
  {
    id: 'card_4',
    name: 'Card 4: Valores da Empresa',
    badge: 'Card 4',
    icon: 'Layers',
    description: 'Slides interativos com os valores e a cultura da Ambozini.',
    category: 'Cultura',
    isFixed: false
  },
  // 10. Comunidade & Fórum de Trocas
  {
    id: 'forum',
    name: 'Comunidade & Fórum de Trocas',
    badge: 'Card: Fórum',
    icon: 'MessageSquare',
    description: 'Espaço aberto para interação, trocas de ideias e postagens dos colaboradores.',
    category: 'Comunidade',
    isFixed: true
  }
];

export type AnnouncementPriority = 'info' | 'important' | 'urgent';

export interface TargetAudience {
  type: 'all' | 'units' | 'departments' | 'roles' | 'specific';
  selection?: string[];
}

export interface AnnouncementAttachment {
  id: string;
  name: string;
  size?: string;
  url: string;
  type?: string;
}

export interface RelatedLink {
  id: string;
  title: string;
  url: string;
}

export interface Announcement {
  id: string;
  targetCard?: string;
  title: string;
  date?: string;
  author: string;
  authorDepartment?: string;
  contactInfo?: string;
  visibility: Visibility;
  summary?: string;
  content: string;
  icon?: string;
  tag?: string;
  tags?: string[];
  badge?: string;
  category?: string;
  image?: string;
  imageUrl?: string;
  isFeatured?: boolean; // Se true, exibe no card Avisos Principais no topo (máximo 5)
  priority?: AnnouncementPriority;
  targetAudience?: TargetAudience;
  attachments?: AnnouncementAttachment[];
  relatedLinks?: RelatedLink[];
  publishMode?: 'now' | 'scheduled';
  startDate?: string;
  expireDate?: string;
  allowReactions?: boolean;
  allowComments?: boolean;
  requireReadConfirmation?: boolean;
  confirmedBy?: string[];
  confirmationsCount?: number;
  likesCount: number;
  userLiked?: boolean;
  comments: Comment[];
  actionButtonText?: string;
  actionButtonUrl?: string;
  actionButtonSubtext?: string;
  actionButtonOpenNewTab?: boolean;
  isDraft?: boolean;
  isActive?: boolean;
  auditLog?: AuditLogEntry[];
}

export type AuditLogAction = 'created' | 'updated' | 'deactivated' | 'reactivated';

export interface AuditLogEntry {
  id: string;
  action: AuditLogAction;
  timestamp: string;
  authorName: string;
  authorRole?: string;
  authorAvatar?: string;
  details: string;
  changedFields?: string[];
}

export interface ForumPost {
  id: string;
  targetCard?: string;
  visibility: Visibility;
  author: {
    name: string;
    role: string;
    unit: string;
    avatar: string;
    isEditor?: boolean;
  };
  title: string;
  category: string;
  tag?: string;
  createdAt?: string;
  timeAgo?: string;
  timestamp?: string;
  created_timestamp?: string;
  content: string;
  image?: string;
  imageUrl?: string;
  likes: number;
  userLiked?: boolean;
  isLiked?: boolean;
  commentsCount?: number;
  comments: Comment[];
  pinned?: boolean;
  isActive?: boolean;
  auditLog?: AuditLogEntry[];
}

export interface UnitRanking {
  id: string;
  position: number;
  name: string;
  percent: number;
  tagline: string;
  image: string;
  medal: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  category: string;
  description: string;
  time?: string;
  location?: string;
}

export interface CompanyHighlightItem {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  authorName: string;
  badge: string;
  metric: string;
  date?: string;
  likesCount: number;
  userLiked?: boolean;
}

export interface EmployeeHighlightItem {
  id: string;
  name: string;
  role: string;
  badge: string;
  content: string;
  imageUrl: string;
  award?: string;
  date?: string;
  likesCount: number;
  userLiked?: boolean;
}

export type NotificationType = 'announcement' | 'forum' | 'calendar' | 'highlight' | 'system';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timeAgo: string;
  timestamp: string;
  read: boolean;
  link?: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface CompanyGoalData {
  id: string;
  month: string;
  targetPercent: number;
  statusText: string;
  metaMonth: string;
  metaMonthSubtext: string;
  growthPercent: string;
  growthSubtext: string;
  unitsOnTarget: string;
  unitsOnTargetSubtext: string;
  engagementPercent: string;
  engagementSubtext: string;
  history?: CompanyGoalData[];
}

export interface TopUnitItem {
  id: string;
  category: 'delivery' | 'self-service';
  position: number;
  name: string;
  percent: string;
  tagline: string;
  icon: string;
  image: string;
  medalBg: string;
  month?: string;
}

export interface MotivationalThought {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: string;
  imageUrl?: string;
  tagline?: string;
  likesCount: number;
  userLiked?: boolean;
  isActive?: boolean;
  position?: number;
  createdAt?: string;
}


