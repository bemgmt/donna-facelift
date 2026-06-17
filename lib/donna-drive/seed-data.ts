/**
 * DONNA Drive — Seed data for the Vernon Commerce Center transaction.
 *
 * All data is static and deterministic so the seed operation is idempotent.
 * UUIDs use a v5-like prefix scheme (`dd-<table>-<index>`) for easy debugging.
 *
 * This file is consumed by the `/api/demo/seed` route and by the
 * client-side fallback when Supabase is not available.
 */

import type {
  DemoContact,
  DemoEmail,
  DemoTask,
  DemoDocument,
  DemoCalendarEvent,
  DemoNotification,
} from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ORG_ID = 'dd-org-001'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function daysAgo(days: number): string {
  return daysFromNow(-days)
}

// ---------------------------------------------------------------------------
// Contacts — one per role, with realistic CRE details
// ---------------------------------------------------------------------------

export const SEED_CONTACTS: DemoContact[] = [
  {
    id: 'dd-contact-001',
    org_id: ORG_ID,
    name: 'Marcus Chen',
    email: 'mchen@pacificcommercial.com',
    phone: '(213) 555-0147',
    company: 'Pacific Commercial Realty',
    role_slug: 'commercial_broker',
    notes: 'Lead broker. 15 years SoCal industrial. Handling buyer representation.',
    created_at: daysAgo(30),
  },
  {
    id: 'dd-contact-002',
    org_id: ORG_ID,
    name: 'Sarah Okafor',
    email: 'sokafor@westernbank.com',
    phone: '(310) 555-0238',
    company: 'Western Commercial Bank',
    role_slug: 'commercial_lender',
    notes: 'Senior VP, Commercial Lending. Processing the acquisition loan.',
    created_at: daysAgo(28),
  },
  {
    id: 'dd-contact-003',
    org_id: ORG_ID,
    name: 'David Park',
    email: 'dpark@cleartitlegroup.com',
    phone: '(626) 555-0319',
    company: 'Clear Title Group',
    role_slug: 'title_company',
    notes: 'Title officer handling prelim report and title insurance.',
    created_at: daysAgo(25),
  },
  {
    id: 'dd-contact-004',
    org_id: ORG_ID,
    name: 'Rachel Martinez',
    email: 'rmartinez@summitescrow.com',
    phone: '(562) 555-0421',
    company: 'Summit Escrow Services',
    role_slug: 'escrow_officer',
    notes: 'Senior escrow officer. Managing earnest money and closing documents.',
    created_at: daysAgo(25),
  },
  {
    id: 'dd-contact-005',
    org_id: ORG_ID,
    name: 'James Whitfield',
    email: 'jwhitfield@shieldinc.com',
    phone: '(818) 555-0567',
    company: 'Shield Insurance Brokerage',
    role_slug: 'insurance_broker',
    notes: 'Quoting property, GL, and umbrella coverage for the acquisition.',
    created_at: daysAgo(22),
  },
  {
    id: 'dd-contact-006',
    org_id: ORG_ID,
    name: 'Linda Tran',
    email: 'ltran@apexappraisals.com',
    phone: '(714) 555-0689',
    company: 'Apex Commercial Appraisals',
    role_slug: 'appraiser',
    notes: 'MAI-certified. Preparing income-approach valuation.',
    created_at: daysAgo(20),
  },
  {
    id: 'dd-contact-007',
    org_id: ORG_ID,
    name: 'Omar Hassan',
    email: 'ohassan@greenfieldenv.com',
    phone: '(949) 555-0712',
    company: 'Greenfield Environmental',
    role_slug: 'environmental_consultant',
    notes: 'Leading Phase I ESA. Specializes in industrial properties.',
    created_at: daysAgo(18),
  },
  {
    id: 'dd-contact-008',
    org_id: ORG_ID,
    name: 'Karen Novak',
    email: 'knovak@precisionsurvey.com',
    phone: '(909) 555-0834',
    company: 'Precision Land Surveying',
    role_slug: 'surveyor',
    notes: 'Preparing ALTA/NSPS survey with Table A items.',
    created_at: daysAgo(17),
  },
  {
    id: 'dd-contact-009',
    org_id: ORG_ID,
    name: 'Victor Reyes',
    email: 'vreyes@reyeslawgroup.com',
    phone: '(213) 555-0956',
    company: 'Reyes Law Group',
    role_slug: 'real_estate_attorney',
    notes: 'Reviewing PSA, title exceptions, and closing documents.',
    created_at: daysAgo(28),
  },
  {
    id: 'dd-contact-010',
    org_id: ORG_ID,
    name: 'Angela Brooks',
    email: 'abrooks@vernonpm.com',
    phone: '(323) 555-1078',
    company: 'Vernon Property Management',
    role_slug: 'property_manager',
    notes: 'Current PM. Coordinating tenant estoppels and lease assignments.',
    created_at: daysAgo(15),
  },
]

