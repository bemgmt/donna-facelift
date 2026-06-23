

\# Donna Drive Updates — Implementation Plan for Antigravity / Gemini 3.1 Pro High

\#\# Goal

Update only the Donna Drive experience so the event flow supports scenario selection, role-based tasks, Donna Secretary guidance, DIN role-matching, session logging, and post-event summary email generation.

Do not refactor unrelated app areas unless required to connect Donna Drive functionality.

\---

\#\# 1\. Core User Flow

\#\#\# Facilitator Flow

1\. Facilitator enters Donna Drive admin/facilitator interface.  
2\. Facilitator selects one of the existing 5 Donna Drive scenarios.  
3\. Selected scenario determines:  
   \- Available roles  
   \- Participant assignments  
   \- Tasks/actions per role  
   \- Donna Secretary starting context  
   \- DIN matching rules  
   \- End-of-event summary variables

\#\#\# Participant Flow

1\. Participant registers or logs in.  
2\. Participant joins the active Donna Drive event.  
3\. Participant is assigned or confirms their role.  
4\. When the session begins, the Donna Drive interface opens.  
5\. Only these tabs should be available at start:  
   \- Secretary  
   \- DIN  
6\. Show a simple start message:  
   \- “Donna Drive is ready. Begin when you’re ready.”  
7\. Secretary tab opens with Donna preloaded and ready to guide the participant.  
8\. Participant can ask Donna what to do next, check leads, assign tasks, request actions, or ask what Donna can do.  
9\. DIN tab allows participants to ping or match with other event participants based on role-specific needs.  
10\. At the end of the event, participant receives a session wrap-up.  
11\. Participant has the option to email themselves the breakdown.  
12\. Email includes:  
   \- What they accomplished  
   \- Key interactions  
   \- Tasks completed  
   \- Tasks assigned  
   \- DIN matches/connections  
   \- Suggested next steps  
   \- Link to Donna purchase/landing page

\---

\#\# 2\. Scenario Data Structure

Create or update Donna Drive scenario schema so each scenario can be loaded from structured MD/JSON-compatible data.

Each scenario should support:

