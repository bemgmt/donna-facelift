import type { ScenarioPack, TaskItem } from './types'

export type DriveTaskStatus = 'pending' | 'waiting' | 'in_progress' | 'blocked' | 'completed'
export type DriveTaskAction = 'start' | 'block' | 'complete' | 'reopen'

export interface DriveTaskDefinition {
  scenarioTaskId: string
  description: string
  instructions: string[]
  requiredInputs: string[]
  completionCriteria: string[]
  evidenceRequirements: string[]
  actionModule: 'room' | 'din' | 'calendar' | 'secretary'
  actionLabel: string
}

export interface DriveTaskRecord {
  id: string
  org_id: string
  scenario_task_id: string | null
  assigned_to: string
  title: string
  description: string | null
  status: DriveTaskStatus
  priority: string
  due_date: string | null
  dependency_task_ids: string[]
  instructions: string[]
  required_inputs: string[]
  completion_criteria: string[]
  evidence_requirements: string[]
  action_config: { module?: DriveTaskDefinition['actionModule']; label?: string }
  started_at: string | null
  completed_at: string | null
  blocked_reason: string | null
  version: number
  updated_at: string
  can_act?: boolean
  dependencies_complete?: boolean
}

export const VERNON_TASK_DEFINITIONS: Record<string, DriveTaskDefinition> = {
  'VCC-01': {
    scenarioTaskId: 'VCC-01',
    description: 'Review the revised title commitment and identify exceptions that could affect ownership, access, financing, or closing.',
    instructions: [
      'Open VCC_Title_Commitment_Rev2.pdf in the Transaction Room.',
      'Review the utility easement, reciprocal access agreement, and open deed of trust.',
      'Record the exceptions that require objection, cure, or further review.',
      'Submit a concise objection summary and mark the review complete.',
    ],
    requiredInputs: ['VCC_Title_Commitment_Rev2.pdf', 'Executed purchase and sale agreement'],
    completionCriteria: ['Each material exception is addressed', 'Objection summary identifies the requested next action'],
    evidenceRequirements: ['Title objection summary'],
    actionModule: 'room',
    actionLabel: 'Open title commitment',
  },
  'VCC-02': {
    scenarioTaskId: 'VCC-02',
    description: 'Complete survey field work after counsel identifies the title exceptions that must be plotted or confirmed.',
    instructions: ['Wait for VCC-01 to be completed.', 'Review the title objection summary.', 'Confirm field work and note any access or boundary conflict.', 'Submit the survey status summary.'],
    requiredInputs: ['Completed VCC-01 title review', 'Title commitment and site access'],
    completionCriteria: ['Field work status is confirmed', 'Any title or access conflict is documented'],
    evidenceRequirements: ['Survey field-work summary'],
    actionModule: 'room',
    actionLabel: 'Open survey package',
  },
  'VCC-03': {
    scenarioTaskId: 'VCC-03',
    description: 'Provide the environmental professional with the buyer-side information required to complete the Phase I ESA.',
    instructions: ['Review the Phase I user questionnaire prompts.', 'Confirm environmental liens, specialized knowledge, purchase price context, and intended use.', 'Record any unknown answer that needs escalation.', 'Submit the completed questionnaire summary.'],
    requiredInputs: ['Buyer environmental knowledge', 'Purchase and intended-use information'],
    completionCriteria: ['All user-questionnaire topics are addressed', 'Unknowns and follow-ups are explicitly listed'],
    evidenceRequirements: ['Phase I questionnaire response summary'],
    actionModule: 'secretary',
    actionLabel: 'Draft questionnaire response',
  },
  'VCC-04': {
    scenarioTaskId: 'VCC-04',
    description: 'Coordinate and track estoppel certificates for the property’s largest tenants.',
    instructions: ['Identify the top tenants from the rent roll.', 'Send or confirm estoppel requests through DIN.', 'Record the received, outstanding, and disputed certificates.', 'Submit an estoppel status summary.'],
    requiredInputs: ['Current rent roll', 'Tenant contacts', 'PSA estoppel requirements'],
    completionCriteria: ['Top tenants are identified', 'Each required estoppel has a documented status'],
    evidenceRequirements: ['Tenant estoppel status summary'],
    actionModule: 'din',
    actionLabel: 'Coordinate with DIN',
  },
  'VCC-05': {
    scenarioTaskId: 'VCC-05',
    description: 'Deliver the current operating package the lender needs to complete underwriting.',
    instructions: ['Open the T-12/YTD operating statement and current rent roll.', 'Confirm the AR aging is current and reconciles to the rent roll.', 'Identify any missing or inconsistent schedule.', 'Record what was delivered and any follow-up requested by the lender.'],
    requiredInputs: ['T-12 operating statement', 'YTD operating statement', 'AR aging', 'Current rent roll'],
    completionCriteria: ['All requested schedules are accounted for', 'Delivery and follow-up status are documented'],
    evidenceRequirements: ['Lender delivery confirmation'],
    actionModule: 'room',
    actionLabel: 'Review lender package',
  },
}

export function enrichScenarioTask(task: TaskItem, index: number, orgId: string) {
  const definition = VERNON_TASK_DEFINITIONS[task.id]
  const dependencies = task.dependencies.map((dependency) => `${orgId}-t-${indexForTaskId(dependency)}`)
  return {
    scenario_task_id: task.id,
    description: definition?.description || task.title,
    instructions: definition?.instructions || [],
    required_inputs: definition?.requiredInputs || [],
    completion_criteria: definition?.completionCriteria || [],
    evidence_requirements: definition?.evidenceRequirements || [],
    action_config: definition ? { module: definition.actionModule, label: definition.actionLabel } : {},
    dependency_task_ids: dependencies,
  }
}

function indexForTaskId(taskId: string) {
  const match = taskId.match(/-(\d+)$/)
  return match ? Math.max(0, Number(match[1]) - 1) : 0
}

export function taskDefinitionForScenario(scenario: ScenarioPack, taskId: string) {
  return scenario.tasks.find((task) => task.id === taskId)
}