// ---------------------------------------------------------------------------
// Emails — realistic CRE transaction communications
// ---------------------------------------------------------------------------

export const SEED_EMAILS: DemoEmail[] = [
  {
    id: 'dd-email-001',
    org_id: ORG_ID,
    from_role: 'commercial_broker',
    to_role: 'commercial_lender',
    subject: 'Vernon Commerce Center — LOI Accepted, Loan Application',
    body: 'Hi Sarah,\n\nGood news — the seller has accepted our LOI for Vernon Commerce Center at $8.5M. I\'m sending over the signed LOI and financials package. Can you get the loan application rolling?\n\nKey terms:\n• Purchase price: $8,500,000\n• Due diligence: 45 days\n• Close of escrow: 60 days from execution\n• Earnest money: $250,000 (hard after DD period)\n\nLet me know what else you need from the buyer.\n\nBest,\nMarcus',
    read: true,
    starred: true,
    created_at: daysAgo(25),
  },
  {
    id: 'dd-email-002',
    org_id: ORG_ID,
    from_role: 'commercial_lender',
    to_role: 'commercial_broker',
    subject: 'RE: Vernon Commerce Center — Loan Term Sheet',
    body: 'Hi Marcus,\n\nThanks for the package. Based on our preliminary review, here\'s where we\'re landing:\n\n• Loan amount: $5,950,000 (70% LTV)\n• Rate: SOFR + 275 bps (fixed for 5 years)\n• Amortization: 25 years\n• DSCR requirement: minimum 1.25x\n• Prepayment: Yield maintenance for 3 years, then 1% step-down\n\nWe\'ll need the appraisal, Phase I, and survey before we can issue a commitment letter. Ordering the appraisal today — Linda Tran at Apex will handle it.\n\nSarah',
    read: true,
    starred: false,
    created_at: daysAgo(23),
  },
  {
    id: 'dd-email-003',
    org_id: ORG_ID,
    from_role: 'title_company',
    to_role: 'real_estate_attorney',
    subject: 'Prelim Title Report — Vernon Commerce Center',
    body: 'Hi Victor,\n\nAttached is the preliminary title report for 2810 Leonis Blvd, Vernon. A few items to flag:\n\n1. Standard utility easement along the north boundary (recorded)\n2. CC&Rs from the original industrial park development (1987)\n3. Existing deed of trust in favor of First National — will need reconveyance at closing\n\nNo liens or judgments against the seller. Title insurance commitment is based on satisfactory survey.\n\nPlease review and let me know if you have questions.\n\nDavid Park\nClear Title Group',
    read: false,
    starred: false,
    created_at: daysAgo(20),
  },
  {
    id: 'dd-email-004',
    org_id: ORG_ID,
    from_role: 'escrow_officer',
    to_role: 'commercial_broker',
    subject: 'Escrow Opened — #2024-VCC-8842',
    body: 'Hi Marcus,\n\nEscrow has been opened for the Vernon Commerce Center acquisition. Details:\n\n• Escrow #: 2024-VCC-8842\n• Buyer: [Your Client Name]\n• Seller: Vernon Industrial Holdings LLC\n• Purchase Price: $8,500,000\n• Earnest Money: $250,000 (received and deposited)\n\nI\'ll be coordinating with David at Clear Title for the title/escrow package. Please have your buyer sign the escrow instructions — I\'ll send those over shortly.\n\nRachel Martinez\nSummit Escrow',
    read: true,
    starred: false,
    created_at: daysAgo(24),
  },
  {
    id: 'dd-email-005',
    org_id: ORG_ID,
    from_role: 'environmental_consultant',
    to_role: 'commercial_broker',
    subject: 'Phase I ESA — Site Visit Scheduled',
    body: 'Hi Marcus,\n\nWe\'ve scheduled the Phase I ESA site visit for Vernon Commerce Center:\n\n• Date: This Thursday at 9:00 AM\n• Duration: Approximately 3-4 hours\n• Access: We\'ll need interior access to all tenant spaces and the loading dock area\n\nOur scope includes:\n- Historical records review (Sanborn maps, aerial photos, regulatory databases)\n- Site reconnaissance and adjacent property review\n- Interviews with current property manager\n- Draft report within 10 business days of site visit\n\nPlease confirm access arrangements with the property manager.\n\nOmar Hassan\nGreenfield Environmental',
    read: true,
    starred: false,
    created_at: daysAgo(18),
  },
  {
    id: 'dd-email-006',
    org_id: ORG_ID,
    from_role: 'appraiser',
    to_role: 'commercial_lender',
    subject: 'Appraisal Engagement — Vernon Commerce Center',
    body: 'Hi Sarah,\n\nConfirming receipt of the appraisal engagement for 2810 Leonis Blvd, Vernon.\n\nScope:\n• Full narrative appraisal (FIRREA/USPAP compliant)\n• Income approach, sales comparison, and cost approach\n• As-is and as-stabilized values\n• Estimated completion: 15 business days\n\nI\'ll need current rent roll, operating statements (3 years), and lease abstracts. Can you have the broker send those over?\n\nFee: $7,500 (per engagement letter)\n\nLinda Tran, MAI\nApex Commercial Appraisals',
    read: false,
    starred: true,
    created_at: daysAgo(19),
  },
]

