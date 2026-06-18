# DevBoard: Engineering Team Intelligence Platform

DevBoard is an advanced engineering telemetry and intelligence platform designed to ingest raw development lifecycle events and transform them into actionable insights. By leveraging an event-driven architecture, DevBoard computes complex DORA metrics, maps pull request bottlenecks, detects statistical anomalies, and predicts team health in real-time.

## System Architecture

```mermaid
graph TD
    A[GitHub Webhooks] -->|POST Payload| B(Next.js API Receiver)
    B -->|HMAC SHA-256 Verify| C{Valid Signature?}
    C -->|Yes| D[(pg-boss Queue)]
    C -->|No| E[401 Unauthorized]
    D -->|SKIP LOCKED| F[Background Worker]
    F -->|Normalize & Store| G[(PostgreSQL Database)]
    G -->|Query Data| H[Analytical Engine]
    H -->|Aggregations| I[LRU Cache Layer]
    I -->|Fast Metrics| J(SSE Streaming Route)
    J -->|Live Push| K[Next.js Dashboard UI]
    H -->|Time Series| L[Anomaly Detection]
    L -->|Z-Score Alerts| K
```

Our platform is built to handle high-concurrency webhook streams without dropping events, utilizing an exactly-once delivery system.

- **Event Ingestion Pipeline:** We process concurrent GitHub webhook streams using `pg-boss`, which relies on PostgreSQL's advanced `SKIP LOCKED` row-level concurrency. This allows multiple worker instances to lock and process database rows safely without race conditions.
- **Data Normalization:** A background worker normalizes complex JSON webhook payloads into strict relational data models for Pull Requests, Commits, Deployments, and Incidents.
- **Push-Based Telemetry:** We utilize Server-Sent Events (SSE) to push live metric updates to the browser. This unidirectional stream avoids the heavy handshake overhead of WebSockets while ensuring sub-second latency from backend calculation to dashboard rendering.

## Core Features

### DORA Metrics Engine
The core engine natively calculates Deployment Frequency, Lead Time for Changes, and Mean Time To Recovery (MTTR). These metrics are cross-referenced with active bug densities to generate a composite executive-level Team Health Score graded from A+ to C.

### Incident Management with Postmortem Workflow
A dedicated incident management system with chronological timeline views tracking each status change (investigating, identified, monitoring, resolved). Each incident supports structured postmortems with root cause categories, action items, and affected service tagging.

### Team Leaderboard and Contribution Analytics
A comparative analytics engine that ranks team members by contribution patterns. Calculates per-developer commit volume, PR merge rates, review responsiveness scores, and workload distribution percentages to identify load imbalances.

### Statistical Anomaly Detection Engine
A sliding window Z-score algorithm operating over historical DORA metric time series. When a metric deviates more than 2 standard deviations from its 30-day rolling mean, the system flags an anomaly as either a spike or drop with warning or critical severity levels.

## Application Screenshots

Here are the visual representations of the platform's key components and metrics:

### 1. Landing Page
*The new dark-themed, glassmorphic welcome screen showcasing real-time DevBoard capabilities.*
![Landing Page](./screenshots/landing_page.png)

### 2. DORA Metrics Dashboard
*Real-time computed Deployment Frequency, Lead Time for Changes, MTTR, and Change Failure Rate with composite team health score.*
![Dashboard](./screenshots/dashboard_page.png)

### 3. Incidents Management Timeline
*Active incidents and interactive chronological postmortem statuses.*
![Incidents](./screenshots/incidents_page.png)

### 4. Team Leaderboard & Contributor Rankings
*Dynamic leaderboards ranking contributors by commits, PR reviews responsiveness, and load percentages.*
![Team Leaderboard](./screenshots/team_leaderboard_page.png)

### 5. Service Architecture Hierarchy Map
*SVG-based node graphs showing critical path blocking dependencies and service health.*
![Architecture Map](./screenshots/architecture_page.png)

### 6. API Endpoints Metrics Output
*JSON representations of analytical DORA metrics and active anomaly alerts.*
- **Anomaly Alerts (`/api/alerts`)**:
  ![API Alerts](./screenshots/api_alerts_page.png)
- **Team Metrics (`/api/teams/:teamId/metrics`)**:
  ![API Teams](./screenshots/api_teams_page.png)