\`\`\`ts  
Scenario {  
  id: string  
  title: string  
  description: string  
  roles: Role\[\]  
  startingPrompt: string  
  secretaryInstructions: string  
  dinRules: DinRule\[\]  
  summaryTemplate: SummaryTemplate  
}

Each role should support:

Role {  
  id: string  
  name: string  
  description: string  
  objectives: string\[\]  
  tasks: Task\[\]  
  allowedActions: string\[\]  
}

Each task should support:

Task {  
  id: string  
  title: string  
  description: string  
  status: "not\_started" | "in\_progress" | "completed" | "blocked"  
  assignedToRole: string  
  suggestedDonnaAction?: string  
  dependsOn?: string\[\]  
}

DIN rules should support:

DinRule {  
  id: string  
  trigger: string  
  requestingRole: string  
  targetRole: string  
  messageTemplate: string  
  matchType: "role" | "task" | "lead" | "bid" | "custom"  
}

---

## **3\. Secretary Tab Updates**

The Secretary tab must become the main Donna Drive brain.

Required behavior:

1. Load selected scenario context.  
2. Load participant role context.  
3. Load role-specific tasks and allowed actions.  
4. Start with a preloaded Donna prompt such as:

Hi, I’m Donna. I’m here to help you complete your Donna Drive role today. You can ask me what to work on first, check your leads, assign a task, contact another role through DIN, or ask what actions I can help with.

5. Donna should understand commands like:

Check my leads.  
What tasks do I have?  
What should I do first?  
Who do I need to contact?  
Assign this task.  
Put out a bid on the DIN.  
What can you do?  
Summarize my progress.

6. Donna should respond with prioritized next steps.  
7. Donna should log all meaningful actions to the participant session log.

---

## **4\. Leads / Task Recommendation Logic**

Add mock or scenario-seeded lead/task data.

When participant asks Donna to check leads:

1. Fetch leads connected to the scenario and role.  
2. Return a short prioritized list.  
3. Include urgency.  
4. Recommend action order.

Example response:

You have 3 new leads.

1\. Maria Gonzalez — urgent. She is ready for follow-up and should be contacted first.  
2\. Johnson Property Group — medium priority. They may need a bid.  
3\. East Valley Office Park — lower priority. Good candidate for later outreach.

I recommend starting with Maria Gonzalez, then preparing the bid request for Johnson Property Group.

---

## **5\. DIN Tab Updates**

DIN should allow role-based participant matching.

Required behavior:

1. Show available participants in the same Donna Drive event.  
2. Filter or match by role.  
3. Allow Donna/participant to ping another participant.  
4. Support messages like:  
   * Lead referral  
   * Bid request  
   * Task handoff  
   * Role-specific collaboration  
5. Log all DIN interactions.

Example:

Donna found a matching participant with the Contractor role. Would you like to send them the bid request?

---

## **6\. Session Logging**

Create a Donna Drive session log.

Log:

* Scenario selected  
* Participant  
* Role  
* Secretary messages  
* Donna recommendations  
* Leads reviewed  
* Tasks started  
* Tasks completed  
* Tasks assigned  
* DIN pings  
* DIN matches  
* Final summary

Suggested structure:

DonnaDriveSessionLog {  
  sessionId: string  
  eventId: string  
  scenarioId: string  
  userId: string  
  roleId: string  
  startedAt: Date  
  endedAt?: Date  
  interactions: InteractionLog\[\]  
  completedTasks: Task\[\]  
  assignedTasks: Task\[\]  
  dinMatches: DinInteraction\[\]  
}

---

## **7\. End-of-Event Closeout**

When facilitator ends the event or participant exits:

1. Show thank-you message.  
2. Generate participant summary.  
3. Ask if they want the summary emailed.  
4. Provide button:  
   * “Email My Donna Drive Summary”  
5. Generate email using session log variables.  
6. Include CTA link to Donna page.

Example closeout message:

Thanks for participating in Donna Drive. Donna has prepared a summary of what you worked on today, what you completed, who you connected with, and suggested next steps.

---

## **8\. Email Summary Template**

Create reusable email template.

Subject:

Your Donna Drive Session Summary

Body:

Hi {{participantName}},

Thanks for participating in today’s Donna Drive event.

Here’s what you accomplished:

Scenario:  
{{scenarioTitle}}

Your Role:  
{{roleName}}

Completed Tasks:  
{{completedTasks}}

Key Donna Recommendations:  
{{donnaRecommendations}}

DIN Connections:  
{{dinMatches}}

Suggested Next Steps:  
{{nextSteps}}

Want Donna working inside your business every day?  
Learn more here:  
{{donnaPurchaseLink}}

– Donna  
Digital Operations Neural Network Assistant

---

## **9\. Required Implementation Tasks**

### **Backend**

* Add scenario loader for Donna Drive.  
* Add role/task schema.  
* Add selected scenario state.  
* Add participant role state.  
* Add session logging.  
* Add DIN matching endpoint/service.  
* Add email summary generation.  
* Add email sending endpoint/service.  
* Add CTA link variable.

### **Frontend**

* Update facilitator interface with scenario selector.  
* Update Donna Drive participant start screen.  
* Restrict initial tabs to Secretary and DIN.  
* Preload Secretary prompt.  
* Add task/lead display responses.  
* Add DIN ping/match UI.  
* Add end-session summary screen.  
* Add “Email My Summary” button.

### **AI / Donna Logic**

* Add system prompt for Donna Drive Secretary.  
* Inject selected scenario context.  
* Inject participant role context.  
* Inject available tasks/actions.  
* Ensure Donna gives actionable, role-specific guidance.  
* Ensure Donna logs important decisions/actions.  
* Ensure Donna can suggest DIN matches.

---

## **10\. Donna Drive Secretary System Prompt**

Use this as the base system prompt for the Donna Drive Secretary:

You are Donna, the Digital Operations Neural Network Assistant, operating inside a Donna Drive event.

Your job is to guide the participant through their assigned role in the selected scenario.

You must:  
\- Understand the participant’s role  
\- Review their assigned tasks  
\- Recommend what they should do next  
\- Help prioritize leads and actions  
\- Suggest when to use DIN to contact another role  
\- Track completed tasks  
\- Keep responses practical and action-oriented  
\- Avoid generic answers  
\- Stay within the selected Donna Drive scenario  
\- Log meaningful actions for the final event summary

When the participant asks what to do, give a clear next step.  
When the participant asks about leads, return prioritized leads.  
When the participant needs another role, suggest a DIN match.  
When a task is completed, mark it complete.  
When the session ends, prepare a clean summary of what happened.

---

## **11\. Acceptance Criteria**

The Donna Drive update is complete when:

* Facilitator can select one of 5 scenarios.  
* Participant can log in/register and join Donna Drive.  
* Participant starts with only Secretary and DIN available.  
* Secretary loads scenario and role-specific context.  
* Donna can recommend tasks and next actions.  
* Donna can respond to lead-checking requests.  
* DIN can match/ping other participants by role.  
* Session activity is logged.  
* End-of-event summary is generated.  
* Participant can email themselves the summary.  
* Email includes Donna purchase/landing page link.  
* No unrelated app areas are changed.

---

## **12\. Important Constraint**

Only implement Donna Drive updates. Do not redesign the broader DONNA platform, unrelated dashboards, unrelated auth flows, or unrelated tabs unless required for Donna Drive to function.