// ---------------------------------------------------------------------------
// Tasks — across the transaction timeline
// ---------------------------------------------------------------------------

export const SEED_TASKS: DemoTask[] = [
  {
    id: 'dd-task-001',
    org_id: ORG_ID,
    assigned_to: 'commercial_broker',
    title: 'Send financials package to lender',
    description: 'Compile and send the 3-year operating statements, rent roll, and tenant financials to Western Commercial Bank.',
    status: 'completed',
    priority: 'high',
    due_date: daysAgo(23),
    created_at: daysAgo(26),
  },
  {
    id: 'dd-task-002',
    org_id: ORG_ID,
    assigned_to: 'commercial_lender',
    title: 'Order property appraisal',
    description: 'Engage Apex Commercial Appraisals for FIRREA-compliant appraisal of Vernon Commerce Center.',
    status: 'completed',
    priority: 'high',
    due_date: daysAgo(20),
    created_at: daysAgo(23),
  },
  {
    id: 'dd-task-003',
    org_id: ORG_ID,
    assigned_to: 'title_company',
    title: 'Deliver preliminary title report',
    description: 'Complete title search and deliver prelim to buyer\'s attorney for review.',
    status: 'completed',
    priority: 'high',
    due_date: daysAgo(18),
    created_at: daysAgo(24),
  },
  {
    id: 'dd-task-004',
    org_id: ORG_ID,
    assigned_to: 'environmental_consultant',
    title: 'Conduct Phase I ESA site visit',
    description: 'Perform on-site environmental assessment including interviews, sampling review, and adjacent property inspection.',
    status: 'in_progress',
    priority: 'high',
    due_date: daysFromNow(2),
    created_at: daysAgo(18),
  },
  {
    id: 'dd-task-005',
    org_id: ORG_ID,
    assigned_to: 'surveyor',
    title: 'Complete ALTA/NSPS survey',
    description: 'Prepare boundary and ALTA survey with Table A items 1, 2, 3, 4, 6(a), 6(b), 8, 9, 11, 13, 17, 18, 19.',
    status: 'in_progress',
    priority: 'medium',
    due_date: daysFromNow(5),
    created_at: daysAgo(16),
  },
  {
    id: 'dd-task-006',
    org_id: ORG_ID,
    assigned_to: 'real_estate_attorney',
    title: 'Review title exceptions',
    description: 'Analyze preliminary title report exceptions and draft objection letter if needed.',
    status: 'pending',
    priority: 'high',
    due_date: daysFromNow(3),
    created_at: daysAgo(20),
  },
  {
    id: 'dd-task-007',
    org_id: ORG_ID,
    assigned_to: 'insurance_broker',
    title: 'Deliver property insurance quotes',
    description: 'Obtain quotes for property all-risk, GL, umbrella, and environmental liability coverage.',
    status: 'pending',
    priority: 'medium',
    due_date: daysFromNow(7),
    created_at: daysAgo(15),
  },
  {
    id: 'dd-task-008',
    org_id: ORG_ID,
    assigned_to: 'property_manager',
    title: 'Collect tenant estoppel certificates',
    description: 'Request and collect signed estoppel certificates from all 4 tenants. Deadline: 10 business days.',
    status: 'in_progress',
    priority: 'urgent',
    due_date: daysFromNow(4),
    created_at: daysAgo(12),
  },
  {
    id: 'dd-task-009',
    org_id: ORG_ID,
    assigned_to: 'escrow_officer',
    title: 'Prepare closing statement draft',
    description: 'Draft HUD-1 / closing disclosure with prorations, credits, and payoff figures.',
    status: 'pending',
    priority: 'low',
    due_date: daysFromNow(20),
    created_at: daysAgo(24),
  },
  {
    id: 'dd-task-010',
    org_id: ORG_ID,
    assigned_to: 'appraiser',
    title: 'Submit draft appraisal report',
    description: 'Complete appraisal using income, comparable sales, and cost approaches. Submit draft to lender for review.',
    status: 'in_progress',
    priority: 'high',
    due_date: daysFromNow(8),
    created_at: daysAgo(19),
  },
]

