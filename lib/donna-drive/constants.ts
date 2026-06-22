/**
 * DONNA Drive — Constants
 *
 * Central configuration for the demo experience: roles, event definitions,
 * property details, and feature flags.
 */

import type { DemoRoleSlug, DemoEventType } from './types'
import { logWarning } from './log-utils'


// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

/**
 * Returns true if the DONNA Drive demo is enabled via environment variables.
 * This abstracts the raw env checks and guarantees a boolean value.
 */
export function isDonnaDriveEnabled(): boolean {
  return (
    process.env.DONNA_DRIVE_ENABLED === 'true' ||
    process.env.NEXT_PUBLIC_DONNA_DRIVE_ENABLED === 'true'
  );
}

// ---------------------------------------------------------------------------
// Facilitator secret (server-side only — never exposed to the client)
// ---------------------------------------------------------------------------

// Facilitator secret – server‑side only. In production this must be set, otherwise we log a warning.
function getFacilitatorSecretInternal(): string {
  const secret = process.env.DONNA_DRIVE_FACILITATOR_SECRET;
  if (secret) return secret;

  // In non‑production environments we fall back to a dev constant but emit a warning.
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[DONNA‑Drive] FACILITATOR_SECRET is not set – using development fallback.');
    // Log warning to Supabase via helper (if configured)
    logWarning('FACILITATOR_SECRET missing – using dev fallback');
    return 'donna-drive-dev';
  }

  // Production without a secret is a hard error.
  throw new Error('FACILITATOR_SECRET must be defined in production environment');
}
export const FACILITATOR_SECRET = getFacilitatorSecretInternal();

// ---------------------------------------------------------------------------
// Demo organization defaults
// ---------------------------------------------------------------------------

export const DEMO_ORG_NAME = 'DONNA Drive Commercial Acquisition'
export const DEMO_PROPERTY_NAME = 'Vernon Commerce Center'
export const DEMO_PROPERTY_VALUE = '$8.5M'
export const DEMO_PROPERTY_DESCRIPTION =
  'A 45,000 sq ft Class A industrial/flex building located at 2810 Leonis Blvd, Vernon, CA 90058. ' +
  'Built in 2019, the property features 28\' clear height, 4 dock-high doors, ' +
  'ESFR sprinkler system, and 60 parking spaces. Currently 92% occupied with a ' +
  'weighted average lease term of 4.2 years.'

// ---------------------------------------------------------------------------
// Role definitions
// ---------------------------------------------------------------------------

export interface RoleDefinition {
  slug: DemoRoleSlug
  label: string
  description: string
  icon: string     // lucide icon name
  color: string    // tailwind color token
}

export const DEMO_ROLES: RoleDefinition[] = [
  {
    slug: 'commercial_broker',
    label: 'Commercial Broker',
    description: 'Lead the acquisition process, coordinate due diligence, and negotiate deal terms.',
    icon: 'Briefcase',
    color: 'blue',
  },
  {
    slug: 'commercial_lender',
    label: 'Commercial Lender',
    description: 'Manage financing, underwrite the loan, and coordinate with the borrower.',
    icon: 'Landmark',
    color: 'emerald',
  },
  {
    slug: 'title_company',
    label: 'Title Company',
    description: 'Research title history, issue preliminary title report, and clear exceptions.',
    icon: 'FileSearch',
    color: 'amber',
  },
  {
    slug: 'escrow_officer',
    label: 'Escrow Officer',
    description: 'Hold earnest money, manage closing documents, and coordinate the settlement.',
    icon: 'ShieldCheck',
    color: 'violet',
  },
  {
    slug: 'insurance_broker',
    label: 'Insurance Broker',
    description: 'Quote property and liability coverage, coordinate loss-control inspections.',
    icon: 'Umbrella',
    color: 'rose',
  },
  {
    slug: 'appraiser',
    label: 'Appraiser',
    description: 'Conduct property valuation using income, sales-comparison, and cost approaches.',
    icon: 'Calculator',
    color: 'cyan',
  },
  {
    slug: 'environmental_consultant',
    label: 'Environmental Consultant',
    description: 'Perform Phase I ESA, identify recognized environmental conditions.',
    icon: 'Leaf',
    color: 'green',
  },
  {
    slug: 'surveyor',
    label: 'Surveyor',
    description: 'Prepare ALTA/NSPS survey, identify easements, encroachments, and setbacks.',
    icon: 'Map',
    color: 'orange',
  },
  {
    slug: 'real_estate_attorney',
    label: 'Real Estate Attorney',
    description: 'Review and negotiate purchase agreement, resolve title and legal issues.',
    icon: 'Scale',
    color: 'indigo',
  },
  {
    slug: 'property_manager',
    label: 'Property Manager',
    description: 'Oversee tenant relations, review leases, plan transition of management.',
    icon: 'Building2',
    color: 'teal',
  },
]

// ---------------------------------------------------------------------------
// Scenario event definitions (facilitator can inject these)
// ---------------------------------------------------------------------------

export interface EventDefinition {
  type: DemoEventType
  label: string
  description: string
  icon: string
  color: string
}

export const DEMO_EVENTS: EventDefinition[] = [
  {
    type: 'environmental_issue',
    label: 'Environmental Issue Discovered',
    description: 'Phase I ESA reveals a recognized environmental condition (REC) near the loading dock area.',
    icon: 'AlertTriangle',
    color: 'red',
  },
  {
    type: 'title_easement',
    label: 'Title Easement Found',
    description: 'Preliminary title report reveals an unrecorded utility easement across the south parking area.',
    icon: 'FileWarning',
    color: 'amber',
  },
  {
    type: 'appraisal_delayed',
    label: 'Appraisal Delayed',
    description: 'Appraiser requests 5 additional business days due to lack of comparable sales data.',
    icon: 'Clock',
    color: 'orange',
  },
  {
    type: 'financing_issue',
    label: 'Financing Issue',
    description: 'Lender requires updated DSCR projections — current ratio falls below 1.25x threshold.',
    icon: 'TrendingDown',
    color: 'rose',
  },
  {
    type: 'missing_escrow_document',
    label: 'Missing Escrow Document',
    description: 'Escrow officer flags missing estoppel certificate from the anchor tenant.',
    icon: 'FileX',
    color: 'violet',
  },
]

// ---------------------------------------------------------------------------
// Helper lookups
// ---------------------------------------------------------------------------

export function getRoleBySlug(slug: DemoRoleSlug): RoleDefinition | undefined {
  return DEMO_ROLES.find((r) => r.slug === slug)
}

export function getEventByType(type: DemoEventType): EventDefinition | undefined {
  return DEMO_EVENTS.find((e) => e.type === type)
}
