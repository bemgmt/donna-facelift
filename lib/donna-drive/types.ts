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

export type DemoRoleSlug =
  | 'commercial_broker'
  | 'commercial_lender'
  | 'title_company'
  | 'escrow_officer'
  | 'insurance_broker'
  | 'appraiser'
  | 'environmental_consultant'
  | 'surveyor'
  | 'real_estate_attorney'
  | 'property_manager'

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
