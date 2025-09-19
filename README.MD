# Data Ravens — “AI Teammate” Demo Prototype (CONTEXT.md)

**Mission**  
Build a **high-fidelity, frontend-only** prototype that proves the shift from a passive PMS to an **AI-native teammate**. The demo must showcase:  
- **Ask → Plan Preview → Execute → Global Audit/Undo**  
- **Autopilot** (Manual / Ask to run / Scheduled)  
- **Actionable KPI Cards** (insights that trigger plans)

**Constraint**: No real backend/integrations. Everything is deterministic, seeded, and demo-safe.

---

## 0) Scope & Non-Goals

**In scope**
- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui + Zustand (in-memory)
- Pages: **Control Room**, **Calendar**, **Patients**, **Billing**, **Insights**, plus **Patient Record** tabs
- **Unified Action Engine**: all state changes go through **Plan Preview → Execute → Global Event Timeline** with **step-level Undo** + **Undo All**
- **Command Bar (⌘K)**, **Event Timeline**, **Autopilot**, **Role Presets**, **Demo Mode** (ribbon/reset)
- **Minimal Billing table** (ID, Patient, Status, Amount; optional Due Date & Payer/Insurer)
- **Actionable KPI Cards** (≥5 tiles wired to open a Plan)
- **Five scripted Golden Flows** (below)

**Out of scope (do NOT add)**
- Auth, multi-user, real APIs/integrations, full billing/claims logic, free-form NLP, report builder, redesign of the entire UI theme

---

## 1) Information Architecture

**Sidebar**: Control Room · Calendar · Patients · Billing · Insights

**Patient Record tabs**: Details · Appointments · Clinical Notes · Documents · Billing

**Unified Action Engine (hard rule)**  
Any state change—via **typed command**, **drag-drop**, or **KPI action**—**must** route through the same **Plan Preview → Execute → Event Timeline** pipeline.

---

## 2) Core Components (must be implemented)

### 2.1 Command Bar (⌘K)
- Recognizes **scripted phrases**; unknown inputs show a hint + example phrases
- Opens **Plan Preview Drawer** with steps

### 2.2 Plan Preview Drawer
- Shows **Title**, **Checklist of steps**, **Affected records**, small **ETA**, optional **Risks**
- Buttons: **Execute**, **Cancel**

### 2.3 Global Event Timeline (slide-out)
- Each **Plan** renders a **master card**; nested **steps**
- Each **step** shows: action, **actor** (`user`/`autopilot`/`system`), **source** (`cmdk`/`drag`/`kpi`), timestamp
- Controls: **Undo** (per step), **Undo All** (plan level, LIFO). Optional **Redo** for last undone step
- Autopilot events show a small `AUTOPILOT` badge

### 2.4 Autopilot Modes
Header pill: **Manual** (only ⌘K) · **Ask to run** (auto-open Plan on triggers) · **Scheduled** (runs silently; logs to Timeline)

### 2.5 Role Presets
Header switch: **Reception / Clinician / Manager** → alters tiles & quick actions on Control Room/Insights

### 2.6 Demo Mode
Top ribbon + locked seeds + “Reset demo” command. Prevents unscripted mutations.

---

## 3) Golden Path Flows (acceptance criteria)

1) **Clinician wrap-up (multi-step)**  
   Phrase: _“Finalise note for Mrs Smith, draft referral to Dr Jones, send prescription, and task reception for 6-week review.”_  
   **DoD**: Plan with 4 steps; execute streams ≤2s apart; referral appears in Documents; task appears in Control Room; **step-Undo** removes only its artifact; **Undo All** reverts all steps and state.

2) **Proactive manager (Ask → Answer → Action)**  
   Trigger: **Insights** → KPI **Claims aging (>60d)** → **Act on this: Prepare chase batch**  
   **DoD**: Answer card (“>60d: 9 claims”) + action opens Plan (compile, draft emails, attach PDFs, queue follow-ups); creates visible **Batch #** object; **Undo** removes batch & messages.

