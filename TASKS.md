# ING-Plan - Task List

> Extracted from: **Kickoff-Vorbereitung: KI-Projekt-Plattform ING-Plan**
> Date: 22.02.2026 | Kickoff: 27.02.2026

---

## 1. Data Import & Integration

### 1.1 Import existing Excel project list
- **Priority:** High
- **Description:** Import the comprehensive Excel spreadsheet containing all active projects with fields: Sachbearbeiter, Leistung, Projektnummer, etc. This list already resembles the initial UI mockups and should serve as the primary data source for the platform.
- **Notes:** ~150-160 active projects currently exist.

### 1.2 Obtain 2-3 sample projects
- **Priority:** High
- **Description:** Request and receive 2-3 complete sample projects from ING-Plan for development and testing purposes.
- **Notes:** Project content is secondary; focus is on project management and controlling structure.

### 1.3 Define supported document types
- **Priority:** Medium
- **Description:** Ensure the platform can reference/handle the following document types that exist per project:
  - Plans: PDF, DWG
  - Applications, reports, construction descriptions: Word, PDF
  - Calculations: Excel, Word
  - Schedules: PDF, MS Project
  - LV (Leistungsverzeichnis): two formats (TBD)
  - Archived emails
  - Photos
  - External documents from clients/third parties (same formats as above)
  - Protocols: Word, PDFx

---

## 2. Project Data Model

### 2.1 Implement core project fields
- **Priority:** High
- **Description:** Each project must contain the following fields:
  | Field | Description |
  |-------|-------------|
  | Auftraggeber | Client/commissioning party |
  | Projektnummer | Project number |
  | Leistung | Service/scope of work |
  | Beauftragtes Honorar | Commissioned fee/budget |
  | Beauftragte Leistungen | Commissioned services |
  | Fristen | Deadlines |
  | Projektleiter | Project lead |
  | Projektbearbeiter / Team | Project team members |
  | Geplante Laufzeit / Aufwand | Planned duration/effort (set by management) |
  | Projektstatus in % | Project completion percentage |
  | Rechnungsstände | Invoice status - last invoice date |

### 2.2 Implement new order/assignment workflow
- **Priority:** Medium
- **Description:** New orders (Auftraege) with the core data fields listed above should be creatable within the tool and distributable/assignable to team members.

---

## 3. Reminder & Notification System

### 3.1 Invoice reminders
- **Priority:** High
- **Description:** Implement a reminder system for invoicing (Rechnungslegung). Goal: ensure continuous and timely invoice creation and follow-up tracking.

### 3.2 Deadline reminders
- **Priority:** High
- **Description:** Implement a reminder system for project deadlines (Fristen). Goal: early project coordination with deadline awareness to avoid last-minute stress submissions ("Stressabgabe").

---

## 4. Controlling & KPIs

### 4.1 Continuous invoicing tracking
- **Priority:** High
- **Description:** Provide visibility into invoicing status across projects - enabling continuous invoice creation and follow-up on outstanding invoices (Rechnungsnachverfolgung).

### 4.2 Deadline/schedule monitoring
- **Priority:** High
- **Description:** Track and visualize project deadlines to enable early coordination and proactive project management. Flag projects at risk of deadline overruns.

---

## 5. Working Mode & Architecture

### 5.1 Coexistence with network drives
- **Priority:** High
- **Description:** The platform must operate alongside the existing workflow where documents are stored on a physical network server via network drives. The platform does NOT replace the file server.
- **Decision needed:** Whether data synchronization between the platform and file server should be manual or automated (currently unanswered).

---

## 6. Core Platform Functions

### 6.1 Dashboard
- **Priority:** High
- **Description:** Central dashboard providing an overview of all projects with key metrics, statuses, and alerts.

### 6.2 Project management view
- **Priority:** High
- **Description:** Detailed project views for managing individual projects including all core fields, team assignments, timelines, and status tracking.

### 6.3 Project controlling view
- **Priority:** High
- **Description:** Controlling-focused views for budget tracking (Honorar Soll/Ist), invoice management, and effort/duration analysis.

---

## Open Questions

| # | Question | Status |
|---|----------|--------|
| 1 | How many documents does a typical project have? | **Unanswered** - "Kann nicht geschaetzt werden. Von bis..." (varies widely) |
| 2 | Should data transfer between platform and file server be manual or automated? | **Unanswered** |
| 3 | What are the two LV (Leistungsverzeichnis) formats? | **To clarify** |