// ---------------------------------------------------------------------------
// Documents — typical CRE transaction docs
// ---------------------------------------------------------------------------

export const SEED_DOCUMENTS: DemoDocument[] = [
  {
    id: 'dd-doc-001',
    org_id: ORG_ID,
    name: 'Letter of Intent — Vernon Commerce Center.pdf',
    type: 'pdf',
    size_kb: 245,
    uploaded_by: 'commercial_broker',
    status: 'signed',
    created_at: daysAgo(28),
  },
  {
    id: 'dd-doc-002',
    org_id: ORG_ID,
    name: 'Purchase and Sale Agreement.pdf',
    type: 'pdf',
    size_kb: 1820,
    uploaded_by: 'real_estate_attorney',
    status: 'pending_review',
    created_at: daysAgo(24),
  },
  {
    id: 'dd-doc-003',
    org_id: ORG_ID,
    name: 'Preliminary Title Report.pdf',
    type: 'pdf',
    size_kb: 4200,
    uploaded_by: 'title_company',
    status: 'approved',
    created_at: daysAgo(20),
  },
  {
    id: 'dd-doc-004',
    org_id: ORG_ID,
    name: 'Operating Statements 2022-2024.xlsx',
    type: 'xlsx',
    size_kb: 385,
    uploaded_by: 'commercial_broker',
    status: 'approved',
    created_at: daysAgo(25),
  },
  {
    id: 'dd-doc-005',
    org_id: ORG_ID,
    name: 'Current Rent Roll.xlsx',
    type: 'xlsx',
    size_kb: 142,
    uploaded_by: 'property_manager',
    status: 'approved',
    created_at: daysAgo(22),
  },
  {
    id: 'dd-doc-006',
    org_id: ORG_ID,
    name: 'Loan Application — Western Commercial Bank.pdf',
    type: 'pdf',
    size_kb: 920,
    uploaded_by: 'commercial_lender',
    status: 'pending_review',
    created_at: daysAgo(22),
  },
  {
    id: 'dd-doc-007',
    org_id: ORG_ID,
    name: 'Phase I ESA Scope of Work.pdf',
    type: 'pdf',
    size_kb: 310,
    uploaded_by: 'environmental_consultant',
    status: 'approved',
    created_at: daysAgo(18),
  },
  {
    id: 'dd-doc-008',
    org_id: ORG_ID,
    name: 'Insurance Quote — Shield Brokerage.pdf',
    type: 'pdf',
    size_kb: 480,
    uploaded_by: 'insurance_broker',
    status: 'draft',
    created_at: daysAgo(10),
  },
]