3) **Zero-touch onboarding (Autopilot)**  
   Trigger: Autopilot **Scheduled**; create a **new patient appointment** for tomorrow  
   **DoD**: After delay: events `intake.sent`, `insurance.verified`, `docs.filed`; patient record updated; each step undoable.

4) **Unified reschedule (UI & AI parity)**  
   Trigger: drag-drop an appointment **or** issue a command; both route to the **same plan**  
   **DoD**: Mini Plan Preview offers optional **SMS** and **insurer re-check**; calendar updates after Execute; **Undo All** restores slot, cancels SMS, resets insurer check.

5) **Graceful failure (trust & safety)**  
   Phrase: _“Verify coverage for today’s 3 private appointments.”_ (one is scripted to fail)  
   **DoD**: Timeline shows **2 success, 1 failed (portal unresponsive)**; **Retry failed** only re-runs the failed step; **Undo All** returns to pre-plan state.

---

## 4) Gold Standard "Do" Commands

The AI Command system recognizes these natural language commands and converts them into structured plans:

### 4.1 Low-Friction (In-PMS) Commands
*Simple tasks that operate entirely within the PMS data*

**Task Management**
- `create task: Follow up with Sarah about test results`
- `add clinical note for Mrs Smith using diabetes template`
- `mark John as DNA and charge £50`

**Scheduling & Notifications**
- `reschedule Sarah to Thursday 2:30 and notify`
- `send appointment reminder to all patients for tomorrow`
- `block out Dr Patel's calendar for next Friday afternoon`

**Documentation**
- `attach referral PDF for Mrs Smith to cardiology`
- `finalise consultation notes for today's patients`
- `create discharge summary for patient ID 12345`

### 4.2 Medium/Multi-Step (Orchestration) Commands
*Complex workflows that coordinate multiple PMS functions*

**Clinical Workflows**
- `finalise note for Mrs Smith, draft referral to Dr Jones, send prescription, and task reception for 6-week review`
- `clinical wrap-up for Mrs Smith`
- `complete post-consultation workflow for all today's patients`

**Administrative Batches**
- `prepare daily clinic pack for tomorrow's appointments`
- `batch SMS confirmations for Thursday's appointments`
- `generate and distribute weekly schedule for all practitioners`

**Billing & Insurance**
- `verify insurance eligibility for tomorrow's private appointments`
- `prepare chase batch for overdue invoices`
- `sync today's invoices to Xero and update payment status`

### 4.3 High-Friction/Outside-PMS Commands
*Tasks requiring external integrations or complex multi-system coordination*

**Payment Processing**
- `send payment link to Amelia Ali for outstanding balance`
- `set up payment plan for patient: £72.50 now, £72.50 next month`
- `process refund for cancelled appointment - patient ID 456`

**External Communications**
- `request consent e-signature from new patients for data processing`
- `send prescription electronically to Boots Pharmacy for Mrs Smith`
- `email treatment plan summary to patient's GP`

**Regulatory & Compliance**
- `generate GDPR data export for patient John Smith`
- `schedule mandatory staff training reminders for next quarter`
- `audit patient consent forms and flag any missing signatures`

**Advanced Analytics**
- `analyze appointment no-show patterns and suggest optimization`
- `generate practitioner utilization report for last 3 months`
- `identify patients due for routine health screenings`

### 4.4 Specialized Role Commands

**Reception-Specific**
- `check room availability for emergency appointment at 3pm`
- `update patient contact details from recent calls`
- `prepare welcome pack for new patient orientation`

**Clinician-Specific**
- `review lab results and flag any critical values`
- `update treatment protocols based on latest guidelines`
- `schedule follow-up care coordination meeting`

**Manager-Specific**
- `analyze revenue trends and identify growth opportunities`
- `review staff performance metrics for quarterly reviews`
- `optimize appointment scheduling to reduce wait times`

---

## 5) Golden Standard Demo Examples

These are the **best examples** for live demonstrations, guaranteed to work flawlessly and showcase the AI capabilities effectively:

### 5.1 "DO" Commands - Best for Demos

