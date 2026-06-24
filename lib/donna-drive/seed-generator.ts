import {
  DemoContact,
  DemoEmail,
  DemoTask,
  DemoDocument,
  DemoCalendarEvent,
  DemoNotification,
  DemoDINBidRequest,
  DemoDINBidResponse,
  DemoRoleSlug,
} from './types'
import { SCENARIOS } from './scenarios'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function daysAgo(days: number): string {
  return daysFromNow(-days)
}

export type ScenarioKey = 'vernon' | 'monterey' | 'downtown' | 'riverside' | 'commerce'

const SCENARIO_KEY_TO_ID: Record<ScenarioKey, string> = {
  'vernon': 'vernon-commerce-center-acquisition',
  'monterey': 'monterey-medical-plaza-refinance',
  'downtown': 'downtown-retail-center-sale',
  'riverside': 'riverside-multifamily-acquisition',
  'commerce': 'commerce-distribution-center-development'
}

export function generateDemoSeedData(scenarioKey: ScenarioKey, orgId: string) {
  const scenarioId = SCENARIO_KEY_TO_ID[scenarioKey] || 'vernon-commerce-center-acquisition'
  const scenarioPack = SCENARIOS.find(s => s.id === scenarioId)

  let contacts: DemoContact[] = []
  let emails: DemoEmail[] = []
  let tasks: DemoTask[] = []
  let documents: DemoDocument[] = []
  let calendar_events: DemoCalendarEvent[] = []
  let notifications: DemoNotification[] = []
  let din_bid_requests: DemoDINBidRequest[] = []
  let din_bid_responses: DemoDINBidResponse[] = []

  if (scenarioPack) {
    contacts = scenarioPack.roles.map((r, i) => {
      const company = r.companyId ? scenarioPack.companies.find(c => c.id === r.companyId)?.name || 'Independent' : 'Independent'
      return {
        id: `${orgId}-c-${i}`,
        org_id: orgId,
        name: `${r.title} Contact`,
        title: r.title,
        email: `${r.id.replace(/-/g, '.')}@example.com`,
        phone: '(555) 000-0000',
        company: company,
        role_slug: r.id,
        notes: r.primaryObjective,
        created_at: daysAgo(30)
      }
    })

    emails = scenarioPack.inbox.map((inboxItem, i) => {
      const fromRole = scenarioPack.roles.find(r => r.id !== inboxItem.toRoleId)?.id || inboxItem.toRoleId
      return {
        id: `${orgId}-e-${i}`,
        org_id: orgId,
        from_role: fromRole,
        to_role: inboxItem.toRoleId,
        subject: inboxItem.subject,
        body: inboxItem.summary,
        read: false,
        starred: inboxItem.priority === 'high' || inboxItem.priority === 'critical',
        created_at: daysAgo(2)
      }
    })

    tasks = scenarioPack.tasks.map((t, i) => {
      let status: 'pending' | 'in_progress' | 'completed' | 'blocked' = 'pending'
      if (t.status === 'in_progress') status = 'in_progress'
      if (t.status === 'done') status = 'completed'
      
      return {
        id: `${orgId}-t-${i}`,
        org_id: orgId,
        assigned_to: t.ownerRoleId,
        title: t.title,
        description: t.title,
        status: status,
        priority: 'medium',
        due_date: daysFromNow(2),
        dependency_task_ids: [],
        created_at: daysAgo(5)
      }
    })

    documents = scenarioPack.library.map((doc, i) => {
      return {
        id: `${orgId}-d-${i}`,
        org_id: orgId,
        name: doc.fileName,
        type: doc.fileName.split('.').pop() || 'pdf',
        size_kb: 1024,
        uploaded_by: scenarioPack.roles[0]?.id || 'system',
        status: 'approved',
        created_at: daysAgo(10)
      }
    })

    din_bid_requests = scenarioPack.dinTriggers.map((din, i) => {
      return {
        id: `${orgId}-br-${i}`,
        org_id: orgId,
        requested_by: din.requestingRole || scenarioPack.roles[0]?.id || 'system',
        service_type: din.targetRole || 'general',
        title: din.trigger,
        description: din.template,
        status: 'open',
        due_date: daysFromNow(5),
        created_at: daysAgo(1)
      }
    })
  }

  // Common notifications and dynamic incident workflows
  if (scenarioPack && scenarioPack.roles.length > 0) {
    notifications = scenarioPack.roles.map((r, i) => ({
      id: `${orgId}-n-${i}`,
      org_id: orgId,
      target_role: r.id,
      title: `Welcome to ${scenarioPack.name}`,
      body: 'Review your tasks and DIN marketplace requests.',
      type: 'info',
      read: false,
      created_at: daysAgo(0)
    }))
  }

  return {
    org_id: orgId,
    contacts,
    emails,
    tasks,
    documents,
    calendar_events,
    notifications,
    din_bid_requests,
    din_bid_responses,
  }
}