// ---------------------------------------------------------------------------
// Calendar events
// ---------------------------------------------------------------------------

export const SEED_CALENDAR_EVENTS: DemoCalendarEvent[] = [
  {
    id: 'dd-cal-001',
    org_id: ORG_ID,
    title: 'Phase I ESA Site Visit',
    description: 'On-site environmental assessment of Vernon Commerce Center. All tenant spaces and loading dock area.',
    start_time: daysFromNow(2) ,
    end_time: daysFromNow(2),
    attendees: ['environmental_consultant', 'commercial_broker', 'property_manager'],
    location: '2810 Leonis Blvd, Vernon, CA 90058',
    created_at: daysAgo(18),
  },
  {
    id: 'dd-cal-002',
    org_id: ORG_ID,
    title: 'Loan Committee Review',
    description: 'Western Commercial Bank internal loan committee review of Vernon Commerce Center acquisition.',
    start_time: daysFromNow(10),
    end_time: daysFromNow(10),
    attendees: ['commercial_lender'],
    location: 'Western Commercial Bank — Conference Room B',
    created_at: daysAgo(20),
  },
  {
    id: 'dd-cal-003',
    org_id: ORG_ID,
    title: 'Title Exception Review Call',
    description: 'Attorney review of preliminary title report exceptions with title officer.',
    start_time: daysFromNow(3),
    end_time: daysFromNow(3),
    attendees: ['real_estate_attorney', 'title_company', 'commercial_broker'],
    location: 'Zoom — link in calendar invite',
    created_at: daysAgo(19),
  },
  {
    id: 'dd-cal-004',
    org_id: ORG_ID,
    title: 'Property Walk-Through (Survey)',
    description: 'ALTA/NSPS survey field work and boundary staking.',
    start_time: daysFromNow(4),
    end_time: daysFromNow(4),
    attendees: ['surveyor', 'property_manager'],
    location: '2810 Leonis Blvd, Vernon, CA 90058',
    created_at: daysAgo(16),
  },
  {
    id: 'dd-cal-005',
    org_id: ORG_ID,
    title: 'Due Diligence Deadline',
    description: 'Last day of the 45-day due diligence period. Earnest money goes hard after this date.',
    start_time: daysFromNow(15),
    end_time: daysFromNow(15),
    attendees: [
      'commercial_broker', 'commercial_lender', 'title_company', 'escrow_officer',
      'insurance_broker', 'appraiser', 'environmental_consultant', 'surveyor',
      'real_estate_attorney', 'property_manager',
    ],
    location: 'N/A — Contractual Deadline',
    created_at: daysAgo(28),
  },
]

// ---------------------------------------------------------------------------
// Default notifications (shown when user first enters)
// ---------------------------------------------------------------------------

export const SEED_NOTIFICATIONS: DemoNotification[] = [
  {
    id: 'dd-notif-001',
    org_id: ORG_ID,
    target_role: 'commercial_broker',
    title: 'Welcome to DONNA Drive',
    body: 'You are the Commercial Broker for the Vernon Commerce Center acquisition. Review your inbox and tasks to get started.',
    type: 'info',
    read: false,
    created_at: daysAgo(0),
  },
  {
    id: 'dd-notif-002',
    org_id: ORG_ID,
    target_role: 'property_manager',
    title: 'Estoppel Certificates Overdue',
    body: '2 of 4 tenant estoppel certificates are still outstanding. Follow up with tenants immediately.',
    type: 'urgent',
    read: false,
    created_at: daysAgo(1),
  },
  {
    id: 'dd-notif-003',
    org_id: ORG_ID,
    target_role: 'appraiser',
    title: 'Comparable Sales Data Needed',
    body: 'Need additional comparable sales within 5-mile radius. Contact broker for off-market transaction data.',
    type: 'action_required',
    read: false,
    created_at: daysAgo(2),
  },
]

// ---------------------------------------------------------------------------
// Export everything as a bundle for the seed endpoint (fallback)
// ---------------------------------------------------------------------------

import { generateDemoSeedData } from './seed-generator'

export const DEMO_SEED_DATA = generateDemoSeedData('vernon', ORG_ID)