**🎯 Multi-Step Clinical Workflow (Flagship Demo)**
```
"finalise note for Mrs Smith, draft referral to Dr Jones, send prescription, and task reception for 6-week review"
```
*Shows: Complex orchestration, multiple steps, realistic clinical workflow*

**📋 Task Creation (Simple & Visual)**
```
"create task: Follow up with Sarah about test results"
```
*Shows: Instant task creation, simple AI understanding*

**📅 Smart Scheduling (Popular Use Case)**
```
"reschedule Sarah to Thursday 2:30 and notify"
```
*Shows: Natural language scheduling, patient matching, notifications*

**💰 Financial Operations (Manager-Focused)**
```
"prepare chase batch for overdue invoices"
```
*Shows: Bulk operations, financial intelligence, automation*

**🏥 Clinical Wrap-up (Clinician Role)**
```
"clinical wrap-up for Mrs Smith"
```
*Shows: Role-based commands, medical workflow automation*

### 5.2 "ASK" Commands - Best for Demos

**📊 Visual Revenue Analysis (Executive Appeal)**
```
"What's our monthly revenue trend?"
```
*Shows: Beautiful bar chart, financial insights, trend analysis*

**👥 Patient Demographics (Visual Impact)**
```
"Show me patient age distribution"
```
*Shows: Colorful doughnut chart, demographic breakdown, percentages*

**🏆 Performance Rankings (Data-Driven)**
```
"Which practitioners are top performers?"
```
*Shows: Professional table, rankings, multiple metrics*

**⚠️ Outstanding Issues (Actionable Insights)**
```
"Show me outstanding invoices over 30 days"
```
*Shows: Detailed table, aging analysis, actionable data*

**📈 Key Metrics Dashboard (Executive Summary)**
```
"Show me key performance metrics"
```
*Shows: Beautiful metric cards, trends, KPI overview*

**🧠 AI Insights (Intelligence Demo)**
```
"What trends do you see in our practice data?"
```
*Shows: AI-generated insights, pattern recognition, recommendations*

### 5.3 Demo Flow Recommendations

**🎬 5-Minute Demo Script:**
1. **Start with ASK**: `"What's our monthly revenue trend?"` (Visual impact)
2. **Show DO power**: `"clinical wrap-up for Mrs Smith"` (Multi-step complexity)
3. **Demonstrate intelligence**: `"What trends do you see in our data?"` (AI insights)
4. **End with automation**: `"prepare chase batch for overdue invoices"` (Business value)

**👥 Role-Based Demos:**

**Reception Role:**
- ASK: `"Show me today's appointment schedule"`
- DO: `"reschedule Sarah to Thursday 2:30 and notify"`

**Clinician Role:**
- ASK: `"Which patients need follow-up appointments?"`
- DO: `"clinical wrap-up for Mrs Smith"`

**Manager Role:**
- ASK: `"Show me key performance metrics"`
- DO: `"prepare chase batch for overdue invoices"`

### 5.4 Demo Tips

**✅ Always Work Examples:**
- All commands listed above are **guaranteed functional**
- Use exact phrasing for consistent results
- Patient names (Mrs Smith, Sarah, Amelia) are in demo data

**🎯 Visual Impact:**
- ASK commands generate rich visualizations
- DO commands show immediate Plan Preview → Execute → Timeline
- Both demonstrate AI understanding and confidence levels

**⏱️ Timing:**
- ASK responses: ~2-3 seconds
- DO plan creation: ~1-2 seconds  
- Plan execution: ~3-5 seconds with visual streaming

**🎨 Visual Highlights:**
- Cyan glow on AI inputs shows "magic"
- Plan Preview shows transparency before action
- AI Action Trail provides audit and undo capability
- Charts and tables demonstrate business intelligence

---

## 6) Actionable KPI Cards

**Component contract**
```ts
type KpiAction = { label: string; planFactory: () => Plan };
type KpiCardProps = {
  title: string;
  value: string | number;
  asOf: string;
  delta?: string;
  status?: "ok" | "warn" | "alert";
  sparkline?: number[];
  explain?: string;       // tooltip text e.g., "Demo seed; last 30d"
  actions: KpiAction[];
};
