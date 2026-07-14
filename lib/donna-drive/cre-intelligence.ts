export type DonnaPreparationMode = "generate" | "prefill" | "collect" | "review"

export interface AffiliatePackage {
  id: string
  name: string
  owner: string
  mode: DonnaPreparationMode
  documents: string[]
  requiredInputs: string[]
  dependency: string
  demoStatus: "ready" | "attention" | "waiting"
}

export const CRE_AFFILIATE_PACKAGES: AffiliatePackage[] = [
  ["lender", "Commercial lender", "Lender / mortgage broker", "prefill", ["Loan application", "Borrower authorization", "Personal financial statement", "Environmental questionnaire", "Commitment letter", "Promissory note", "Deed of trust"], ["Borrower and guarantor data", "Entity chart", "Rent roll", "T-12 and YTD statements", "Sources and uses"], "Financing approval and funding", "attention"],
  ["title", "Title & escrow", "Title and escrow officer", "review", ["Preliminary title report", "Exception documents", "Escrow instructions", "Estimated closing statement", "Owner affidavit", "Title policy"], ["Vesting", "Signer authority", "Legal description", "Payoff demands", "Proration inputs"], "Insurable title and recordable close", "attention"],
  ["inspection", "Property inspection", "Property condition consultant", "collect", ["Property condition assessment", "Roof report", "HVAC inspection", "Structural report", "Repair-cost schedule"], ["Site access", "Plans", "Maintenance history", "Prior reports", "Owner questionnaire"], "Physical diligence and repair strategy", "ready"],
  ["environmental", "Environmental", "Environmental professional", "collect", ["Phase I ESA", "Phase II recommendation", "Asbestos survey", "Vapor-intrusion report", "Reliance letter"], ["User questionnaire", "Site access", "Prior environmental files", "Historical-use records"], "Environmental clearance and lender approval", "waiting"],
  ["survey", "Survey", "Licensed surveyor", "collect", ["ALTA/NSPS survey", "Boundary survey", "Easement exhibit", "Legal-description exhibit"], ["Title commitment", "Exception documents", "Legal description", "Access and utility information"], "Title exception review", "waiting"],
  ["appraisal", "Appraisal", "Appraiser", "collect", ["Engagement letter", "MAI appraisal", "Value reconciliation", "Appraisal update"], ["Rent roll", "Leases", "Operating statements", "Capital history", "Property access"], "Loan sizing and investment approval", "ready"],
  ["insurance", "Insurance", "Insurance broker", "prefill", ["Application", "Loss runs", "Binder", "Certificate of insurance", "Flood determination", "Lender endorsements"], ["Statement of values", "Construction and occupancy", "Loss history", "Lender requirements"], "Binding coverage before funding", "attention"],
  ["tenants", "Tenants & property manager", "Seller / property manager", "generate", ["Certified rent roll", "Tenant estoppels", "SNDAs", "Security-deposit ledger", "Lease abstracts", "Ownership-change notices"], ["Leases and amendments", "Tenant contacts", "Receivables", "Deposits", "Options and rights"], "Income verification and lender conditions", "attention"],
  ["closing", "Legal & closing", "Parties, counsel and escrow", "generate", ["Closing checklist", "Entity resolutions", "Bill of sale", "Assignment of leases", "General assignment", "FIRPTA affidavit", "Possession certificate"], ["Final party data", "Signer authority", "Assigned contracts", "Closing adjustments", "Approval record"], "Authorized document execution", "ready"],
  ["government", "Government & tax", "Escrow / tax advisor / recorder", "prefill", ["Preliminary Change of Ownership Report", "California Form 593", "1099-S intake", "Transfer-tax declaration", "Recording cover sheet"], ["Consideration", "Ownership percentages", "Seller residency", "APNs", "County-specific answers"], "Tax compliance and recording", "ready"],
].map(([id, name, owner, mode, documents, requiredInputs, dependency, demoStatus]) => ({ id, name, owner, mode, documents, requiredInputs, dependency, demoStatus } as AffiliatePackage))

export const DEMO_LEGAL_NOTICE = "DEMO ONLY — FICTIONAL TRANSACTION — NOT FOR SIGNATURE, FILING, RECORDING OR LEGAL RELIANCE"
export const modeLabels: Record<DonnaPreparationMode, string> = { generate: "DONNA can generate", prefill: "DONNA can prefill", collect: "Licensed provider delivers", review: "DONNA can extract & review" }
