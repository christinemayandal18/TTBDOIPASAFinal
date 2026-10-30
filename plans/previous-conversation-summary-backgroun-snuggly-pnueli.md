# IPASA — Structured Design Brief: IP Progress Tracking System

> **Context:** The inventor-facing "My Projects" page and any case-handler detail view need a progress tracking UI that spans two distinct phases: (1) the internal Pre-Protection workflow handled entirely inside UPLB TTBDO, and (2) the IPOPHL Prosecution workflow that begins after official filing. This brief maps the information architecture, state system, component requirements, and data-visualization strategy needed before any visuals are built.

---

## 1. System Architecture: Two-Phase Model

The entire lifecycle is best understood as **two sequential mega-phases**, each with its own progress bar instance.

```
PHASE 1 — Pre-Protection (Internal / TTBDO-controlled)
└─ Managed by Ipasa; case handlers drive state changes

PHASE 2 — Prosecution (External / IPOPHL-controlled)
└─ Ipasa tracks milestones; updates are logged by case handlers
   after receiving IPOPHL correspondence
```

The handoff trigger between phases is the "Filed" state in Phase 1 — specifically when IPOPHL assigns a filing date (step 2 of every prosecution process: "Acknowledgement and Accordance of Filing Date").

---

## 2. Stage Maps by IP Type

### 2A. Pre-Protection Stages (Phase 1)

| # | Patent / Utility Model | Copyright | Trademark |
|---|------------------------|-----------|-----------|
| 1 | Submitted | Submitted | Submitted |
| 2 | Case Handler Assigned | Case Handler Assigned | Case Handler Assigned |
| 3 | Prior Art Search Done | Endorsed to OC | Endorsed to OC |
| 4 | Draft Done | Filed | Filed |
| 5 | Endorsed to OC | — | — |
| 6 | Filed | — | — |

**Key asymmetry:** Patent/UM has 6 stages including Prior Art Search and Drafting. Copyright and Trademark skip those and go directly to OC endorsement — 4 stages only.

### 2B. Prosecution Stages (Phase 2, post-filing at IPOPHL)

| # | Patent Prosecution | Patent→UtilModel | Utility Model | Trademark | Copyright |
|---|---|---|---|---|---|
| 1 | Filing of Application | Filing of Application | Filing of Application | Filing of Application | Filing of Application |
| 2 | Filing Date Accorded | Filing Date Accorded | Filing Date Accorded | Filing Date Accorded | Claim Stub Issued |
| 3 | Formality Exam | Formality Exam | Formality Exam | Registrability Report | Issuance of Certificate |
| 4 | Subseq. Formality* | Subseq. Formality* | Subseq. Formality* | Subsequent Action* | — |
| 5 | First Publication | First Publication | Notice of Publication | Notice of Allowance | — |
| 6 | Request Substantive Exam | Request Substantive Exam | Issuance of Certificate | Issuance of Certificate | — |
| 7 | Substantive Exam Report | Substantive Exam Report | — | — | — |
| 8 | Subseq. Substantive* | Subseq. Substantive* | — | — | — |
| 9 | Notice of Allowance | Notice of Final Refusal | — | — | — |
| 10 | Final Requirements | Request to Convert to UM | — | — | — |
| 11 | Second Publication | Order to Grant Request | — | — | — |
| 12 | Issuance of Patent Cert. | Formality Exam Report | — | — | — |
| 13 | Payment of Annuities | Subseq. Formality* | — | — | — |
| 14 | — | Notice of Publication | — | — | — |
| 15 | — | Issuance of Certificate | — | — | — |

*Steps marked with `*` are conditional/optional.

**Complexity note:** Patent prosecution has 13 steps (longest), Patent→UtilModel conversion has 15 steps (branching path), Utility Model has 6, Trademark has 6, Copyright has 3.

---

## 3. Progress Bar States

Three visual states, consistent across both phases:

| State Label | Visual Treatment | Source Label (Phase 1) |
|---|---|---|
| **Accomplished** | Filled salmon-pink circle + solid connecting line | "Submitted," "Case Handler Assigned," "Prior Art Search Done," etc. |
| **Ongoing** | Pulsing/outlined salmon-pink circle + dashed line | "Under evaluation," "For drafting," "Under review" |
| **For Assignment / Pending** | Empty gray circle + gray line | "For assignment," "Incomplete," "For Endorsement," "For filing" |
| **Blocked / Returned** | Red-outlined circle | "For filing" when documents returned by OC |

**Important nuance:** "For filing" in Phase 1 carries a negative connotation — it means OC returned the documents, not that they are ready to file. This state needs a visually distinct treatment (e.g., amber/warning color) to signal a setback, not progress.

---

## 4. User Flow (Inventor Perspective)

```
/inventor/projects
  └─ Project Card (IP Type badge, title, current phase label)
       └─ Click → Project Detail Page
            ├─ Phase 1 Progress Bar (Pre-Protection)
            │    └─ Active step highlighted; negative states show reason tooltip
            └─ [Phase 2 unlocks after "Filed" is confirmed]
                 └─ Phase 2 Progress Bar (IPOPHL Prosecution)
                      └─ Step nodes are clickable → shows date logged + notes
```

