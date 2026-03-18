# BUILDPOD OS — BUILD STATE (AXIS)

## STACK
- Next.js App Router
- Prisma 7
- Supabase Postgres
- TypeScript
- Tailwind-style UI
- Local dev (Mac)

## ARCHITECTURE
- BuildPod OS = authoritative operational system of record
- ATLAS = intelligence/orchestration layer above the OS
- asset-centric
- event-driven
- multi-tenant ready
- privacy-first
- production-minded
- status should be derived wherever possible, not freely editable
- lowest-level truth drives higher-level state:
  - items → sessions → jobs

---

## OPERATING DOCTRINE
- do not rebuild existing modules if they already work
- integrate before replacing where intentionally deferred
- do not let AI become control logic
- append-only history is preferred for operational actions
- no silent overwrites of meaningful state
- staging is the execution-control differentiator
- Jobs define work requirements abstractly
- Inventory is the source of truth for supply
- Assets are execution containers, not shadow inventory ledgers
- Staging enforces real readiness before dispatch

---

## CANONICAL MODULE DEFINITIONS

### Inventory = supply truth
Tracks what exists and where it is.
- items
- quantities
- locations
- stock movement
- thresholds
- supply visibility

Mental model:
- "What do we have and where is it?"

### Assets = physical execution containers
Tracks where work happens and what physical unit is being prepared/deployed.
- trailers
- pods
- trucks
- equipment systems
- deployed units
- maintenance state

Mental model:
- "Where does work happen?"

Constraint:
- assets must NOT become a shadow inventory system
- asset state should reflect staged/deployed state via events, not duplicate inventory balances directly

### Staging = execution + readiness enforcement
Tracks whether a specific job/asset combination is physically ready before dispatch.
- staging sessions
- session items
- verification
- shortages
- readiness state
- governance
- dispatch blocking

Mental model:
- "Can we actually execute right now?"

### Jobs = work definition layer
Defines what must be done, not the exact inventory item IDs.
- scope
- phases
- timeline
- requirements
- milestones
- instructions

Constraint:
- jobs should define requirements abstractly, not bind directly to exact inventory items in early phases

### Workforce = human execution layer
Tracks who is responsible for execution and accountability.
- people
- roles
- assignments
- activity attribution

---

## CORE SYSTEM LAYERS

### Execution layer
- staging phase 1
- scanner/manual verification loop
- warehouse operator workflow

### Governance layer
- dispatch lock
- readiness enforcement
- blocking vs non-blocking issues
- shortage accountability
- signoff/release later

### Planning layer
- templates
- required kit generation
- substitution system
- planning expansion later

### State derivation layer
Critical system logic inside staging.
- item-level state
- session-level derived state
- readiness computation rules
- job readiness propagation

This is core IP logic and must remain deterministic.

---

## WORKING MODULES

### Shell / UI
- AppShell working
- grouped sidebar working
- collapsible sidebar working
- dark/light mode working
- ATLAS floating button present
- ATLAS command palette shell exists (UI only)

### Inventory (COMPLETE v1)
- list items
- search (name, sku, part, location, code)
- quantity +/-
- quick add form
- low stock highlighting
- inventory balances per location
- transaction logging
- audit trail UI
- soft archive (active_flag)

### Staging (BACKEND + UI FOUNDATION ACTIVE)
Backend foundations exist and work:
- staging_sessions exists
- staging_session_items exists
- item verification path exists
- readiness logic exists
- session completion logic exists
- job readiness propagation exists
- API previously tested and working

Current implemented staging UI/state:
- `/staging` overview page wired to real API
- overview shows:
  - status
  - asset
  - job
  - issue count
  - item count
  - last updated
  - session id
- overview summary cards:
  - attention
  - total issues
  - ready/completed
  - in progress
  - total sessions
- overview rows clickable to session detail
- overview priority sorting implemented:
  - blocked/problem first
  - then in progress
  - then ready
  - then completed
- overview supports:
  - exact search by asset / job / session id
  - result count
  - clear search
  - needs-attention-only toggle

Detail page `/staging/[id]` currently supports:
- real session load from service layer
- summary header
- readiness/status badge
- session metadata
- item summary cards:
  - total
  - verified
  - missing/issue
  - pending
- item table
- item rows sorted with problem states first
- manual item actions:
  - Verify
  - Missing
  - Pending
- actual_quantity updates through item actions
- note editing from staging UI
- bulk verify for eligible visible items
- scanner-first workflow UI
- scanner input auto-focus
- unmatched / invalid / already-verified scan handling
- scan/activity history panel
- local Staging AI guidance surface
- manual fallback preserved if scanner fails