## Advanced SDE Features

### 1. Algorithmic PR Dependency Graph
We implemented a Directed Acyclic Graph (DAG) algorithm utilizing Depth First Search (DFS) to detect circular pull request dependencies. Furthermore, we use dynamic programming to calculate the "Critical Path"—the longest sequential chain of wait times currently blocking a deployment.

### 2. LRU Aggregation Caching Layer
To protect the database during traffic spikes, we developed an in-memory Least Recently Used (LRU) Cache layer. This cache employs a Time-To-Live (TTL) eviction strategy to serve highly complex analytical queries in constant time.

### 3. Predictive Burnout Analysis Heuristics
We developed a predictive heuristic algorithm that parses the raw timestamp metadata of commit histories. By calculating ratios of excessive weekend work and late-night coding (10 PM to 4 AM), the system programmatically assigns a "Burnout Risk Level" to individual engineers.

## REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams` | GET | List all teams with member and repository counts |
| `/api/teams` | POST | Create a new team with Zod input validation |
| `/api/teams/:teamId/metrics` | GET | Aggregated DORA, health, burnout metrics for a team |
| `/api/repositories/:repoId/analytics` | GET | DORA metrics, PR bottlenecks, and health for a repository |
| `/api/alerts` | GET | Active anomaly alerts across all metric time series |
| `/api/webhooks/github` | POST | GitHub webhook receiver with HMAC signature verification |
| `/api/stream` | GET | Server-Sent Events stream for real-time dashboard updates |

## Data Model

```mermaid
erDiagram
    Team ||--o{ TeamMember : has
    Team ||--o{ Repository : owns
    Team ||--o{ Sprint : runs
    User ||--o{ TeamMember : belongs_to
    Repository ||--o{ PullRequest : contains
    Repository ||--o{ Commit : contains
    Repository ||--o{ Deployment : contains
    Repository ||--o{ Incident : contains
    Repository ||--o{ Issue : contains
    Sprint ||--o{ Issue : includes
    Incident ||--o{ IncidentUpdate : has_timeline
```

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Queue:** pg-boss (PostgreSQL-native job queue)
- **UI and Visualization:** TailwindCSS, Tremor, shadcn/ui
- **Validation:** Zod

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL instance (Local or Cloud)

### Installation

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/Panchadip-128/devboard.git
cd devboard
npm install
```

2. Configure the environment variables. Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devboard"
NEXTAUTH_SECRET="your-secret"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
```

3. Initialize the database schema and generate the Prisma client:
```bash
npx prisma generate
npx prisma db push
```

4. Seed the database with 90 days of realistic engineering data:
```bash
npx ts-node prisma/seed.ts
```

5. Start the development server:
```bash
npm run dev
```

The application will be running at `http://localhost:3000`. Navigate to `/dashboard` for the main engineering intelligence view, `/incidents` for incident management, and `/team` for contribution analytics.

## Project Structure

```
src/
  app/
    (app)/
      dashboard/       -- Main DORA metrics dashboard with anomaly alerts
      incidents/       -- Incident timeline and postmortem management
      team/            -- Contributor leaderboard and load distribution
    api/
      alerts/          -- Anomaly detection API
      teams/           -- Team CRUD with Zod validation
      repositories/    -- Repository analytics endpoints
      webhooks/github/ -- Webhook receiver with HMAC verification
      stream/          -- SSE streaming endpoint
      auth/            -- NextAuth.js authentication
  lib/
    algorithms/
      graph.ts         -- DAG traversal and critical path detection
      anomaly.ts       -- Z-score sliding window anomaly detection
    cache/
      lru.ts           -- LRU cache with TTL eviction
    metrics/
      dora.ts          -- Deployment frequency, lead time, MTTR
      pr.ts            -- PR bottleneck detection
      health.ts        -- Composite team health scoring
      sprint.ts        -- Sprint velocity and scope creep
      burnout.ts       -- Predictive burnout heuristics
      contributors.ts  -- Per-developer contribution rankings
  workers/
    githubWorker.ts    -- Background event normalization worker
  components/
    Sidebar.tsx        -- Persistent navigation sidebar
    DashboardLayout.tsx -- Shared layout with sidebar
prisma/
  schema.prisma        -- Full relational data model
  seed.ts              -- Realistic 90-day data generator
```
