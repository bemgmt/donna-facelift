import { ScenarioPack } from './types';

export const BIBLE_DATA = {
  "version": "1.0",
  "generatedDate": "2026-06-23",
  "scenarios": [
    {
      "id": "vernon-commerce-center-acquisition",
      "name": "Vernon Commerce Center Acquisition",
      "jurisdiction": "california",
      "propertyType": "industrial acquisition",
      "scenarioBrief": "Fast-moving acquisition of a two-building last-mile industrial park with title, estoppel, survey, deferred maintenance, and environmental follow-up pressure.",
      "companies": [
        { "id": "vcc-buyer", "name": "Pacific Crest Industrial Partners, LLC", "roleInDeal": "buyer", "description": "Industrial sponsor pursuing a 35-day close." },
        { "id": "vcc-seller", "name": "Vernon Commerce Owner, LP", "roleInDeal": "seller", "description": "Single-asset seller exiting after long hold." },
        { "id": "vcc-lender", "name": "Harbor National Bank CRE Group", "roleInDeal": "lender", "description": "Balance-sheet lender focused on clean conditions." },
        { "id": "vcc-title", "name": "Anchor Settlement & Title", "roleInDeal": "title_escrow", "description": "Title/escrow coordinator." },
        { "id": "vcc-pmco", "name": "Westgate Property Services", "roleInDeal": "property_management", "description": "Third-party manager for post-close transition." }
      ],
      "roles": [
        {
          "id": "vcc-buyer-principal",
          "title": "Buyer Principal",
          "companyId": "vcc-buyer",
          "primaryObjective": "Preserve economics and close on rate-lock timeline.",
          "secondaryObjective": "Approve material risk responses quickly.",
          "hiddenConcern": "Seller may force a hard-money timing decision.",
          "typicalAsks": ["close-risk summary", "go/no-go recommendation", "budget impact"],
          "typicalReceives": ["issue escalations", "lender timing warnings"],
          "sampleInbox": "Need yes/no on close risk by 4 PM.",
          "secretaryOverlay": "Keep focus on economics, timing, and approval decisions."
        },
        {
          "id": "vcc-acq-manager",
          "title": "Acquisitions Manager",
          "companyId": "vcc-buyer",
          "primaryObjective": "Quarterback diligence and closing.",
          "secondaryObjective": "Translate problems into owners and deadlines.",
          "hiddenConcern": "Service contracts were not fully reviewed pre-PSA.",
          "typicalAsks": ["estoppels", "updated financials", "title fixes"],
          "typicalReceives": ["consultant reports", "condition lists"],
          "sampleInbox": "Please upload estoppel tracker.",
          "secretaryOverlay": "Always report blocker, owner, deadline, next action."
        },
        {
          "id": "vcc-seller-am",
          "title": "Seller Asset Manager",
          "companyId": "vcc-seller",
          "primaryObjective": "Close without price retrade.",
          "secondaryObjective": "Manage diligence responses.",
          "hiddenConcern": "Roof history is worse than marketed.",
          "typicalAsks": ["draft docs", "payoff coordination", "buyer deadline expectations"],
          "typicalReceives": ["repair questions", "estoppel requests"],
          "sampleInbox": "Buyer asking again about roof repairs.",
          "secretaryOverlay": "Concede process issues before economics."
        },
        {
          "id": "vcc-broker",
          "title": "Buyer Broker",
          "primaryObjective": "Keep transaction temperature down.",
          "secondaryObjective": "Provide market and tenant context.",
          "hiddenConcern": "Buyer could overreact to minor exceptions.",
          "typicalAsks": ["tenant intel", "market read", "negotiation framing"],
          "typicalReceives": ["retrade chatter", "site feedback"],
          "sampleInbox": "Tenant B is cooperative on estoppel.",
          "secretaryOverlay": "Use market framing to de-escalate."
        },
        {
          "id": "vcc-underwriter",
          "title": "Lender Underwriter",
          "companyId": "vcc-lender",
          "primaryObjective": "Clear collateral and cash-flow concerns.",
          "secondaryObjective": "Protect rate-lock timeline.",
          "hiddenConcern": "Lease rollover is tighter than memo suggested.",
          "typicalAsks": ["T-12", "AR aging", "lease abstracts", "capex history"],
          "typicalReceives": ["NOI narrative", "appraisal status"],
          "sampleInbox": "Need updated rent roll and rollover note.",
          "secretaryOverlay": "Ask for reconciliations, not just uploads."
        },
        {
          "id": "vcc-title-officer",
          "title": "Title Officer",
          "companyId": "vcc-title",
          "primaryObjective": "Deliver insurable title path.",
          "secondaryObjective": "Map deletion routes for exceptions.",
          "hiddenConcern": "Reciprocal easement support is incomplete.",
          "typicalAsks": ["survey", "payoff letters", "legal descriptions"],
          "typicalReceives": ["objections", "cure proposals"],
          "sampleInbox": "Schedule B-II exception 11 needs response.",
          "secretaryOverlay": "Think in exceptions, requirements, and deletion paths."
        },
        {
          "id": "vcc-escrow",
          "title": "Escrow Officer",
          "companyId": "vcc-title",
          "primaryObjective": "Balance and fund cleanly.",
          "secondaryObjective": "Sequence signatures and wires.",
          "hiddenConcern": "Seller payoff timing may miss cut-off.",
          "typicalAsks": ["signers", "wire approvals", "proration inputs"],
          "typicalReceives": ["statement comments", "funding timing"],
          "sampleInbox": "Need final vesting and signer titles.",
          "secretaryOverlay": "Think in signers, wires, balance, and cut-offs."
        },
        {
          "id": "vcc-env",
          "title": "Environmental Consultant",
          "primaryObjective": "Complete Phase I and advise on follow-up.",
          "secondaryObjective": "Prevent unnecessary scope expansion.",
          "hiddenConcern": "Historical industrial use may create a REC.",
          "typicalAsks": ["site access", "prior reports", "user questionnaire"],
          "typicalReceives": ["scheduling", "scope approvals"],
          "sampleInbox": "Site reconnaissance requested Thursday.",
          "secretaryOverlay": "Differentiate note, data gap, REC, and recommendation."
        },
        {
          "id": "vcc-appraiser",
          "title": "Appraiser",
          "primaryObjective": "Complete as-is valuation on time.",
          "secondaryObjective": "Get accurate rent and capex facts.",
          "hiddenConcern": "Deferred dock work may affect value conclusion.",
          "typicalAsks": ["leases", "access", "operating statements"],
          "typicalReceives": ["engagement", "inspection schedule"],
          "sampleInbox": "Need confirmed in-place rents by suite.",
          "secretaryOverlay": "Request verified facts; do not solve legal issues."
        },
        {
          "id": "vcc-surveyor",
          "title": "Surveyor",
          "primaryObjective": "Complete survey supporting title review.",
          "secondaryObjective": "Document possession conflicts.",
          "hiddenConcern": "Rear fence may not match parcel line.",
          "typicalAsks": ["title docs", "utility locates", "legal description"],
          "typicalReceives": ["field access", "title comments"],
          "sampleInbox": "Need utility locate before field work.",
          "secretaryOverlay": "Report observed possession clearly and practically."
        },
        {
          "id": "vcc-counsel",
          "title": "Counsel",
          "primaryObjective": "Separate material legal risk from negotiable business points.",
          "secondaryObjective": "Prepare objection and close package.",
          "hiddenConcern": "Notice history under the PSA is sloppy.",
          "typicalAsks": ["signature data", "title backup", "estoppel language"],
          "typicalReceives": ["draft deeds", "objections list"],
          "sampleInbox": "Please rank title objections by materiality.",
          "secretaryOverlay": "Separate legal risk, business risk, and lender-condition risk."
        },
        {
          "id": "vcc-transition",
          "title": "Transition PM",
          "companyId": "vcc-pmco",
          "primaryObjective": "Prepare operational handoff.",
          "secondaryObjective": "Confirm assignable vendors and tenant contacts.",
          "hiddenConcern": "One dock-door contract auto-renews.",
          "typicalAsks": ["contracts", "vendor matrix", "access list"],
          "typicalReceives": ["service docs", "takeover dates"],
          "sampleInbox": "Need janitorial and asphalt vendor agreements.",
          "secretaryOverlay": "Focus on takeover practicality."
        }
      ],
      "inbox": [
        { "id": "vcc-in-1", "toRoleId": "vcc-acq-manager", "priority": "high", "subject": "Updated Title Commitment", "summary": "Utility easement, reciprocal access agreement, and old deed of trust remain open." },
        { "id": "vcc-in-2", "toRoleId": "vcc-underwriter", "priority": "high", "subject": "Updated Rent Roll Request", "summary": "Need AR aging and top-tenant abstracts." },
        { "id": "vcc-in-3", "toRoleId": "vcc-env", "priority": "high", "subject": "Access Coordination", "summary": "Seller offers Thursday site walk." },
        { "id": "vcc-in-4", "toRoleId": "vcc-appraiser", "priority": "medium", "subject": "Inspection Confirmation", "summary": "Need access to both buildings and one vacant bay." }
      ],
      "tasks": [
        { "id": "VCC-01", "title": "Review title commitment and mark material objections", "ownerRoleId": "vcc-counsel", "status": "in_progress", "dependencies": [] },
        { "id": "VCC-02", "title": "Finalize survey field work", "ownerRoleId": "vcc-surveyor", "status": "waiting", "dependencies": ["VCC-01"] },
        { "id": "VCC-03", "title": "Complete Phase I user questionnaire", "ownerRoleId": "vcc-acq-manager", "status": "not_started", "dependencies": [] },
        { "id": "VCC-04", "title": "Obtain top-tenant estoppels", "ownerRoleId": "vcc-seller-am", "status": "in_progress", "dependencies": [] },
        { "id": "VCC-05", "title": "Send updated T-12, YTD, and AR aging to lender", "ownerRoleId": "vcc-acq-manager", "status": "in_progress", "dependencies": [] }
      ],
      "library": [
        { "id": "vcc-doc-1", "fileName": "VCC_PSA_Fully_Executed_v3.pdf", "category": "psa", "summary": "Hard deposit after day 10; seller estoppel covenant for major tenants." },
        { "id": "vcc-doc-2", "fileName": "VCC_Title_Commitment_Rev2.pdf", "category": "title", "summary": "Open deed of trust and access/easement exceptions." },
        { "id": "vcc-doc-3", "fileName": "VCC_RentRoll_2026-06-20.xlsx", "category": "financials", "summary": "Six-tenant industrial rent roll." },
        { "id": "vcc-doc-4", "fileName": "VCC_T12_YTD_Operating_Statement.xlsx", "category": "financials", "summary": "Repairs and maintenance elevated." },
        { "id": "vcc-doc-5", "fileName": "VCC_ServiceContracts.zip", "category": "ops", "summary": "Waste, pest, striping, and asphalt contracts." }
      ],
      "communications": [
        "Please reconcile the drop in trailing NOI with the maintenance spike and confirm whether repairs were recurring or one-time.",
        "Exception 11 may be deletable if survey shows no encroachment and seller obtains an affidavit.",
        "Title/Survey Working Session requested to map Schedule B exceptions to field conditions."
      ],
      "dinTriggers": [
        { "id": "vcc-din-1", "trigger": "material title exception remains open", "template": "DIN: Material title issue identified: [exception]. Need owner, cure path, and deadline." },
        { "id": "vcc-din-2", "trigger": "missing estoppel within final week", "template": "DIN: Missing estoppel from [tenant]. Impact: lender condition and close certainty." },
        { "id": "vcc-din-3", "trigger": "environmental follow-up recommended", "template": "DIN: Environmental follow-up recommended. Approve expanded scope?" }
      ],
      "eventCards": [
        { "id": "vcc-ec-1", "title": "Historical drum storage note", "impact": "Potential REC and lender follow-up.", "affectedRoleIds": ["vcc-acq-manager", "vcc-env", "vcc-underwriter"] },
        { "id": "vcc-ec-2", "title": "Fence encroachment found", "impact": "Survey/title cure required.", "affectedRoleIds": ["vcc-surveyor", "vcc-title-officer", "vcc-counsel"] },
        { "id": "vcc-ec-3", "title": "Dock repairs worse than disclosed", "impact": "Value and reserve discussion.", "affectedRoleIds": ["vcc-appraiser", "vcc-underwriter", "vcc-buyer-principal"] }
      ],
      "successCriteria": [
        "Material title objections identified and routed.",
        "Environmental recommendation path decided.",
        "Lender receives reconciled financial package.",
        "Close-risk memo gives credible go/no-go view."
      ],
      "timeline": [
        "Order diligence and refresh financials",
        "Review title, survey, estoppels, and consultant findings",
        "Clear lender conditions and draft closing package",
        "Fund, record, and hand off operations"
      ],
      "endOfDaySummaryFields": [
        "title_exceptions_open",
        "estoppels_outstanding",
        "rate_lock_days_remaining",
        "environmental_status"
      ]
    },
    {
      "id": "monterey-medical-plaza-refinance",
      "name": "Monterey Medical Plaza Refinance",
      "jurisdiction": "california",
      "propertyType": "medical office refinance",
      "scenarioBrief": "Borrower refinance of a medical office building with tenant concentration, insurance, reserve, payoff, and cash-management friction.",
      "companies": [
        { "id": "mmp-borrower", "name": "Cypress Medical Properties, LLC", "roleInDeal": "borrower", "description": "Physician-affiliated owner seeking refinance proceeds." },
        { "id": "mmp-oldlender", "name": "Redstone Community Bank", "roleInDeal": "existing_lender", "description": "Current lender awaiting payoff." },
        { "id": "mmp-newlender", "name": "Union Regional LifeCo Correspondent Platform", "roleInDeal": "new_lender", "description": "Permanent lender channel with strict conditions." },
        { "id": "mmp-title", "name": "Meridian Title Services", "roleInDeal": "title_escrow", "description": "Refinance closing coordinator." }
      ],
      "roles": [
        {
          "id": "mmp-principal",
          "title": "Borrower Principal",
          "companyId": "mmp-borrower",
          "primaryObjective": "Maximize proceeds and certainty.",
          "secondaryObjective": "Avoid operational distraction.",
          "hiddenConcern": "Large tenant renewal is approaching.",
          "typicalAsks": ["proceeds estimate", "timing", "covenant impacts"],
          "typicalReceives": ["sizing updates", "risk summaries"],
          "sampleInbox": "Need answer on proceeds by noon.",
          "secretaryOverlay": "Focus on proceeds, covenants, and speed."
        },
        {
          "id": "mmp-finance",
          "title": "Finance Manager",
          "companyId": "mmp-borrower",
          "primaryObjective": "Assemble borrower package.",
          "secondaryObjective": "Reconcile operating narrative.",
          "hiddenConcern": "Older reserve data is inconsistent.",
          "typicalAsks": ["T-12", "YTD", "org chart", "good standing"],
          "typicalReceives": ["condition lists"],
          "sampleInbox": "LifeCo condition list attached.",
          "secretaryOverlay": "Reconcile every number before sending."
        },
        {
          "id": "mmp-originator",
          "title": "Loan Originator",
          "primaryObjective": "Align lender and borrower expectations.",
          "secondaryObjective": "Frame tenant concentration story.",
          "hiddenConcern": "Borrower underestimates covenant impact.",
          "typicalAsks": ["tenant memo", "sponsor narrative"],
          "typicalReceives": ["lender feedback"],
          "sampleInbox": "Need stronger tenant concentration memo.",
          "secretaryOverlay": "Turn operational facts into lender comfort."
        },
        {
          "id": "mmp-processor",
          "title": "Lender Processor",
          "companyId": "mmp-newlender",
          "primaryObjective": "Clear the closing checklist.",
          "secondaryObjective": "Keep title/insurance/appraisal synchronized.",
          "hiddenConcern": "Entity package looks incomplete.",
          "typicalAsks": ["authority docs", "insurance", "appraisal access"],
          "typicalReceives": ["updated package"],
          "sampleInbox": "Missing organizational chart and good standing.",
          "secretaryOverlay": "Be checklist-driven."
        },
        {
          "id": "mmp-title-officer",
          "title": "Title Officer",
          "companyId": "mmp-title",
          "primaryObjective": "Insure refinance lien position.",
          "secondaryObjective": "Handle old fixture filing issue.",
          "hiddenConcern": "Equipment filing may overlap real-property collateral.",
          "typicalAsks": ["payoff info", "existing loan docs"],
          "typicalReceives": ["comments", "cure path"],
          "sampleInbox": "Need clarification on old fixture filing.",
          "secretaryOverlay": "Think in mortgage priority and deletion paths."
        },
        {
          "id": "mmp-escrow",
          "title": "Escrow Officer",
          "companyId": "mmp-title",
          "primaryObjective": "Fund and pay off correctly.",
          "secondaryObjective": "Manage expiring payoff numbers.",
          "hiddenConcern": "Payoff statement may expire before close.",
          "typicalAsks": ["wire timing", "fee approvals"],
          "typicalReceives": ["statement comments"],
          "sampleInbox": "Payoff expires Friday at 3 PM local.",
          "secretaryOverlay": "Track timing and balance."
        },
        {
          "id": "mmp-counsel",
          "title": "Counsel",
          "primaryObjective": "Review loan, reserve, and lockbox terms.",
          "secondaryObjective": "Protect borrower from hidden recourse creep.",
          "hiddenConcern": "Borrower has not seen how strong reserve language is.",
          "typicalAsks": ["redlines", "title support", "authority docs"],
          "typicalReceives": ["drafts", "lender comments"],
          "sampleInbox": "Please review reserve and lockbox provisions.",
          "secretaryOverlay": "Watch cash management and recourse carefully."
        },
        {
          "id": "mmp-appraiser",
          "title": "Appraiser",
          "primaryObjective": "Value a specialized medical office asset.",
          "secondaryObjective": "Understand lease and buildout specifics.",
          "hiddenConcern": "Imaging suite is highly specialized.",
          "typicalAsks": ["lease abstracts", "plans", "access"],
          "typicalReceives": ["inspection times", "TI schedule"],
          "sampleInbox": "Need lease abstract for imaging suite.",
          "secretaryOverlay": "Request verified specialty-tenant facts."
        },
        {
          "id": "mmp-pm",
          "title": "Property Manager Representative",
          "primaryObjective": "Explain operational history and capital items.",
          "secondaryObjective": "Support lender and appraisal diligence.",
          "hiddenConcern": "Two RTUs nearing replacement.",
          "typicalAsks": ["service logs", "capex history"],
          "typicalReceives": ["diligence requests"],
          "sampleInbox": "Upload 24-month service history.",
          "secretaryOverlay": "Answer as operator, not marketer."
        },
        {
          "id": "mmp-insurance",
          "title": "Insurance Broker",
          "primaryObjective": "Satisfy lender insurance review.",
          "secondaryObjective": "Control premium shock narrative.",
          "hiddenConcern": "Recent water event still visible in loss runs.",
          "typicalAsks": ["loss runs", "COPE", "replacement cost"],
          "typicalReceives": ["carrier feedback", "lender comments"],
          "sampleInbox": "LifeCo asked for updated replacement cost.",
          "secretaryOverlay": "Explain claim, cure, and current coverage clearly."
        }
      ],
      "inbox": [
        { "id": "mmp-in-1", "toRoleId": "mmp-finance", "priority": "high", "subject": "Lender Condition List 1", "summary": "Need org chart, rent roll, T-12, YTD, and tenant concentration memo." },
        { "id": "mmp-in-2", "toRoleId": "mmp-insurance", "priority": "high", "subject": "Loss Runs Request", "summary": "Need five-year loss runs and water claim story." },
        { "id": "mmp-in-3", "toRoleId": "mmp-counsel", "priority": "high", "subject": "Draft Loan Documents", "summary": "Springing cash management trigger included." }
      ],
      "tasks": [
        { "id": "MMP-01", "title": "Deliver org chart and authority docs", "ownerRoleId": "mmp-finance", "status": "in_progress", "dependencies": [] },
        { "id": "MMP-02", "title": "Draft tenant concentration and rollover memo", "ownerRoleId": "mmp-originator", "status": "not_started", "dependencies": [] },
        { "id": "MMP-03", "title": "Obtain loss runs and claim narrative", "ownerRoleId": "mmp-insurance", "status": "in_progress", "dependencies": [] },
        { "id": "MMP-04", "title": "Review springing lockbox provisions", "ownerRoleId": "mmp-counsel", "status": "in_progress", "dependencies": [] }
      ],
      "library": [
        { "id": "mmp-doc-1", "fileName": "MMP_Current_RentRoll.xlsx", "category": "financials", "summary": "Medical office rent roll." },
        { "id": "mmp-doc-2", "fileName": "MMP_T12_YTD_2026Q2.xlsx", "category": "financials", "summary": "Utilities and repairs elevated due to water event." },
        { "id": "mmp-doc-3", "fileName": "MMP_LossRuns_5yr.pdf", "category": "insurance", "summary": "Five-year claim history." }
      ],
      "communications": [
        "Please explain whether reduced occupancy is temporary backfill or structural rollover risk.",
        "Payoff statement good through Friday only; funding delay means refresh required.",
        "Updated replacement cost needed for final insurance approval."
      ],
      "dinTriggers": [
        { "id": "mmp-din-1", "trigger": "tenant concentration exceeds comfort threshold", "template": "DIN: Tenant concentration flag. Need mitigation story." },
        { "id": "mmp-din-2", "trigger": "claim history prompts lender follow-up", "template": "DIN: Recent claim requires cause, repairs, and narrative." },
        { "id": "mmp-din-3", "trigger": "payoff expires before projected funding", "template": "DIN: Existing payoff expires before funding; refresh needed." }
      ],
      "eventCards": [
        { "id": "mmp-ec-1", "title": "Open claim reserve disclosed late", "impact": "Insurance and lender follow-up.", "affectedRoleIds": ["mmp-insurance", "mmp-processor", "mmp-principal"] },
        { "id": "mmp-ec-2", "title": "Signature mismatch on payoff authorization", "impact": "Existing lender refuses final payoff.", "affectedRoleIds": ["mmp-escrow", "mmp-principal", "mmp-title-officer"] }
      ],
      "successCriteria": [
        "Lender receives coherent refinance story.",
        "Insurance/loss-run narrative resolved.",
        "Payoff timing controlled.",
        "Reserve and cash-management terms understood."
      ],
      "timeline": [
        "Assemble file and order appraisal/title",
        "Explain tenant concentration, claim history, and capex",
        "Negotiate documents and finalize payoff",
        "Fund and record refinance"
      ],
      "endOfDaySummaryFields": [
        "proceeds_estimate",
        "cash_management_status",
        "payoff_expiry",
        "claim_narrative_status"
      ]
    },
    {
      "id": "downtown-retail-center-sale",
      "name": "Downtown Retail Center Sale",
      "jurisdiction": "california",
      "propertyType": "retail sale",
      "scenarioBrief": "Sale-side retail center transaction with buyer diligence, CAM dispute, estoppel timing, roof-credit pressure, and reciprocal-access title issues.",
      "companies": [
        { "id": "drc-seller", "name": "Urban Arc Retail Fund I", "roleInDeal": "seller", "description": "Fund disposition of neighborhood retail center." },
        { "id": "drc-buyer", "name": "Beacon Street Retail Holdings", "roleInDeal": "buyer", "description": "Private buyer in post-PSA diligence." },
        { "id": "drc-broker", "name": "Northline Retail Advisors", "roleInDeal": "listing_broker", "description": "Listing broker managing market and buyer expectations." },
        { "id": "drc-title", "name": "Crescent Settlement Group", "roleInDeal": "title_escrow", "description": "Closing coordinator." }
      ],
      "roles": [
        {
          "id": "drc-seller-principal",
          "title": "Seller Principal",
          "companyId": "drc-seller",
          "primaryObjective": "Maximize net proceeds and close on schedule.",
          "secondaryObjective": "Manage buyer requests without price concession.",
          "hiddenConcern": "Roof condition may trigger a credit demand.",
          "typicalAsks": ["net proceeds estimate", "amendment strategy", "estoppel status"],
          "typicalReceives": ["buyer requests", "broker market read"],
          "sampleInbox": "Buyer requesting roof credit — need response strategy.",
          "secretaryOverlay": "Protect economics; concede process before price."
        },
        {
          "id": "drc-asset-manager",
          "title": "Seller Asset Manager",
          "companyId": "drc-seller",
          "primaryObjective": "Quarterback diligence responses and data room.",
          "secondaryObjective": "Keep buyer comfortable without over-disclosing.",
          "hiddenConcern": "CAM reconciliation has an unresolved tenant dispute.",
          "typicalAsks": ["CAM recons", "sales reports", "tenant contact info"],
          "typicalReceives": ["buyer DD lists", "PM data"],
          "sampleInbox": "Buyer Round 1 DD list attached — 14 items.",
          "secretaryOverlay": "Respond quickly and completely; flag anything that could retrade."
        },
        {
          "id": "drc-listing-broker",
          "title": "Listing Broker",
          "companyId": "drc-broker",
          "primaryObjective": "Keep transaction temperature down and close the deal.",
          "secondaryObjective": "Provide market context to frame buyer requests.",
          "hiddenConcern": "Buyer broker is pushing hard on roof credit.",
          "typicalAsks": ["market comps", "buyer temperature", "timing intel"],
          "typicalReceives": ["buyer objections", "seller strategy questions"],
          "sampleInbox": "Buyer broker called — they want a roof inspection credit.",
          "secretaryOverlay": "Use market data to reframe; separate real issues from negotiation tactics."
        },
        {
          "id": "drc-buyer-broker",
          "title": "Buyer Broker",
          "companyId": "drc-buyer",
          "primaryObjective": "Represent buyer interests and surface legitimate concerns.",
          "secondaryObjective": "Avoid antagonizing seller on non-material issues.",
          "hiddenConcern": "Buyer may be using inspection findings to renegotiate price.",
          "typicalAsks": ["inspection reports", "CAM backup", "tenant sales"],
          "typicalReceives": ["seller responses", "market context"],
          "sampleInbox": "Inspector found active roof leak stain in unit C.",
          "secretaryOverlay": "Present facts clearly; separate real risk from negotiation leverage."
        },
        {
          "id": "drc-pm",
          "title": "Property Manager",
          "companyId": "drc-seller",
          "primaryObjective": "Provide accurate operational data for diligence.",
          "secondaryObjective": "Support estoppel collection from tenants.",
          "hiddenConcern": "One tenant disputes CAM charges and may not sign estoppel.",
          "typicalAsks": ["CAM reconciliations", "service contracts", "tenant contacts"],
          "typicalReceives": ["DD requests", "estoppel drafts"],
          "sampleInbox": "Need 3-year CAM reconciliations by end of day.",
          "secretaryOverlay": "Answer as operator with verified data; flag disputes early."
        },
        {
          "id": "drc-title-officer",
          "title": "Title Officer",
          "companyId": "drc-title",
          "primaryObjective": "Deliver insurable title with cleared exceptions.",
          "secondaryObjective": "Resolve missing reciprocal access exhibit.",
          "hiddenConcern": "Parking agreement exhibit was never recorded.",
          "typicalAsks": ["recorded documents", "legal descriptions", "exhibit copies"],
          "typicalReceives": ["objections", "cure proposals"],
          "sampleInbox": "Reciprocal access agreement missing Exhibit B — parking map.",
          "secretaryOverlay": "Think in exceptions, requirements, and deletion paths."
        },
        {
          "id": "drc-escrow",
          "title": "Escrow Officer",
          "companyId": "drc-title",
          "primaryObjective": "Balance and fund the closing statement accurately.",
          "secondaryObjective": "Coordinate proration inputs and signatures.",
          "hiddenConcern": "CAM proration may be contested by buyer at closing.",
          "typicalAsks": ["proration inputs", "wire instructions", "signer info"],
          "typicalReceives": ["statement comments", "amendment language"],
          "sampleInbox": "Need seller wire instructions and authorized signers.",
          "secretaryOverlay": "Think in balance, timing, and signatures."
        },
        {
          "id": "drc-counsel",
          "title": "Counsel",
          "primaryObjective": "Advise seller on amendment requests and closing risk.",
          "secondaryObjective": "Separate economic retrade from legitimate legal issues.",
          "hiddenConcern": "Buyer amendment language is broader than their stated concern.",
          "typicalAsks": ["PSA language", "amendment drafts", "estoppel forms"],
          "typicalReceives": ["buyer requests", "title issues"],
          "sampleInbox": "Review buyer's proposed amendment — roof credit and estoppel extension.",
          "secretaryOverlay": "Separate legal risk from business negotiation."
        }
      ],
      "inbox": [
        { "id": "drc-in-1", "toRoleId": "drc-asset-manager", "priority": "high", "subject": "Buyer DD Round 1", "summary": "Requests CAM reconciliations, sales reports, and parking agreement." }
      ],
      "tasks": [
        { "id": "DRC-01", "title": "Build buyer Q&A tracker", "ownerRoleId": "drc-asset-manager", "status": "in_progress", "dependencies": [] },
        { "id": "DRC-02", "title": "Gather CAM reconciliations", "ownerRoleId": "drc-pm", "status": "in_progress", "dependencies": [] }
      ],
      "library": [
        { "id": "drc-doc-1", "fileName": "DRC_PSA_Executed.pdf", "category": "psa", "summary": "Sale-side diligence and estoppel covenant." },
        { "id": "drc-doc-2", "fileName": "DRC_CAM_Recons_3yrs.zip", "category": "financials", "summary": "CAM backup with one unresolved dispute." },
        { "id": "drc-doc-3", "fileName": "DRC_Parking_Reciprocal_Access_Agreement.pdf", "category": "title", "summary": "Recorded reciprocal access with missing exhibit." }
      ],
      "communications": [
        "Buyer request for roof escrow may be economic retrade rather than true closing issue.",
        "Parking agreement problem is the missing exhibit and maintenance proof, not the concept itself."
      ],
      "dinTriggers": [
        { "id": "drc-din-1", "trigger": "buyer request looks like retrade", "template": "DIN: Potential economic retrade rather than true closing issue." },
        { "id": "drc-din-2", "trigger": "missing easement exhibit impairs title review", "template": "DIN: Missing exhibit in reciprocal access document; need workaround." }
      ],
      "eventCards": [
        { "id": "drc-ec-1", "title": "Tenant estoppel tied to CAM dispute", "impact": "Estoppel timing at risk.", "affectedRoleIds": ["drc-pm", "drc-asset-manager", "drc-counsel"] },
        { "id": "drc-ec-2", "title": "Buyer inspector reports active roof leak stain", "impact": "Potential credit demand.", "affectedRoleIds": ["drc-seller-principal", "drc-pm", "drc-counsel"] }
      ],
      "successCriteria": [
        "Differentiate true blockers from price pressure.",
        "Protect confidentiality while satisfying due diligence.",
        "Prepare seller strategy on likely amendment asks."
      ],
      "timeline": [
        "Populate data room and answer diligence",
        "Resolve title/easement and ops issues",
        "Collect estoppels and negotiate amendments",
        "Finalize statement and close"
      ],
      "endOfDaySummaryFields": [
        "buyer_retrade_risk",
        "estoppels_received",
        "cam_dispute_status",
        "roof_issue_status"
      ]
    },
    {
      "id": "riverside-multifamily-acquisition",
      "name": "Riverside Multifamily Acquisition",
      "jurisdiction": "california",
      "propertyType": "multifamily acquisition",
      "scenarioBrief": "96-unit apartment acquisition focused on collections integrity, insurance budget stress, lease-file exceptions, title memo issues, and takeover readiness.",
      "companies": [
        { "id": "rma-buyer", "name": "Sunrise Residential Ventures, LLC", "roleInDeal": "buyer", "description": "Value-add multifamily sponsor." },
        { "id": "rma-seller", "name": "Riverside Grove Apartments, LP", "roleInDeal": "seller", "description": "Private seller exiting after rent growth run." },
        { "id": "rma-lender", "name": "Coastal Housing Finance, FSB", "roleInDeal": "lender", "description": "Multifamily lender." },
        { "id": "rma-title", "name": "Atlas Closing & Title", "roleInDeal": "title_escrow", "description": "Closing coordinator." }
      ],
      "roles": [
        {
          "id": "rma-buyer-principal",
          "title": "Buyer Principal",
          "companyId": "rma-buyer",
          "primaryObjective": "Confirm underwriting thesis and close within timeline.",
          "secondaryObjective": "Prepare investment committee risk memo.",
          "hiddenConcern": "Collections data may undermine the value-add thesis.",
          "typicalAsks": ["risk memo", "go/no-go recommendation", "budget revision"],
          "typicalReceives": ["diligence findings", "insurance quotes"],
          "sampleInbox": "Need IC-ready risk summary by tomorrow.",
          "secretaryOverlay": "Focus on economics, risk narrative, and decision timing."
        },
        {
          "id": "rma-acq-associate",
          "title": "Acquisitions Associate",
          "companyId": "rma-buyer",
          "primaryObjective": "Reconcile all diligence data and flag inconsistencies.",
          "secondaryObjective": "Translate findings into underwriting adjustments.",
          "hiddenConcern": "Delinquency roll tenant IDs don't match rent roll.",
          "typicalAsks": ["rent roll", "delinquency report", "lease files"],
          "typicalReceives": ["seller data packages", "lender conditions"],
          "sampleInbox": "Delinquency roll has 6 tenant IDs not in the rent roll.",
          "secretaryOverlay": "Reconcile every number; flag mismatches immediately."
        },
        {
          "id": "rma-seller",
          "title": "Seller Representative",
          "companyId": "rma-seller",
          "primaryObjective": "Close without retrade on price.",
          "secondaryObjective": "Provide clean data to minimize buyer objections.",
          "hiddenConcern": "Some delinquency data was restated after original submission.",
          "typicalAsks": ["buyer questions", "diligence timelines"],
          "typicalReceives": ["data requests", "inspection scheduling"],
          "sampleInbox": "Buyer questioning restated delinquency figures.",
          "secretaryOverlay": "Respond transparently; prepare explanation for data changes."
        },
        {
          "id": "rma-lender",
          "title": "Lender Underwriter",
          "companyId": "rma-lender",
          "primaryObjective": "Validate collateral quality and cash flow stability.",
          "secondaryObjective": "Confirm insurance adequacy and collections trend.",
          "hiddenConcern": "Bad debt trend may be structural, not temporary.",
          "typicalAsks": ["T-12", "rent roll", "collections narrative", "insurance binder"],
          "typicalReceives": ["borrower data", "appraisal status"],
          "sampleInbox": "Need updated collections narrative and insurance confirmation.",
          "secretaryOverlay": "Ask for explanations, not just data uploads."
        },
        {
          "id": "rma-title-officer",
          "title": "Title Officer",
          "companyId": "rma-title",
          "primaryObjective": "Deliver clean title commitment for acquisition.",
          "secondaryObjective": "Clear any judgment or lien exceptions.",
          "hiddenConcern": "Old mechanic's lien may need payoff confirmation.",
          "typicalAsks": ["payoff letters", "legal descriptions"],
          "typicalReceives": ["objections", "cure requests"],
          "sampleInbox": "Mechanic's lien from 2024 still showing — need release.",
          "secretaryOverlay": "Think in exceptions, requirements, and deletion paths."
        },
        {
          "id": "rma-escrow",
          "title": "Escrow Officer",
          "companyId": "rma-title",
          "primaryObjective": "Balance and fund multifamily acquisition cleanly.",
          "secondaryObjective": "Manage rent proration and security deposit transfer.",
          "hiddenConcern": "Security deposit accounting may not match lease files.",
          "typicalAsks": ["proration schedule", "deposit ledger", "wire timing"],
          "typicalReceives": ["statement comments", "deposit questions"],
          "sampleInbox": "Need security deposit ledger to balance closing statement.",
          "secretaryOverlay": "Track balance, deposits, and proration carefully."
        },
        {
          "id": "rma-insurance",
          "title": "Insurance Broker",
          "primaryObjective": "Bind coverage that satisfies lender requirements.",
          "secondaryObjective": "Explain premium increase relative to underwriting budget.",
          "hiddenConcern": "Quote exceeds buyer's insurance budget assumption.",
          "typicalAsks": ["COPE data", "loss runs", "roof age"],
          "typicalReceives": ["lender requirements", "carrier feedback"],
          "sampleInbox": "Preliminary quote is 18% above underwriting assumption.",
          "secretaryOverlay": "Explain cause of premium delta and provide alternatives."
        },
        {
          "id": "rma-appraiser",
          "title": "Appraiser",
          "primaryObjective": "Complete as-is valuation for 96-unit apartment complex.",
          "secondaryObjective": "Validate rental income and expense assumptions.",
          "hiddenConcern": "High vacancy in certain unit types may affect value.",
          "typicalAsks": ["unit mix", "in-place rents", "concession schedule"],
          "typicalReceives": ["inspection access", "market data"],
          "sampleInbox": "Need confirmed unit mix and concession history.",
          "secretaryOverlay": "Request verified facts; flag any data inconsistencies."
        },
        {
          "id": "rma-transition",
          "title": "Transition PM",
          "primaryObjective": "Prepare operational handoff and vendor transition.",
          "secondaryObjective": "Confirm onsite manager retention status.",
          "hiddenConcern": "Onsite manager may resign at closing.",
          "typicalAsks": ["vendor contracts", "staff roster", "key inventory"],
          "typicalReceives": ["transition timeline", "buyer priorities"],
          "sampleInbox": "Onsite manager indicated she may not stay post-close.",
          "secretaryOverlay": "Focus on takeover readiness and retention risk."
        },
        {
          "id": "rma-counsel",
          "title": "Counsel",
          "primaryObjective": "Review PSA, title, and closing documents.",
          "secondaryObjective": "Advise on lease-file exceptions and representations.",
          "hiddenConcern": "Several lease files are missing required addenda.",
          "typicalAsks": ["lease abstracts", "title backup", "PSA amendments"],
          "typicalReceives": ["buyer objections", "seller representations"],
          "sampleInbox": "12 of 96 lease files missing pet or storage addenda.",
          "secretaryOverlay": "Categorize lease-file issues as isolated vs. systemic."
        }
      ],
      "inbox": [
        { "id": "rma-in-1", "toRoleId": "rma-acq-associate", "priority": "high", "subject": "Delinquency Roll", "summary": "Tenant IDs do not match current rent roll version." },
        { "id": "rma-in-2", "toRoleId": "rma-insurance", "priority": "high", "subject": "Preliminary Quote", "summary": "Premium exceeds underwriting assumption." }
      ],
      "tasks": [
        { "id": "RMA-01", "title": "Reconcile delinquency roll to rent roll", "ownerRoleId": "rma-acq-associate", "status": "in_progress", "dependencies": [] },
        { "id": "RMA-02", "title": "Refresh insurance budget vs quote", "ownerRoleId": "rma-insurance", "status": "in_progress", "dependencies": [] }
      ],
      "library": [
        { "id": "rma-doc-1", "fileName": "RMA_RentRoll_Current.xlsx", "category": "financials", "summary": "Current unit and rent inventory." },
        { "id": "rma-doc-2", "fileName": "RMA_Delinquency_Buckets.xlsx", "category": "collections", "summary": "Aging report with mismatched IDs." },
        { "id": "rma-doc-3", "fileName": "RMA_Prelim_Insurance_Quote.pdf", "category": "insurance", "summary": "Quote materially above model assumption." }
      ],
      "communications": [
        "Please explain whether bad debt is concentrated, temporary, or systemic.",
        "Insurance quote is bindable only if roof-age detail checks out."
      ],
      "dinTriggers": [
        { "id": "rma-din-1", "trigger": "collections report does not reconcile", "template": "DIN: Delinquency report does not reconcile to rent roll. Underwriting at risk." },
        { "id": "rma-din-2", "trigger": "insurance quote exceeds model", "template": "DIN: Insurance quote exceeds underwriting assumption. Need budget revision or alternative quote." }
      ],
      "eventCards": [
        { "id": "rma-ec-1", "title": "Seller restates delinquency data", "impact": "Credibility issue in underwriting.", "affectedRoleIds": ["rma-buyer-principal", "rma-lender", "rma-seller"] },
        { "id": "rma-ec-2", "title": "Onsite manager may leave at closing", "impact": "Transition risk.", "affectedRoleIds": ["rma-transition", "rma-buyer-principal"] }
      ],
      "successCriteria": [
        "Collections and rent data reconciled.",
        "Insurance story updated.",
        "Lease-file issues categorized as isolated or systemic.",
        "Principal receives investment-committee-ready risk memo."
      ],
      "timeline": [
        "Ingest data and order appraisal",
        "Reconcile collections, insurance, and lease-file issues",
        "Update lender and IC narrative",
        "Close and hand off operations"
      ],
      "endOfDaySummaryFields": [
        "bad_debt_narrative_status",
        "insurance_delta_to_underwriting",
        "lease_file_exception_count",
        "turn_pipeline_risk"
      ]
    },
    {
      "id": "commerce-distribution-center-development",
      "name": "Commerce Distribution Center Development",
      "jurisdiction": "california",
      "propertyType": "industrial development",
      "scenarioBrief": "Land-plus-construction-finance development file with permit comments, easement conflicts, environmental follow-up, GMP gap, builder’s risk, and dual-closing sequencing pressure.",
      "companies": [
        { "id": "cdc-developer", "name": "Iron Mesa Logistics Development, LLC", "roleInDeal": "developer", "description": "Spec industrial developer." },
        { "id": "cdc-seller", "name": "Commerce Yard Holdings, Inc.", "roleInDeal": "land_seller", "description": "Land seller ready to close." },
        { "id": "cdc-lender", "name": "Summit State Bank Construction Finance", "roleInDeal": "construction_lender", "description": "Construction lender with detailed closing conditions." },
        { "id": "cdc-gc", "name": "Redline Builders, Inc.", "roleInDeal": "gc", "description": "Preconstruction GC." },
        { "id": "cdc-title", "name": "Pioneer National Title & Escrow", "roleInDeal": "title_escrow", "description": "Land and finance closing coordinator." }
      ],
      "roles": [
        {
          "id": "cdc-developer-principal",
          "title": "Developer Principal",
          "companyId": "cdc-developer",
          "primaryObjective": "Achieve site control and close dual-transaction (land + loan) on schedule.",
          "secondaryObjective": "Manage preconstruction costs and builder's risk.",
          "hiddenConcern": "The GMP contract is not finalized, risking loan sizing.",
          "typicalAsks": ["GMP status", "permit timing", "lender conditions"],
          "typicalReceives": ["city comments", "GC updates", "equity requests"],
          "sampleInbox": "Need to finalize GMP contract before lender will close.",
          "secretaryOverlay": "Keep the deal moving; isolate construction risk from land closing."
        },
        {
          "id": "cdc-dev-manager",
          "title": "Development Manager",
          "companyId": "cdc-developer",
          "primaryObjective": "Clear city comments and coordinate engineering deliverables.",
          "secondaryObjective": "Keep GC preconstruction on schedule.",
          "hiddenConcern": "City is requiring offsite frontage work not in the original budget.",
          "typicalAsks": ["civil plans", "permit status", "GC pricing"],
          "typicalReceives": ["city comments", "RFI responses"],
          "sampleInbox": "City Round 2 comments include offsite frontage improvements.",
          "secretaryOverlay": "Solve technical blockers quickly; escalate budget impacts."
        },
        {
          "id": "cdc-finance",
          "title": "Finance Associate",
          "companyId": "cdc-developer",
          "primaryObjective": "Manage construction draw schedule and closing statement.",
          "secondaryObjective": "Ensure loan conditions precedent are met.",
          "hiddenConcern": "Appraisal came in slightly low, squeezing equity.",
          "typicalAsks": ["budget updates", "draw schedule", "appraisal"],
          "typicalReceives": ["lender checklists", "GC pay apps"],
          "sampleInbox": "Lender needs updated sources and uses matching the new GMP.",
          "secretaryOverlay": "Reconcile all numbers; ensure sources equal uses."
        },
        {
          "id": "cdc-land-seller",
          "title": "Land Seller Representative",
          "companyId": "cdc-seller",
          "primaryObjective": "Close land sale without further extensions.",
          "secondaryObjective": "Ensure buyer takes site \"as-is\" regarding environmental.",
          "hiddenConcern": "Buyer's lender is asking for an environmental indemnity.",
          "typicalAsks": ["closing timing", "title clearance"],
          "typicalReceives": ["extension requests", "title objections"],
          "sampleInbox": "Buyer requesting 15-day extension for permit clearance.",
          "secretaryOverlay": "Hold firm on timeline; resist taking on buyer's development risk."
        },
        {
          "id": "cdc-gc",
          "title": "General Contractor",
          "companyId": "cdc-gc",
          "primaryObjective": "Finalize GMP and secure subcontractor bids.",
          "secondaryObjective": "Resolve constructability issues in civil plans.",
          "hiddenConcern": "Steel pricing is volatile and holding the GMP open.",
          "typicalAsks": ["civil plans", "permit status", "sub bids"],
          "typicalReceives": ["RFI responses", "value engineering requests"],
          "sampleInbox": "Still waiting on final steel numbers to lock GMP.",
          "secretaryOverlay": "Manage schedule and pricing expectations; flag long-lead items."
        },
        {
          "id": "cdc-lender",
          "title": "Construction Lender",
          "companyId": "cdc-lender",
          "primaryObjective": "Underwrite development risk and secure collateral.",
          "secondaryObjective": "Ensure GMP and permits are in place before funding.",
          "hiddenConcern": "Developer equity may be thin if offsite costs increase.",
          "typicalAsks": ["GMP contract", "permits", "environmental reports"],
          "typicalReceives": ["budget updates", "appraisal", "borrower financials"],
          "sampleInbox": "Need final GMP and builder's risk policy before we can fund.",
          "secretaryOverlay": "Focus on downside protection and completion guarantees."
        },
        {
          "id": "cdc-title-officer",
          "title": "Title Officer",
          "companyId": "cdc-title",
          "primaryObjective": "Issue clean title for land acquisition and loan policy.",
          "secondaryObjective": "Resolve utility easement conflict on site plan.",
          "hiddenConcern": "Proposed building footprint encroaches on an old utility easement.",
          "typicalAsks": ["ALTA survey", "easement releases"],
          "typicalReceives": ["title objections", "survey updates"],
          "sampleInbox": "Survey shows building pad encroaching on 1960 utility easement.",
          "secretaryOverlay": "Identify title defects and provide clear paths to resolution."
        },
        {
          "id": "cdc-env-consultant",
          "title": "Environmental Consultant",
          "primaryObjective": "Provide Phase I/II clearance for the site.",
          "secondaryObjective": "Address lender questions on historical use.",
          "hiddenConcern": "Soil export may require special handling.",
          "typicalAsks": ["site access", "historical records"],
          "typicalReceives": ["lender questions", "developer timelines"],
          "sampleInbox": "Lender requesting reliance letter for the Phase I ESA.",
          "secretaryOverlay": "Provide definitive scientific guidance; avoid business decisions."
        },
        {
          "id": "cdc-civil-engineer",
          "title": "Civil Engineer",
          "primaryObjective": "Design site plan, grading, and utilities to city spec.",
          "secondaryObjective": "Address city comments quickly to keep permit on track.",
          "hiddenConcern": "City's new stormwater requirement alters the grading plan.",
          "typicalAsks": ["survey", "geotech report", "city guidelines"],
          "typicalReceives": ["city comments", "GC RFIs"],
          "sampleInbox": "Working through City Round 2 comments on stormwater management.",
          "secretaryOverlay": "Solve technical problems; communicate schedule impacts clearly."
        },
        {
          "id": "cdc-counsel",
          "title": "Counsel",
          "primaryObjective": "Draft and negotiate loan documents and GMP contract.",
          "secondaryObjective": "Manage dual closing mechanics (land + loan).",
          "hiddenConcern": "Lender's completion guaranty is unusually broad.",
          "typicalAsks": ["term sheet", "PSA", "title commitment"],
          "typicalReceives": ["loan docs", "contract drafts"],
          "sampleInbox": "Reviewing lender's draft completion guaranty — it's very broad.",
          "secretaryOverlay": "Protect client from undue liability while facilitating closing."
        }
      ],
      "inbox": [
        { "id": "cdc-in-1", "toRoleId": "cdc-dev-manager", "priority": "high", "subject": "City Round 2 Comments", "summary": "Offsite frontage work and turning template revisions requested." },
        { "id": "cdc-in-2", "toRoleId": "cdc-gc-precon", "priority": "high", "subject": "Budget Update", "summary": "Steel and electrical pricing increased." },
        { "id": "cdc-in-3", "toRoleId": "cdc-surveyor", "priority": "high", "subject": "Easement Conflict", "summary": "Utility easement overlaps proposed entry drive throat." }
      ],
      "tasks": [
        { "id": "CDC-01", "title": "Update permit matrix and assign city comments", "ownerRoleId": "cdc-dev-manager", "status": "in_progress", "dependencies": [] },
        { "id": "CDC-02", "title": "Rework sources and uses for latest pricing", "ownerRoleId": "cdc-developer-finance", "status": "in_progress", "dependencies": [] },
        { "id": "CDC-03", "title": "Evaluate VE options and GMP gap", "ownerRoleId": "cdc-gc-precon", "status": "in_progress", "dependencies": [] },
        { "id": "CDC-04", "title": "Resolve easement overlap in survey/title/site plan", "ownerRoleId": "cdc-surveyor", "status": "in_progress", "dependencies": [] }
      ],
      "library": [
        { "id": "cdc-doc-1", "fileName": "CDC_Land_PSA_Executed.pdf", "category": "land_psa", "summary": "Land purchase agreement with flexibility for entitlement/lender timing." },
        { "id": "cdc-doc-2", "fileName": "CDC_ALTA_Survey_Prelim.pdf", "category": "survey", "summary": "Preliminary survey showing easement conflict." },
        { "id": "cdc-doc-3", "fileName": "CDC_PhaseI_ESA_Draft.pdf", "category": "environmental", "summary": "Phase I with note that may trigger limited follow-up." },
        { "id": "cdc-doc-4", "fileName": "CDC_OpenBook_Budget_2026-06-22.xlsx", "category": "budget", "summary": "Updated pricing with escalation." },
        { "id": "cdc-doc-5", "fileName": "CDC_BuildersRisk_IndicativeQuote.pdf", "category": "insurance", "summary": "Indicative builder’s risk quote subject to TIV and deductible review." }
      ],
      "communications": [
        "We can tolerate open permit comments if ownership, the resolution path, and budget impact are clear.",
        "Without a decision on site shift versus easement resolution, we are pricing two different layouts.",
        "Seller can close land Friday; lender cannot fund until title/endowment package is settled."
      ],
      "dinTriggers": [
        { "id": "cdc-din-1", "trigger": "open-book budget exceeds basis", "template": "DIN: GMP/open-book estimate exceeds basis. Need VE, extra equity, or scope reduction." },
        { "id": "cdc-din-2", "trigger": "material new permit comments", "template": "DIN: New municipal comments materially affect cost or schedule." },
        { "id": "cdc-din-3", "trigger": "survey/title/site plan conflict persists", "template": "DIN: Easement/site conflict prevents final layout alignment." },
        { "id": "cdc-din-4", "trigger": "consultant recommends limited Phase II", "template": "DIN: Environmental follow-up recommended. Approve or decline with rationale." }
      ],
      "eventCards": [
        { "id": "cdc-ec-1", "title": "City adds offsite turn-lane contribution", "impact": "Cost increase and permit complexity.", "affectedRoleIds": ["cdc-dev-manager", "cdc-civil", "cdc-lender-pm"] },
        { "id": "cdc-ec-2", "title": "Limited Phase II indicates localized impacted soil", "impact": "Budget, indemnity, and timing issue.", "affectedRoleIds": ["cdc-env", "cdc-lender-pm", "cdc-counsel"] },
        { "id": "cdc-ec-3", "title": "Steel reprice exceeds contingency tolerance", "impact": "Basis stress and VE requirement.", "affectedRoleIds": ["cdc-gc-precon", "cdc-developer-principal", "cdc-lender-pm"] }
      ],
      "successCriteria": [
        "Credible synchronized land and construction close path established or deal should pause.",
        "GMP gap treatment identified.",
        "Permit/easement/environmental issues mapped to owner and budget impact.",
        "Lender-ready close narrative produced."
      ],
      "timeline": [
        "Triaging land, title, survey, and environmental issues",
        "Refreshing budget and permit matrix",
        "Negotiating legal/insurance/lender conditions",
        "Synchronizing land and construction close",
        "Preparing draw-admin kickoff"
      ],
      "endOfDaySummaryFields": [
        "gmp_gap",
        "permit_comments_outstanding",
        "environmental_recommendation",
        "dual_close_readiness",
        "builders_risk_compliance"
      ]
    }
  ]
};

export const SCENARIOS: ScenarioPack[] = BIBLE_DATA.scenarios as ScenarioPack[];