### API
Working or present:
- `/api/inventory` (GET/POST/PATCH/DELETE)
- `/api/inventory/transactions` (GET)
- `/api/staging-sessions` (GET)
- `/api/staging-items` (PATCH)
- `/api/staging-sessions/[id]/scan` (POST)
- `/api/staging-sessions/[id]/bulk-verify` (POST)

---

## CURRENT GAPS
Staging-specific remaining gaps:
- verify final Phase 1 scanner/history slice is stable end-to-end after schema/runtime sync
- remove any residual stale-client/runtime issues after schema changes
- dispatch lock / governance enforcement not fully implemented yet
- shortage reason capture not built yet
- substitute item workflow not built yet
- staging templates not built yet
- session creation UI not built yet
- offline/degraded mode not built yet
- dispatch certificate/signoff not built yet

Broader product gaps:
- jobs module not yet built beyond shell
- assets module not yet built beyond shell
- workforce module not yet built beyond shell
- communications module not yet built beyond shell
- media module not yet built beyond shell
- finance module not yet built beyond shell
- workspace/org controls not yet surfaced as full admin UI

---

## PRODUCT DIRECTION

### Integrations intentionally NOT replaced yet
- QuickBooks
- Google Workspace
- Gusto

### Systems likely replaced over time by BuildPod OS / ATLAS
- JobTread / lightweight CRM workflow
- HubSpot operational pipeline layer
- Asana-style task tracking
- Coda/Loom-like operational documentation context
- Slack-like fragmented operational coordination
- Claude-like standalone ops assistant usage

### Core OS Responsibilities
- jobs
- staging (pre-flight readiness)
- inventory
- assets / fleet / maintenance
- media (photos, notes, voice → AI summary later)
- workforce (schedule, PTO, time clock later)
- communications tied to actual work entities
- finance visibility and job cost linkage
- workspace / organization control

---

## AI STRUCTURE

### Local section assistants
- Staging AI
- Inventory AI
- Jobs AI
- Dispatch AI
- Workforce AI
- Assets AI

### ATLAS
- global operational awareness
- pattern detection
- readiness forecasting
- shortage prediction
- workforce suggestions
- natural language interface
- orchestration above section assistants

Constraint:
- ATLAS must NOT become control logic
- ATLAS advises, interprets, summarizes, and coordinates
- deterministic operational state must remain in OS logic

---

## UX DOCTRINE
- clean
- minimal
- premium (Apple-like)
- low visual noise
- gold accent restrained
- dark/light mode
- sidebar grouped, not cluttered
- attention signaling should be strong:
  - red = blocked/problem
  - amber = in progress / pending
  - green = ready / verified
  - blue/locked = dispatched later
- operator flow first, dashboard second
- scanner-first where appropriate
- manual fallback preserved where hardware can fail

---

## CANONICAL SUBSYSTEM MAP

### 1. Dashboard (Command Overview Layer)
Purpose:
- real-time operational visibility across the organization

Subsystems:
- global readiness summary
- active staging sessions
- dispatch status board
- critical alerts
- asset readiness overview
- workforce availability snapshot
- activity/event feed
- ATLAS command panel

### 2. Jobs (Work Definition Layer)
Purpose:
- define what needs to be executed

Subsystems:
- job records
- job status lifecycle
- job → asset assignment
- job → staging session linkage
- required kit reference (Phase 3+ only)
- job notes / instructions
- timeline & milestones
- job event history

Constraint:
- jobs should not directly own exact inventory item bindings in early phases

### 3. Staging (Execution + Governance Layer) — CORE SYSTEM

#### Phase 1 — Execution
- staging sessions
- session items
- scanner system (barcode / QR)
- manual verification fallback
- bulk verify
- notes editing
- item filtering/search
- scan history log
- item state sorting (issues first)

#### Phase 2 — Governance
- auto-derived session status
- dispatch lock system
- governance summary panel
- shortage reason capture
- readiness state engine
- release/signoff system
- dispatch transition (ready → dispatched)
- governance event history
- blocking state enforcement
- partial readiness state:
  - blocking shortage
  - non-blocking issue

#### Phase 3 — Planning + Expansion
- session creation UI
- staging templates
- job-based kit generation
- substitute item workflow
- inventory-aware substitution
- cross-session reuse logic
- offline / degraded mode support

### 4. Assets (Physical System Layer)
Purpose:
- track trailers, pods, equipment systems, fleets

