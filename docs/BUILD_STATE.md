# BUILDPOD OS — BUILD STATE (AXIS)

## STACK
- Next.js App Router
- Prisma 7
- Supabase Postgres
- TypeScript
- Tailwind-style UI
- Local dev (Mac)

## ARCHITECTURE
- BuildPod OS = system of record
- ATLAS = intelligence/orchestration layer
- asset-centric
- event-driven
- multi-tenant ready

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

### Staging (BACKEND COMPLETE)
- staging_sessions exists
- staging_session_items exists
- item verification works
- readiness logic works
- session completion logic works
- job readiness propagation works
- API tested via curl and working

### API
- /api/inventory (GET/POST/PATCH/DELETE)
- /api/inventory/transactions (GET)
- /api/staging-sessions (GET working)

## CURRENT GAP
- staging UI not connected to real data
- no session detail view
- no item-level verification UI
- no staging → inventory visual linkage

## PRODUCT DIRECTION

### Integrations (DO NOT REPLACE YET)
- QuickBooks
- Google Workspace
- Gusto

### Core OS Responsibilities
- jobs
- staging (pre-flight readiness)
- inventory
- assets / fleet / maintenance
- media (photos, notes, voice → AI summary later)
- workforce (schedule, PTO, time clock later)

### AI STRUCTURE
- module-level assistants (inventory, staging, jobs, etc.)
- ATLAS sits above them and orchestrates
- ATLAS can later query external data if needed

## UX DOCTRINE
- clean
- minimal
- premium (Apple-like)
- low visual noise
- gold accent restrained
- sidebar grouped, not cluttered

## RULES FOR DEVELOPMENT
- do NOT rebuild existing modules
- do NOT assume missing code
- do NOT ask for full files
- give exact file paths + insertion points
- minimal diffs only
- one step at a time