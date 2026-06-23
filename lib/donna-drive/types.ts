/**
 * DONNA Drive — Shared types for the interactive demo system.
 *
 * These mirror the Supabase schema defined in docs/donna-drive-schema.sql
 * and are used across API routes, seed helpers, and UI components.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type OrganizationStatus =
  | 'demo'
  | 'trial'
  | 'active'
  | 'suspended'
  | 'demo_prebuilt'

export type DemoRoleSlug = string;

export type DemoEventType =
  | 'environmental_issue'
  | 'title_easement'
  | 'appraisal_delayed'
  | 'financing_issue'
  | 'missing_escrow_document'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// ---------------------------------------------------------------------------
// Core entities
// ---------------------------------------------------------------------------

export interface DemoOrganization {
  id: string
  name: string
  status: OrganizationStatus
  property_name: string
  property_value: string
  description: string
  created_at: string
  updated_at: string
}

export interface DemoRole {
  id: string
  slug: DemoRoleSlug
  label: string
  description: string
  icon: string           // lucide icon name
  color: string          // tailwind color token e.g. "blue"
  org_id: string
}

export interface OrgMember {
  id: string
  org_id: string
  user_id: string | null // null = unassigned seat
  role_id: string
  display_name: string
  company: string
  is_facilitator: boolean
  assigned_at: string
}

// ---------------------------------------------------------------------------
// Demo data entities
// ---------------------------------------------------------------------------

export interface DemoContact {
  id: string
  org_id: string
  name: string
  title?: string
  email: string
  phone: string
  company: string
  role_slug: DemoRoleSlug
  notes: string
  created_at: string
}

export interface DemoEmail {
  id: string
  org_id: string
  from_role: DemoRoleSlug
  to_role: DemoRoleSlug
  subject: string
  body: string
  read: boolean
  starred: boolean
  thread_id?: string
  in_reply_to?: string
  created_at: string
}

export interface DemoTask {
  id: string
  org_id: string
  assigned_to: DemoRoleSlug
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string
  dependency_task_ids?: string[]
  created_at: string
}

export interface DemoDocumentVersion {
  version: string
  uploaded_by: DemoRoleSlug
  uploaded_at: string
}

export interface DemoDocument {
  id: string
  org_id: string
  name: string
  type: string       // 'pdf' | 'docx' | 'xlsx' | etc.
  size_kb: number
  uploaded_by: DemoRoleSlug
  status: 'draft' | 'pending_review' | 'approved' | 'signed'
  version?: string
  version_history?: DemoDocumentVersion[]
  created_at: string
}

export interface DemoCalendarEvent {
  id: string
  org_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  attendees: DemoRoleSlug[]
  location: string
  created_at: string
}

export interface DemoNotification {
  id: string
  org_id: string
  target_role: DemoRoleSlug
  title: string
  body: string
  type: 'info' | 'warning' | 'urgent' | 'action_required'
  read: boolean
  created_at: string
}

export interface DemoDINBidRequest {
  id: string
  org_id: string
  requested_by: DemoRoleSlug
  service_type: string // e.g., 'appraisal', 'survey', 'environmental'
  title: string
  description: string
  status: 'open' | 'closed' | 'awarded'
  due_date: string
  created_at: string
}

export interface DemoDINBidResponse {
  id: string
  org_id: string
  request_id: string
  vendor_role: DemoRoleSlug
  amount: number
  proposal_notes: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

// ---------------------------------------------------------------------------
// API request / response shapes
// ---------------------------------------------------------------------------

export interface SeedDemoRequest {
  facilitator_secret: string
  scenario?: string // e.g., 'vernon', 'monterey', etc.
}

export interface SeedDemoResponse {
  success: boolean
  org_id: string
  roles: DemoRole[]
  message: string
}

export interface InjectEventRequest {
  facilitator_secret: string
  event_type: DemoEventType
  org_id: string
}

export interface InjectEventResponse {
  success: boolean
  emails_created: number
  tasks_created: number
  notifications_created: number
}

export interface AssignRoleRequest {
  org_id: string
  role_slug: DemoRoleSlug
  user_name: string
  user_company: string
  user_email: string
  user_phone: string
  user_industry: string
}

export interface AssignRoleResponse {
  success: boolean
  member_id: string
  role: DemoRole
}

export interface ConvertDemoRequest {
  org_id: string
  new_org_name: string
}

export interface ConvertDemoResponse {
  success: boolean
  new_org_id: string
  message: string
}

// ---------------------------------------------------------------------------
// CA-Adapted Scenario / Simulation Bible Types
// ---------------------------------------------------------------------------

export type ScenarioId = 
  | 'vernon-commerce-center-acquisition'
  | 'monterey-medical-plaza-refinance'
  | 'downtown-retail-center-sale'
  | 'riverside-multifamily-acquisition'
  | 'commerce-distribution-center-development';

export type ScenarioStatus = "not_started" | "in_progress" | "waiting" | "done";
export type Priority = "low" | "medium" | "high" | "critical";

export interface CompanyProfile {
  id: string;
  name: string;
  roleInDeal: string;
  description: string;
}

export interface RolePack {
  id: string;
  title: string;
  companyId?: string;
  primaryObjective: string;
  secondaryObjective: string;
  hiddenConcern: string;
  typicalAsks: string[];
  typicalReceives: string[];
  sampleInbox: string;
  secretaryOverlay: string;
}

export interface InboxItem {
  id: string;
  toRoleId: string;
  priority: Priority;
  subject: string;
  summary: string;
}

export interface TaskItem {
  id: string;
  title: string;
  ownerRoleId: string;
  status: ScenarioStatus;
  dependencies: string[];
}

export interface LibraryDoc {
  id: string;
  fileName: string;
  category: string;
  summary: string;
}

export interface EventCard {
  id: string;
  title: string;
  impact: string;
  affectedRoleIds: string[];
}

export interface DinTrigger {
  id: string;
  trigger: string;
  template: string;
  requestingRole?: string;
  targetRole?: string;
  matchType?: "role" | "task" | "lead" | "bid" | "custom";
}

export interface ScenarioPack {
  id: ScenarioId;
  name: string;
  jurisdiction: "unspecified_us" | "california";
  propertyType: string;
  scenarioBrief: string;
  companies: CompanyProfile[];
  roles: RolePack[];
  inbox: InboxItem[];
  tasks: TaskItem[];
  library: LibraryDoc[];
  communications: string[];
  dinTriggers: DinTrigger[];
  eventCards: EventCard[];
  successCriteria: string[];
  timeline: string[];
  endOfDaySummaryFields: string[];
  // AI Flow Overlays
  startingPrompt?: string;
  secretaryInstructions?: string;
  summaryTemplate?: string;
}

export interface InteractionLog {
  id: string;
  timestamp: string;
  source: 'participant' | 'secretary';
  message: string;
  actionTaken?: string;
}

export interface DinInteraction {
  id: string;
  timestamp: string;
  initiatorRoleId: string;
  targetRoleId: string;
  interactionType: string;
  message: string;
}

export interface DonnaDriveSessionLog {
  sessionId: string;
  eventId: string;
  scenarioId: ScenarioId;
  userId: string;
  roleId: string;
  startedAt: string;
  endedAt?: string;
  interactions: InteractionLog[];
  completedTasks: TaskItem[];
  assignedTasks: TaskItem[];
  dinMatches: DinInteraction[];
}
