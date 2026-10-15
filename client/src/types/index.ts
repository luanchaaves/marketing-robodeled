export type UserRole = 'ADMIN' | 'MARKETING' | 'READONLY';
export type UserStatus = 'ACTIVE' | 'INVITED' | 'BLOCKED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string | null;
  createdAt: string;
}

export type LeadStatus =
  | 'NEW_LEAD'
  | 'ATTENDING'
  | 'QUALIFIED'
  | 'PROPOSAL_SENT'
  | 'NEGOTIATION'
  | 'WON'
  | 'LOST';

export type LeadTemperature = 'HOT' | 'WARM' | 'COLD';

export type SourceChannel =
  | 'META_ADS'
  | 'META_LEAD_ADS'
  | 'INSTAGRAM_ORGANIC'
  | 'WHATSAPP_DIRECT'
  | 'SITE_FORM'
  | 'GOOGLE_ADS'
  | 'REFERRAL'
  | 'MANUAL';

export type EventType =
  | 'WEDDING'
  | 'DEBUTANTE_15'
  | 'BIRTHDAY'
  | 'GRADUATION'
  | 'CORPORATE'
  | 'CLUB_PARTY'
  | 'OTHER';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  sourceChannel: SourceChannel;
  status: LeadStatus;
  temperature: LeadTemperature;
  eventType?: EventType | null;
  eventDate?: string | null;
  eventCity?: string | null;
  eventVenue?: string | null;
  estimatedGuests?: number | null;
  attractionInterest?: string | null;
  estimatedValue: number;
  actualContractValue?: number | null;
  campaignId?: string | null;
  campaignName?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  utmContent?: string | null;
  utmTerm?: string | null;
  notes?: string | null;
  lossReason?: string | null;
  lossDetails?: string | null;
  assignedToUserId?: string | null;
  assignedToUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  lastContactAt?: string | null;
  nextFollowUpAt?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: LeadActivity[];
  tasks?: LeadTask[];
  deals?: Deal[];
  attributionTouches?: AttributionTouch[];
}

export interface LeadActivity {
  id: string;
  leadId: string;
  userId?: string | null;
  user?: { name: string } | null;
  type: 'NOTE' | 'CALL' | 'WHATSAPP' | 'STATUS_CHANGE' | 'PROPOSAL' | 'SYSTEM';
  title: string;
  description?: string | null;
  createdAt: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  assignedToUserId?: string | null;
  title: string;
  description?: string | null;
  dueDate: string;
  completed: boolean;
  completedAt?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export interface Deal {
  id: string;
  leadId: string;
  title: string;
  value: number;
  status: 'PROPOSAL' | 'WON' | 'LOST';
  quoteCode?: string | null;
  contractCode?: string | null;
  closedAt?: string | null;
  createdAt: string;
}

export interface AttributionTouch {
  id: string;
  leadId: string;
  touchType: 'FIRST_TOUCH' | 'LEAD_CAPTURE' | 'QUALIFICATION' | 'PROPOSAL' | 'CLOSING';
  channel: string;
  campaignName?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  platform: string;
  objective: string;
  budget: number;
  spend: number;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  kpis: {
    totalSpend: number;
    impressions: number;
    clicks: number;
    leadsCount: number;
    qualifiedLeadsCount: number;
    proposalsCount: number;
    wonCount: number;
    attributedRevenue: number;
    cpl: number;
    cac: number;
    roas: number;
    conversionRate: number;
    estimatedProfit: number;
  };
  timeSeries: Array<{
    date: string;
    spend: number;
    revenue: number;
    leads: number;
  }>;
  funnel: Array<{
    stage: string;
    count: number;
  }>;
  channels: Array<{
    channel: string;
    leadsCount: number;
    wonCount: number;
    revenue: number;
    roas: number;
  }>;
  recentLeads: Lead[];
}

export interface MediaItem {
  id: string;
  title: string;
  category: string;
  type: 'IMAGE' | 'VIDEO' | 'REEL' | 'STORY';
  fileUrl: string;
  tags: string[];
  createdAt: string;
}

export interface ContentPost {
  id: string;
  title: string;
  caption?: string | null;
  type: 'REEL' | 'FEED_POST' | 'CAROUSEL' | 'STORY';
  status: 'DRAFT' | 'PLANNED' | 'APPROVED' | 'PUBLISHED';
  scheduledAt: string;
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  triggerEvent: string;
  actionType: string;
  targetConfig: any;
  active: boolean;
  createdAt: string;
}

export interface IntegrationConfig {
  id: string;
  provider: string;
  enabled: boolean;
  settings: any;
  lastSyncAt?: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  userId?: string | null;
  user?: { name: string; email: string } | null;
  createdAt: string;
}