Subsystems:
- asset registry
- asset status
- asset → staging session linkage
- asset → job assignment
- maintenance tracking
- asset configuration profiles
- asset event history
- telemetry hooks (future)

Constraint:
- asset does NOT own inventory state directly
- asset reflects staged/deployed state via events and relationships

### 5. Inventory (Supply + Material Layer)
Purpose:
- track all tools, consumables, materials

Subsystems:
- inventory items
- locations (warehouse/bin/rack)
- inventory balances per location
- stock adjustments
- inventory transactions log
- low stock detection
- reorder thresholds
- search/filter
- soft archive

Future extensions (Phase 3+)
- inventory reservations (soft lock for staging)
- inventory allocation to staging
- multi-location transfers
- substitute matching engine
- supplier linkage

### 6. Workforce (Human System Layer)
Purpose:
- track people, roles, accountability, responsibility

Subsystems:
- user profiles
- roles
- skill tagging (future)
- availability / assignment
- workforce → job linkage
- workforce → staging responsibility
- activity tracking
- accountability logs

Future:
- time tracking
- certification tracking
- AI-assisted task routing

### 7. Communications (Operational Messaging Layer)
Purpose:
- contextual communication tied to work

Subsystems:
- job-based messaging
- staging session messaging
- dispatch communication threads
- system alerts / notifications
- mention/tag system
- message history per entity

Future:
- voice integration
- AI summarization
- auto-generated updates

### 8. Media (Documentation Layer)
Purpose:
- store and link evidence/documentation

Subsystems:
- image uploads
- video uploads
- file attachments
- media → job linkage
- media → staging linkage
- media → asset linkage
- timestamped documentation
- inspection photos

### 9. Finance (Cost + Resource Layer)
Purpose:
- track financial impact of operations

Subsystems:
- job costing
- material cost tracking
- labor cost linkage
- budget vs actual
- expense logging
- financial reporting (basic)

Future:
- invoice integration
- procurement tracking
- margin analysis

### 10. Workspace (Organization Layer)
Purpose:
- multi-tenant + configuration control

Subsystems:
- organizations
- users & memberships
- role permissions
- organization settings
- environment configs
- feature flags (future)
- API keys (future)

---

## CROSS-SYSTEM CORE (DO NOT BREAK)

### Core object model
- Organizations
- Assets
- Jobs
- Inventory
- Staging sessions
- Workforce
- Events (append-only history)

### Event system (critical)
Everything important should log to typed, attributable history.

Minimum typed event families:
- inventory.adjustment
- inventory.transfer
- staging.scan
- staging.verify
- staging.status_change (derived)
- staging.note_update
- staging.governance_action
- asset.status_change
- job.status_change
- workforce.assignment

Rules:
- no silent overwrites
- no destructive audit deletion
- append-only preferred
- events should be attributable where practical

---

## NEW ADDITIONS / LOCKED DOCTRINES

### Governance layer inside Staging
- dispatch lock
- readiness enforcement
- signoff system later
- shortage accountability

### Scanner-first UX system
- always-focused input
- non-blocking error handling
- high-speed warehouse workflow
- manual fallback preserved

### Attention system
- red = blocked
- amber = in progress
- green = ready
- blue/locked = dispatched later

### Append-only history standard
- no silent overwrites
- everything attributable
- event history should be queryable later by ATLAS

### Operational doctrine
- status is derived, not manually set
- truth comes from lowest-level data
- do not let AI override deterministic OS logic

---

## WHAT IS INTENTIONALLY NOT BUILT YET
- full substitute engine
- template system
- job → kit auto-generation
- offline-first architecture
- tool checkout system
- external integrations
- deep financial subsystem
- dispatch certificate/signoff
- session planning UI
- full assets/fleet UI
- full jobs UI
- workforce execution UI
- comms/media depth

---

## DEVELOPMENT RULES
- do NOT rebuild existing modules
- do NOT assume missing code
- do NOT ask for full files unless truly required
- give exact file paths + insertion/replacement points
- minimal diffs for tiny changes
- full-file replacement when changes are tightly coupled
- one coherent implementation slice at a time
- preserve working behavior unless explicitly replacing it
- do not reverse architectural doctrine without reconciling it explicitly

---

## CURRENT IMPLEMENTATION NOTE
The staging module has moved beyond placeholder status and now represents the first real operational vertical slice of BuildPod OS:
- overview → prioritize
- open session → act
- scan/manual verify → update item state
- backend reevaluates readiness
- UI reflects live operational truth

This is the current wedge and should remain protected as the execution-control nucleus of the platform.