**Inventor sees:** read-only progress, dates per milestone, current status label (positive or negative), and the assigned case handler's name.

**Case Handler sees (admin view):** same progress bar, but with editable milestone dates and the ability to advance or regress stages.

---

## 5. Component Requirements

### 5.1 Progress Stepper (Primary)
- **Horizontal** for Phase 1 (≤6 steps, fits without scroll)
- **Vertical accordion** for Phase 2 prosecution (up to 15 steps — horizontal would be unreadable)
- Each node: icon (check / spinner / circle) + label + optional date beneath
- Connecting lines between nodes reflect completion state
- Optional conditional steps (e.g., "Subsequent Formality Exam") rendered as indented sub-nodes, collapsed by default, expandable on click

### 5.2 Phase Toggle / Tab Bar
- Two tabs: **"Pre-Protection"** and **"IPOPHL Prosecution"**
- Prosecution tab is disabled (gray) until Phase 1 reaches "Filed"
- Active tab shows which phase is currently in progress

### 5.3 IP Type Badge
- Small pill badge (Patent | Utility Model | Trademark | Copyright) on each project card and at the top of the detail page
- Drives which step map renders — never show Patent steps for a Copyright case

### 5.4 Status Chip (per step)
- Accomplished: salmon-pink filled, white text — "Done"
- Ongoing: salmon-pink outline, salmon-pink text — "In Progress"
- Pending: gray outline, gray text — "Pending"
- Blocked: amber outline, amber text — "Returned" (with tooltip explaining OC return)

### 5.5 Milestone Date Log
- Each completed step shows: "Completed on [date]" in small gray text below the label
- Ongoing step shows: "Started [date]" or "Expected by [date]" if set

### 5.6 Case Handler Attribution Card
- Small callout below Phase 1 bar: avatar initials + "Handled by [Name]" + contact info
- Appears once case handler is assigned (step 2)

### 5.7 Notification Badge
- On the project list card: a small amber dot if the current status is a negative state (e.g., "Returned by OC," "Incomplete")
- Signals inventor that action or attention may be needed

---

## 6. Data Visualization Strategy

### Problem: Phase 2 prosecution has up to 15 steps, some conditional, spanning months to years.

### Recommended approach: **Two-layer disclosure**

**Layer 1 — Summary view (always visible):**
Show only 4 milestone buckets for Phase 2, regardless of IP type:
- Filed → Under Examination → Allowance / Publication → Certificate Issued
This gives inventors a scannable sense of overall progress without jargon.

**Layer 2 — Detail view (expandable):**
"See full timeline" toggle reveals the complete vertical stepper with all named IPOPHL steps, dates, and conditional branches. This is where case handlers update individual steps.

### Conditional branch visualization (Patent → UtilModel)
When a patent converts to a utility model, show a visual fork in the stepper: the original path grays out at "Notice of Final Refusal," and the conversion branch activates below it. Label it clearly: "Converted to Utility Model."

### Timeline axis (optional enhancement)
For Phase 2 detail view, add a thin date axis on the right margin showing elapsed time between milestones. This contextualizes how long each IPOPHL step took without cluttering the step labels.

---

## 7. Information Architecture: Inventor Project Detail Page Layout

```
┌─────────────────────────────────────────┐
│  [← Back to My Projects]               │
│                                         │
│  [IP Type Badge]  Project Title         │
│  College / Department                   │
│  Submitted: Jan 12, 2024                │
│  Case Handler: Maria Santos             │
├─────────────────────────────────────────┤
│  [Pre-Protection]  [IPOPHL Prosecution] │  ← Phase tab bar
├─────────────────────────────────────────┤
│                                         │
│  ●─────●─────◎─────○─────○─────○       │  ← Horizontal stepper (Phase 1)
│  Done  Done  Active Pend Pend  Pend     │
│                                         │
│  Current Status: [Under Evaluation]     │
│  "Prior Art Search is currently being   │
│   conducted by your case handler."      │
│                                         │
├─────────────────────────────────────────┤
│  [See full IPOPHL timeline ▾]           │  ← Collapsed by default
│  (Disabled until Phase 1 complete)      │
└─────────────────────────────────────────┘
```

---

## 8. Verification Plan (Before Implementation)

When code is eventually generated:
1. Render all 5 IP types (Patent, UtilModel, Patent→UM conversion, Trademark, Copyright) and confirm the correct number of steps renders for each
2. Verify "For filing (returned by OC)" renders with amber/warning color, not green
3. Confirm Phase 2 tab is disabled until the project record has `phase: "IPOPHL"` in mock data
4. Test the conditional step collapse/expand on Patent prosecution (steps 4 and 8)
5. Confirm the Patent→UtilModel fork renders a visual branch, not a linear override
6. Validate that inventor view is read-only; no state-change controls visible
