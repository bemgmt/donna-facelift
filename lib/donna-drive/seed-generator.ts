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

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function daysAgo(days: number): string {
  return daysFromNow(-days)
}

export type ScenarioKey = 'vernon' | 'monterey' | 'downtown' | 'riverside' | 'commerce'

export function generateDemoSeedData(scenarioKey: ScenarioKey, orgId: string) {
  let contacts: DemoContact[] = []
  let emails: DemoEmail[] = []
  let tasks: DemoTask[] = []
  let documents: DemoDocument[] = []
  let calendar_events: DemoCalendarEvent[] = []
  let notifications: DemoNotification[] = []
  let din_bid_requests: DemoDINBidRequest[] = []
  let din_bid_responses: DemoDINBidResponse[] = []

  if (scenarioKey === 'vernon') {
    contacts = [
      { id: `${orgId}-c1`, org_id: orgId, name: 'Marcus Chen', title: 'Managing Director', email: 'mchen@pacificcommercial.com', phone: '(213) 555-0147', company: 'Pacific Commercial Realty', role_slug: 'commercial_broker', notes: 'Lead broker', created_at: daysAgo(30) },
      { id: `${orgId}-c2`, org_id: orgId, name: 'Sarah Okafor', title: 'VP Commercial Lending', email: 'sokafor@westernbank.com', phone: '(310) 555-0238', company: 'Western Commercial Bank', role_slug: 'commercial_lender', notes: 'Lender', created_at: daysAgo(28) },
      { id: `${orgId}-c3`, org_id: orgId, name: 'Omar Hassan', title: 'Principal Environmental Engineer', email: 'ohassan@greenfieldenv.com', phone: '(949) 555-0712', company: 'Greenfield Environmental', role_slug: 'environmental_consultant', notes: 'Phase I ESA', created_at: daysAgo(18) },
    ]
    emails = [
      { id: `${orgId}-e1`, org_id: orgId, from_role: 'commercial_broker', to_role: 'commercial_lender', subject: 'Vernon Commerce Center — LOI', body: 'Sending the LOI.', read: true, starred: false, thread_id: `${orgId}-thread1`, created_at: daysAgo(25) },
      { id: `${orgId}-e2`, org_id: orgId, from_role: 'commercial_lender', to_role: 'commercial_broker', subject: 'Re: Vernon Commerce Center — LOI', body: 'Received, starting underwriting.', read: true, starred: true, thread_id: `${orgId}-thread1`, in_reply_to: `${orgId}-e1`, created_at: daysAgo(24) },
    ]
    tasks = [
      { id: `${orgId}-t1`, org_id: orgId, assigned_to: 'commercial_lender', title: 'Order Appraisal', description: 'Order it now.', status: 'completed', priority: 'high', due_date: daysAgo(20), created_at: daysAgo(23) },
      { id: `${orgId}-t2`, org_id: orgId, assigned_to: 'environmental_consultant', title: 'Phase I ESA', description: 'Conduct site visit.', status: 'in_progress', priority: 'high', due_date: daysFromNow(2), dependency_task_ids: [`${orgId}-t1`], created_at: daysAgo(18) },
    ]
    documents = [
      { id: `${orgId}-d1`, org_id: orgId, name: 'LOI.pdf', type: 'pdf', size_kb: 245, uploaded_by: 'commercial_broker', status: 'signed', version: 'v1.0', version_history: [{ version: 'v1.0', uploaded_by: 'commercial_broker', uploaded_at: daysAgo(28) }], created_at: daysAgo(28) },
    ]
    din_bid_requests = [
      { id: `${orgId}-br1`, org_id: orgId, requested_by: 'commercial_lender', service_type: 'appraisal', title: 'Appraisal for Vernon Commerce', description: 'Need MAI appraisal for $8.5M industrial.', status: 'open', due_date: daysFromNow(5), created_at: daysAgo(2) }
    ]
  } else if (scenarioKey === 'monterey') {
    contacts = [
      { id: `${orgId}-c1`, org_id: orgId, name: 'Alan Wong', title: 'Broker', email: 'awong@healthcre.com', phone: '(213) 555-9999', company: 'Healthcare Property Advisors', role_slug: 'commercial_broker', notes: 'Broker for Monterey', created_at: daysAgo(20) },
      { id: `${orgId}-c2`, org_id: orgId, name: 'Emily Carter', title: 'Lending Officer', email: 'ecarter@harborcapital.com', phone: '(310) 555-8888', company: 'Harbor Capital Lending', role_slug: 'commercial_lender', notes: 'Lender for Refi', created_at: daysAgo(19) },
    ]
    emails = [
      { id: `${orgId}-e1`, org_id: orgId, from_role: 'commercial_broker', to_role: 'commercial_lender', subject: 'Monterey Refinance Package', body: 'Here is the package.', read: true, starred: false, thread_id: `${orgId}-thread1`, created_at: daysAgo(15) },
    ]
    tasks = [
      { id: `${orgId}-t1`, org_id: orgId, assigned_to: 'commercial_lender', title: 'Underwrite Refinance', description: 'Review rent rolls.', status: 'in_progress', priority: 'high', due_date: daysFromNow(5), created_at: daysAgo(10) },
    ]
    documents = [
      { id: `${orgId}-d1`, org_id: orgId, name: 'Rent_Roll.xlsx', type: 'xlsx', size_kb: 102, uploaded_by: 'commercial_broker', status: 'approved', version: 'v2.1', version_history: [{ version: 'v2.1', uploaded_by: 'commercial_broker', uploaded_at: daysAgo(10) }], created_at: daysAgo(10) },
    ]
    din_bid_requests = [
      { id: `${orgId}-br1`, org_id: orgId, requested_by: 'commercial_lender', service_type: 'environmental', title: 'Phase I ESA Update', description: 'Update needed for refi.', status: 'open', due_date: daysFromNow(3), created_at: daysAgo(1) }
    ]
  } else if (scenarioKey === 'downtown') {
    contacts = [
      { id: `${orgId}-c1`, org_id: orgId, name: 'Tony Garcia', title: 'Listing Broker', email: 'tgarcia@urbanadvisors.com', phone: '(213) 555-1111', company: 'Urban Commercial Advisors', role_slug: 'commercial_broker', notes: 'Listing Broker', created_at: daysAgo(40) },
      { id: `${orgId}-c2`, org_id: orgId, name: 'Daniel Moore', title: 'VP CRE Division', email: 'dmoore@commercebank.com', phone: '(213) 555-2222', company: 'Commerce Bank', role_slug: 'commercial_lender', notes: 'Lender for acquisition', created_at: daysAgo(35) },
      { id: `${orgId}-c3`, org_id: orgId, name: 'Patricia White', title: 'Senior Escrow Officer', email: 'pwhite@landmarkescrow.com', phone: '(213) 555-3333', company: 'Landmark Escrow', role_slug: 'escrow_officer', notes: 'Handling escrow', created_at: daysAgo(30) },
      { id: `${orgId}-c4`, org_id: orgId, name: 'Andrew Scott', title: 'Title Officer', email: 'ascott@nationaltitle.com', phone: '(213) 555-4444', company: 'National Title Services', role_slug: 'title_company', notes: 'Title services', created_at: daysAgo(30) },
    ]
    emails = [
      { id: `${orgId}-e1`, org_id: orgId, from_role: 'commercial_broker', to_role: 'escrow_officer', subject: 'Downtown Retail - Open Escrow', body: 'Please open escrow for the Downtown Retail Center at $5.2M.', read: true, starred: true, thread_id: `${orgId}-dt-thread1`, created_at: daysAgo(30) },
      { id: `${orgId}-e2`, org_id: orgId, from_role: 'escrow_officer', to_role: 'commercial_broker', subject: 'Re: Downtown Retail - Open Escrow', body: 'Escrow opened. Number is 2026-DT-991.', read: true, starred: false, thread_id: `${orgId}-dt-thread1`, in_reply_to: `${orgId}-e1`, created_at: daysAgo(29) },
      { id: `${orgId}-e3`, org_id: orgId, from_role: 'commercial_broker', to_role: 'commercial_lender', subject: 'Downtown Retail - Major Tenant Update', body: 'FYI, the major anchor tenant just announced non-renewal. We need to discuss how this impacts underwriting.', read: false, starred: true, thread_id: `${orgId}-dt-thread2`, created_at: daysAgo(1) },
    ]
    tasks = [
      { id: `${orgId}-t1`, org_id: orgId, assigned_to: 'title_company', title: 'Provide Prelim Title Report', description: 'Need the prelim ASAP for buyer review.', status: 'completed', priority: 'high', due_date: daysAgo(25), created_at: daysAgo(29) },
      { id: `${orgId}-t2`, org_id: orgId, assigned_to: 'commercial_lender', title: 'Review Anchor Tenant Non-Renewal', description: 'Re-calculate DSCR based on the anchor tenant leaving.', status: 'in_progress', priority: 'urgent', due_date: daysFromNow(2), dependency_task_ids: [], created_at: daysAgo(1) },
    ]
    documents = [
      { id: `${orgId}-d1`, org_id: orgId, name: 'PSA_Signed.pdf', type: 'pdf', size_kb: 4500, uploaded_by: 'commercial_broker', status: 'signed', version: 'v1.0', version_history: [{ version: 'v1.0', uploaded_by: 'commercial_broker', uploaded_at: daysAgo(30) }], created_at: daysAgo(30) },
      { id: `${orgId}-d2`, org_id: orgId, name: 'Roof_Inspection_Report.pdf', type: 'pdf', size_kb: 2100, uploaded_by: 'property_manager', status: 'approved', version: 'v1.0', version_history: [{ version: 'v1.0', uploaded_by: 'property_manager', uploaded_at: daysAgo(5) }], created_at: daysAgo(5) },
    ]
    din_bid_requests = [
      { id: `${orgId}-br1`, org_id: orgId, requested_by: 'commercial_broker', service_type: 'property_manager', title: 'Property Inspector Needed', description: 'Need a rush roof inspection for deferred maintenance check.', status: 'closed', due_date: daysAgo(10), created_at: daysAgo(15) }
    ]
  } else if (scenarioKey === 'riverside') {
    contacts = [
      { id: `${orgId}-c1`, org_id: orgId, name: 'Emily Nguyen', title: 'Multifamily Advisor', email: 'emily@mfadvisors.com', phone: '(213) 555-5678', company: 'Multifamily Capital Advisors', role_slug: 'commercial_broker', notes: 'Broker', created_at: daysAgo(40) },
      { id: `${orgId}-c2`, org_id: orgId, name: 'Jason Bell', title: 'Loan Officer', email: 'jbell@westernapt.com', phone: '(213) 555-6666', company: 'Western Apartment Finance', role_slug: 'commercial_lender', notes: 'Lender', created_at: daysAgo(35) },
      { id: `${orgId}-c3`, org_id: orgId, name: 'David Allen', title: 'Risk Advisor', email: 'dallen@mfrisk.com', phone: '(213) 555-7777', company: 'Multifamily Risk Solutions', role_slug: 'insurance_broker', notes: 'Insurance', created_at: daysAgo(30) },
      { id: `${orgId}-c4`, org_id: orgId, name: 'Megan Stewart', title: 'Property Manager', email: 'mstewart@primeres.com', phone: '(213) 555-8888', company: 'Prime Residential Management', role_slug: 'property_manager', notes: 'Property Manager', created_at: daysAgo(25) },
    ]
    emails = [
      { id: `${orgId}-e1`, org_id: orgId, from_role: 'commercial_broker', to_role: 'commercial_lender', subject: 'Riverside Multifamily - Occupancy Drop', body: 'Occupancy just dropped below your 90% requirement. Currently at 88%. Can we get an exception?', read: false, starred: true, thread_id: `${orgId}-rs-thread1`, created_at: daysAgo(2) },
      { id: `${orgId}-e2`, org_id: orgId, from_role: 'insurance_broker', to_role: 'commercial_broker', subject: 'Riverside - Premium Increase', body: 'The carrier just revised the quote. Premium is up 22% due to claims history.', read: true, starred: true, thread_id: `${orgId}-rs-thread2`, created_at: daysAgo(3) },
    ]
    tasks = [
      { id: `${orgId}-t1`, org_id: orgId, assigned_to: 'property_manager', title: 'Update Rent Roll', description: 'Provide the updated rent roll showing current occupancy.', status: 'in_progress', priority: 'high', due_date: daysFromNow(1), created_at: daysAgo(2) },
      { id: `${orgId}-t2`, org_id: orgId, assigned_to: 'commercial_lender', title: 'Review Loan Approval Exception', description: 'Review the occupancy drop and decide on loan exception.', status: 'pending', priority: 'urgent', due_date: daysFromNow(3), dependency_task_ids: [`${orgId}-t1`], created_at: daysAgo(1) },
    ]
    documents = [
      { id: `${orgId}-d1`, org_id: orgId, name: 'Seller_Financials_Incomplete.pdf', type: 'pdf', size_kb: 1200, uploaded_by: 'commercial_broker', status: 'pending_review', version: 'v1.0', version_history: [{ version: 'v1.0', uploaded_by: 'commercial_broker', uploaded_at: daysAgo(5) }], created_at: daysAgo(5) },
    ]
    din_bid_requests = [
      { id: `${orgId}-br1`, org_id: orgId, requested_by: 'commercial_broker', service_type: 'appraiser', title: 'Multifamily Appraisal', description: 'Need appraisal for 96-unit complex.', status: 'awarded', due_date: daysAgo(20), created_at: daysAgo(25) }
    ]
  } else if (scenarioKey === 'commerce') {
    contacts = [
      { id: `${orgId}-c1`, org_id: orgId, name: 'Jonathan Reed', title: 'Developer', email: 'jreed@reeddev.com', phone: '(213) 555-8765', company: 'Reed Development', role_slug: 'commercial_broker', notes: 'Developer playing broker role', created_at: daysAgo(50) },
      { id: `${orgId}-c2`, org_id: orgId, name: 'Stephanie Moore', title: 'Construction Lender', email: 'smoore@natdevbank.com', phone: '(213) 555-1122', company: 'National Development Bank', role_slug: 'commercial_lender', notes: 'Construction Lender', created_at: daysAgo(45) },
      { id: `${orgId}-c3`, org_id: orgId, name: 'Laura Simmons', title: 'Environmental Consultant', email: 'lsimmons@greenearth.com', phone: '(213) 555-3344', company: 'Green Earth Consultants', role_slug: 'environmental_consultant', notes: 'Environmental', created_at: daysAgo(40) },
      { id: `${orgId}-c4`, org_id: orgId, name: 'Brandon King', title: 'Surveyor', email: 'bking@landmarks.com', phone: '(213) 555-5566', company: 'Landmark Survey Group', role_slug: 'surveyor', notes: 'Surveyor', created_at: daysAgo(35) },
    ]
    emails = [
      { id: `${orgId}-e1`, org_id: orgId, from_role: 'environmental_consultant', to_role: 'commercial_broker', subject: 'URGENT: Soil Report Remediation', body: 'The soil report identifies severe remediation requirements. This will impact the construction timeline and budget.', read: true, starred: true, thread_id: `${orgId}-com-thread1`, created_at: daysAgo(4) },
      { id: `${orgId}-e2`, org_id: orgId, from_role: 'commercial_broker', to_role: 'commercial_lender', subject: 'Commerce Development - Budget Update', body: 'Construction costs are currently exceeding budget by 8% due to the soil remediation requirements.', read: false, starred: true, thread_id: `${orgId}-com-thread2`, created_at: daysAgo(2) },
    ]
    tasks = [
      { id: `${orgId}-t1`, org_id: orgId, assigned_to: 'environmental_consultant', title: 'Draft Remediation Plan', description: 'Create a formal remediation plan to submit to the city.', status: 'in_progress', priority: 'urgent', due_date: daysFromNow(2), created_at: daysAgo(4) },
      { id: `${orgId}-t2`, org_id: orgId, assigned_to: 'commercial_lender', title: 'Re-evaluate Construction Loan Sizing', description: 'Adjust loan sizing based on the new budget deficit.', status: 'pending', priority: 'high', due_date: daysFromNow(5), dependency_task_ids: [`${orgId}-t1`], created_at: daysAgo(2) },
    ]
    documents = [
      { id: `${orgId}-d1`, org_id: orgId, name: 'Soil_Report_Initial.pdf', type: 'pdf', size_kb: 5500, uploaded_by: 'environmental_consultant', status: 'approved', version: 'v1.0', version_history: [{ version: 'v1.0', uploaded_by: 'environmental_consultant', uploaded_at: daysAgo(5) }], created_at: daysAgo(5) },
      { id: `${orgId}-d2`, org_id: orgId, name: 'Construction_Budget_Rev2.xlsx', type: 'xlsx', size_kb: 145, uploaded_by: 'commercial_broker', status: 'pending_review', version: 'v2.0', version_history: [{ version: 'v1.0', uploaded_by: 'commercial_broker', uploaded_at: daysAgo(20) }, { version: 'v2.0', uploaded_by: 'commercial_broker', uploaded_at: daysAgo(2) }], created_at: daysAgo(2) },
    ]
    din_bid_requests = [
      { id: `${orgId}-br1`, org_id: orgId, requested_by: 'commercial_broker', service_type: 'surveyor', title: 'Topographical Survey', description: 'Need a topo survey for the new development site.', status: 'awarded', due_date: daysAgo(30), created_at: daysAgo(35) }
    ]
  }

  // Common notifications and dynamic incident workflows
  notifications.push({
    id: `${orgId}-n1`,
    org_id: orgId,
    target_role: 'commercial_broker',
    title: `Welcome to ${scenarioKey.toUpperCase()} Scenario`,
    body: 'Review your tasks and DIN marketplace requests.',
    type: 'info',
    read: false,
    created_at: daysAgo(0)
  })

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
