/**
 * DONNA Drive — Scenario event payloads.
 *
 * When a facilitator triggers an event (e.g. "environmental_issue"),
 * these functions return the emails, tasks, and notifications to inject.
 */

import type {
  DemoEmail,
  DemoTask,
  DemoNotification,
  DemoEventType,
} from './types'

const ORG_ID = 'dd-org-001'

function now(): string {
  return new Date().toISOString()
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// Each event returns a bundle of data to inject
// ---------------------------------------------------------------------------

export interface EventPayload {
  emails: DemoEmail[]
  tasks: DemoTask[]
  notifications: DemoNotification[]
}

function environmentalIssue(): EventPayload {
  const ts = now()
  return {
    emails: [
      {
        id: `dd-evt-email-env-${Date.now()}`,
        org_id: ORG_ID,
        from_role: 'environmental_consultant',
        to_role: 'commercial_broker',
        subject: '⚠️ Phase I ESA — Recognized Environmental Condition Identified',
        body: 'Marcus,\n\nDuring today\'s site visit at Vernon Commerce Center, we identified a Recognized Environmental Condition (REC) near the southeast loading dock area.\n\nKey findings:\n• Staining observed on concrete pad consistent with petroleum hydrocarbons\n• Historical records indicate a former fueling station on the adjacent parcel (pre-1975)\n• Groundwater flow direction suggests potential migration onto subject property\n\nRecommendation: Phase II ESA (subsurface investigation) with soil borings and groundwater monitoring wells.\n\nEstimated cost: $18,000–$25,000\nTimeline: 2–3 weeks for field work + lab results\n\nThis could impact your due diligence timeline. Please advise on how you\'d like to proceed.\n\nOmar Hassan\nGreenfield Environmental',
        read: false,
        starred: true,
        created_at: ts,
      },
      {
        id: `dd-evt-email-env2-${Date.now()}`,
        org_id: ORG_ID,
        from_role: 'commercial_broker',
        to_role: 'commercial_lender',
        subject: 'Vernon Commerce Center — Environmental Flag, Impact on Financing',
        body: 'Sarah,\n\nHeads up — our Phase I just flagged a REC near the loading dock. Omar is recommending a Phase II investigation.\n\nThis will likely require:\n1. Phase II ESA ($18-25K, 2-3 weeks)\n2. Possible remediation cost estimate\n3. Environmental insurance rider\n\nCan you let me know how this impacts the loan committee timeline? We may need to request a DD extension from the seller.\n\nMarcus',
        read: false,
        starred: false,
        created_at: ts,
      },
    ],
    tasks: [
      {
        id: `dd-evt-task-env-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'environmental_consultant',
        title: 'Prepare Phase II ESA proposal',
        description: 'Draft scope of work and cost estimate for subsurface investigation (soil borings + groundwater wells) at the SE loading dock area.',
        status: 'pending',
        priority: 'urgent',
        due_date: daysFromNow(2),
        created_at: ts,
      },
      {
        id: `dd-evt-task-env2-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'commercial_broker',
        title: 'Request due diligence extension from seller',
        description: 'Draft and send DD extension request (15 additional days) to seller\'s attorney citing environmental findings.',
        status: 'pending',
        priority: 'urgent',
        due_date: daysFromNow(1),
        created_at: ts,
      },
      {
        id: `dd-evt-task-env3-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'insurance_broker',
        title: 'Quote environmental liability insurance',
        description: 'Obtain quotes for Pollution Legal Liability (PLL) coverage given the REC identified in Phase I ESA.',
        status: 'pending',
        priority: 'high',
        due_date: daysFromNow(5),
        created_at: ts,
      },
    ],
    notifications: [
      {
        id: `dd-evt-notif-env-${Date.now()}`,
        org_id: ORG_ID,
        target_role: 'commercial_broker',
        title: '🚨 Environmental Issue — REC Identified',
        body: 'Phase I ESA has identified a Recognized Environmental Condition near the loading dock. Phase II recommended. Review email from Omar Hassan.',
        type: 'urgent',
        read: false,
        created_at: ts,
      },
      {
        id: `dd-evt-notif-env2-${Date.now()}`,
        org_id: ORG_ID,
        target_role: 'commercial_lender',
        title: '⚠️ Environmental Flag — Vernon Commerce Center',
        body: 'REC identified in Phase I. May impact loan underwriting. Broker is requesting DD extension.',
        type: 'warning',
        read: false,
        created_at: ts,
      },
    ],
  }
}

function titleEasement(): EventPayload {
  const ts = now()
  return {
    emails: [
      {
        id: `dd-evt-email-title-${Date.now()}`,
        org_id: ORG_ID,
        from_role: 'title_company',
        to_role: 'real_estate_attorney',
        subject: '⚠️ Unrecorded Utility Easement — Vernon Commerce Center',
        body: 'Victor,\n\nDuring our extended title search, we discovered an unrecorded utility easement across the south parking area of the subject property.\n\nDetails:\n• SoCal Edison maintenance easement (approx. 15\' x 120\' strip)\n• Appears to have been in use since 1992 based on aerial imagery\n• Not reflected in the original CC&Rs or any recorded instrument\n• Affects approximately 12 parking spaces\n\nThis is a Schedule B-II exception that will need to be resolved before we can issue a clean owner\'s policy.\n\nOptions:\n1. Negotiate an easement agreement with SoCal Edison\n2. Obtain a survey exception endorsement\n3. Seller provides indemnification\n\nPlease advise.\n\nDavid Park\nClear Title Group',
        read: false,
        starred: true,
        created_at: ts,
      },
    ],
    tasks: [
      {
        id: `dd-evt-task-title-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'real_estate_attorney',
        title: 'Research unrecorded utility easement',
        description: 'Investigate the SoCal Edison easement across the south parking area. Determine if prescriptive easement rights exist and recommend resolution path.',
        status: 'pending',
        priority: 'urgent',
        due_date: daysFromNow(3),
        created_at: ts,
      },
      {
        id: `dd-evt-task-title2-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'surveyor',
        title: 'Survey easement boundaries',
        description: 'Add the unrecorded utility easement to the ALTA survey. Map the 15\' x 120\' strip and affected parking spaces.',
        status: 'pending',
        priority: 'high',
        due_date: daysFromNow(4),
        created_at: ts,
      },
    ],
    notifications: [
      {
        id: `dd-evt-notif-title-${Date.now()}`,
        org_id: ORG_ID,
        target_role: 'real_estate_attorney',
        title: '⚠️ Title Issue — Unrecorded Easement',
        body: 'Clear Title Group has identified an unrecorded utility easement. Review email from David Park and advise on resolution.',
        type: 'urgent',
        read: false,
        created_at: ts,
      },
    ],
  }
}

function appraisalDelayed(): EventPayload {
  const ts = now()
  return {
    emails: [
      {
        id: `dd-evt-email-appr-${Date.now()}`,
        org_id: ORG_ID,
        from_role: 'appraiser',
        to_role: 'commercial_lender',
        subject: 'Vernon Commerce Center — Appraisal Delay Notice',
        body: 'Sarah,\n\nI need to request an extension on the Vernon Commerce Center appraisal.\n\nReason: Limited comparable sales data for Class A industrial/flex properties in the Vernon/Commerce submarket. I\'ve identified only 2 recent comps within a 5-mile radius and need to expand our search to the broader LA industrial corridor.\n\nAdditional time needed: 5 business days\nRevised delivery date: ' + daysFromNow(13).split('T')[0] + '\n\nI want to ensure the valuation is defensible for your loan committee. I\'m also coordinating with the broker for any off-market transaction data.\n\nApologies for the delay.\n\nLinda Tran, MAI',
        read: false,
        starred: false,
        created_at: ts,
      },
    ],
    tasks: [
      {
        id: `dd-evt-task-appr-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'commercial_lender',
        title: 'Update loan committee on appraisal delay',
        description: 'Inform loan committee of 5-day appraisal extension. Assess impact on commitment letter timeline.',
        status: 'pending',
        priority: 'high',
        due_date: daysFromNow(1),
        created_at: ts,
      },
      {
        id: `dd-evt-task-appr2-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'commercial_broker',
        title: 'Provide off-market comps to appraiser',
        description: 'Compile recent off-market industrial transactions in LA corridor for appraisal comparable analysis.',
        status: 'pending',
        priority: 'medium',
        due_date: daysFromNow(2),
        created_at: ts,
      },
    ],
    notifications: [
      {
        id: `dd-evt-notif-appr-${Date.now()}`,
        org_id: ORG_ID,
        target_role: 'commercial_lender',
        title: '⏰ Appraisal Delayed — 5 Days',
        body: 'Linda Tran has requested a 5-day extension on the Vernon Commerce Center appraisal due to limited comps.',
        type: 'warning',
        read: false,
        created_at: ts,
      },
    ],
  }
}

function financingIssue(): EventPayload {
  const ts = now()
  return {
    emails: [
      {
        id: `dd-evt-email-fin-${Date.now()}`,
        org_id: ORG_ID,
        from_role: 'commercial_lender',
        to_role: 'commercial_broker',
        subject: '🚨 DSCR Below Threshold — Updated Projections Needed',
        body: 'Marcus,\n\nOur underwriting team has completed preliminary cash flow analysis and we have a concern:\n\nCurrent DSCR: 1.18x\nRequired minimum: 1.25x\n\nThe shortfall is driven by:\n1. Below-market rent on Suite 200 (3 years remaining on lease at $0.62/SF NNN vs market $0.85/SF)\n2. Higher-than-projected insurance costs\n3. Capital reserve requirements ($0.25/SF)\n\nTo proceed, we need:\n• Updated rent projections showing path to 1.25x within 12 months\n• Sponsor financial statement (personal guarantee may be required)\n• Consideration of rate buydown or additional equity\n\nLet\'s discuss before I present to loan committee.\n\nSarah Okafor\nWestern Commercial Bank',
        read: false,
        starred: true,
        created_at: ts,
      },
    ],
    tasks: [
      {
        id: `dd-evt-task-fin-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'commercial_broker',
        title: 'Prepare updated DSCR projections',
        description: 'Model rent growth scenario showing DSCR improvement to 1.25x within 12 months. Include Suite 200 mark-to-market at lease expiration.',
        status: 'pending',
        priority: 'urgent',
        due_date: daysFromNow(2),
        created_at: ts,
      },
      {
        id: `dd-evt-task-fin2-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'commercial_lender',
        title: 'Evaluate personal guarantee structure',
        description: 'Prepare personal guarantee terms and present options to borrower (full vs. limited, burn-off provisions).',
        status: 'pending',
        priority: 'high',
        due_date: daysFromNow(3),
        created_at: ts,
      },
    ],
    notifications: [
      {
        id: `dd-evt-notif-fin-${Date.now()}`,
        org_id: ORG_ID,
        target_role: 'commercial_broker',
        title: '🚨 Financing Issue — DSCR Below 1.25x',
        body: 'Western Commercial Bank flags DSCR at 1.18x (below 1.25x min). Updated projections needed urgently.',
        type: 'urgent',
        read: false,
        created_at: ts,
      },
    ],
  }
}

function missingEscrowDocument(): EventPayload {
  const ts = now()
  return {
    emails: [
      {
        id: `dd-evt-email-esc-${Date.now()}`,
        org_id: ORG_ID,
        from_role: 'escrow_officer',
        to_role: 'property_manager',
        subject: '⚠️ Missing Estoppel Certificate — Anchor Tenant',
        body: 'Angela,\n\nI\'m showing that we still haven\'t received the estoppel certificate from the anchor tenant (TechFlow Logistics, Suite 100).\n\nThis is a closing requirement per Section 7.3 of the PSA. Without it, escrow cannot close.\n\nWhat we need:\n• Signed tenant estoppel certificate (standard ALTA form)\n• Confirming: rent amount, lease term, security deposit, any landlord obligations\n• Due: ASAP — this is blocking the closing timeline\n\nCan you follow up with TechFlow\'s lease contact directly? If needed, I can provide a pre-filled form.\n\nRachel Martinez\nSummit Escrow',
        read: false,
        starred: true,
        created_at: ts,
      },
    ],
    tasks: [
      {
        id: `dd-evt-task-esc-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'property_manager',
        title: 'Obtain estoppel certificate from TechFlow Logistics',
        description: 'Contact TechFlow Logistics (Suite 100) lease admin and obtain signed estoppel certificate. This is a closing requirement.',
        status: 'pending',
        priority: 'urgent',
        due_date: daysFromNow(2),
        created_at: ts,
      },
      {
        id: `dd-evt-task-esc2-${Date.now()}`,
        org_id: ORG_ID,
        assigned_to: 'real_estate_attorney',
        title: 'Review estoppel waiver provision in PSA',
        description: 'Determine if PSA allows closing without anchor tenant estoppel, or if an amendment is needed.',
        status: 'pending',
        priority: 'high',
        due_date: daysFromNow(2),
        created_at: ts,
      },
    ],
    notifications: [
      {
        id: `dd-evt-notif-esc-${Date.now()}`,
        org_id: ORG_ID,
        target_role: 'property_manager',
        title: '⚠️ Missing Document — Anchor Tenant Estoppel',
        body: 'TechFlow Logistics (Suite 100) estoppel certificate is outstanding and blocking closing. Follow up immediately.',
        type: 'urgent',
        read: false,
        created_at: ts,
      },
      {
        id: `dd-evt-notif-esc2-${Date.now()}`,
        org_id: ORG_ID,
        target_role: 'escrow_officer',
        title: 'Closing Blocked — Pending Estoppel',
        body: 'Anchor tenant estoppel still missing. Property manager has been notified.',
        type: 'warning',
        read: false,
        created_at: ts,
      },
    ],
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export function getEventPayload(type: DemoEventType): EventPayload {
  switch (type) {
    case 'environmental_issue':
      return environmentalIssue()
    case 'title_easement':
      return titleEasement()
    case 'appraisal_delayed':
      return appraisalDelayed()
    case 'financing_issue':
      return financingIssue()
    case 'missing_escrow_document':
      return missingEscrowDocument()
    default:
      throw new Error(`Unknown event type: ${type}`)
  }
}
