# DevBoard: Engineering Team Intelligence Platform

[![CI](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml)

DevBoard is an advanced engineering telemetry and intelligence platform designed to ingest raw development lifecycle events and transform them into actionable insights. By leveraging an event-driven architecture, DevBoard computes complex DORA metrics, maps pull request bottlenecks, detects statistical anomalies, and predicts team health in real-time.

## Production Engineering Features

✓ **OpenTelemetry Tracing** & **Prometheus Metrics** via Grafana Dashboards
✓ **Redis Caching** for high-performance sub-millisecond aggregations
✓ **Background Workers** with PostgreSQL `SKIP LOCKED` (`pg-boss`)
✓ **Dead Letter Queue** (DLQ) for robust GitHub Webhook processing
✓ **Unit Testing** and **Integration Testing** covering Webhook ingestion & Queue processing
✓ **Load Testing** benchmarking API limits and Database protection
✓ **RBAC Authorization** for enterprise-grade security
✓ **Real-Time SSE Streaming** via Redis Pub/Sub

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
![Landing Page](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/landing_page.png)

### 2. DORA Metrics Dashboard
*Real-time computed Deployment Frequency, Lead Time for Changes, MTTR, and Change Failure Rate with composite team health score.*
![Dashboard](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/dashboard_page.png)

### 3. Incidents Management Timeline
*Active incidents and interactive chronological postmortem statuses.*
![Incidents](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/incidents_page.png)

### 4. Team Leaderboard & Contributor Rankings
*Dynamic leaderboards ranking contributors by commits, PR reviews responsiveness, and load percentages.*
![Team Leaderboard](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/team_leaderboard_page.png)

### 5. Service Architecture Hierarchy Map
*SVG-based node graphs showing critical path blocking dependencies and service health.*
![Architecture Map](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/architecture_page.png)

### 6. API Endpoints Metrics Output
*JSON representations of analytical DORA metrics and active anomaly alerts.*
- **Anomaly Alerts (`/api/alerts`)**:
  ![API Alerts](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/api_alerts_page.png)
- **Team Metrics (`/api/teams/:teamId/metrics`)**:
  ![API Teams](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/api_teams_page.png)

### 7. Global Command Palette (Full-Text Search)
*Fast, keyboard-driven global search across incidents, repositories, and team members.*
![Command Palette](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/command_palette.png)

### 8. Automated Root Cause Analysis (GenAI)
*Google Gemini integration analyzing recent commits and deployments to generate incident root causes.*
![GenAI Root Cause](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/incident_ai.png)

## Advanced SDE Features

### 1. Algorithmic PR Dependency Graph
We implemented a Directed Acyclic Graph (DAG) algorithm utilizing Depth First Search (DFS) to detect circular pull request dependencies. Furthermore, we use dynamic programming to calculate the "Critical Path"—the longest sequential chain of wait times currently blocking a deployment.

### 2. LRU Aggregation Caching Layer
To protect the database during traffic spikes, we developed an in-memory Least Recently Used (LRU) Cache layer. This cache employs a Time-To-Live (TTL) eviction strategy to serve highly complex analytical queries in constant time.

### 3. Workload Distribution Heuristics
We developed a predictive heuristic algorithm that parses the raw timestamp metadata of commit histories. By calculating ratios of excessive weekend work and late-night coding (10 PM to 4 AM), the system programmatically assigns a "Workload Risk Level" to individual engineers.

## Backend Architecture Deep-Dive

To demonstrate senior-level system design, DevBoard employs several advanced backend architectural patterns:

### 1. High-Performance Redis Caching
To support instant dashboard rendering and reduce database load, we implemented a robust caching layer using `ioredis`. 
* **Location:** `src/lib/redis.ts` and `src/app/api/teams/[teamId]/metrics/route.ts`
* **Effect:** Heavy aggregation queries (like the 30-day DORA metrics and contributor leaderboards) are cached with a 5-minute TTL. This converts what would be a multi-second PostgreSQL aggregation across thousands of commits into a sub-millisecond Redis `GET` operation.

### 2. Robust Background Job Processing
We utilize PostgreSQL's `SKIP LOCKED` capabilities via the `pg-boss` queue to handle incoming GitHub webhooks safely and concurrently.
* **Location:** `src/app/api/webhooks/github/route.ts` and `src/workers/githubWorker.ts`
* **Effect:** Incoming webhooks are immediately offloaded to a background worker utilizing distributed system best practices: **exponential backoff**, a strict **retry limit of 5**, and automatic routing to a **Dead Letter Queue (dlq-github-webhook)** if the job continuously fails. This ensures 0% data loss during GitHub traffic spikes.

### 3. Advanced Role-Based Access Control (RBAC)
We implemented a strict security layer intercepting the NextAuth JWT session to enforce authorization on protected routes.
* **Location:** `src/lib/rbac.ts` and `src/lib/auth.ts`
* **Effect:** A `requireRole(['ADMIN'])` utility validates the user's role against the database mapping upon every request. This ensures only highly-privileged users can mutate critical state (e.g., creating new Teams), effectively preventing privilege escalation attacks.

### 4. Real-Time Push Events (SSE + Redis Pub/Sub)
We engineered a Server-Sent Events (SSE) pipeline backed by Redis Pub/Sub to provide a true real-time dashboard experience.
* **Location:** `src/app/api/stream/route.ts`
* **Effect:** Instead of the frontend constantly polling the backend (which wastes bandwidth and DB connections), the `api/stream` endpoint acts as an SSE host. When an asynchronous backend event occurs (like the GenAI finishing an incident analysis), it publishes to a Redis channel. The SSE endpoint subscribes to this channel and instantly pushes the payload down to all connected browser clients.

## REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams` | GET | List all teams with member and repository counts |
| `/api/teams` | POST | Create a new team with Zod input validation |
| `/api/teams/:teamId/metrics` | GET | Aggregated DORA, health, workload metrics for a team |
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
REDIS_URL="redis://localhost:6379"
```

### Production Deployment (Vercel)

To deploy DevBoard to production and ensure all real-time functionalities work correctly, you must configure the following:

1. **Database (Neon)**: Set up a PostgreSQL database (e.g., using Neon) and provide the `DATABASE_URL` in your Vercel project environment variables.
2. **Redis (Upstash)**: The SSE real-time streaming relies on a Redis Pub/Sub mechanism. You must provision an Upstash Redis database via Vercel integrations and set the `REDIS_URL` environment variable.
3. **Authentication**: Set the `NEXTAUTH_SECRET` and ensure the NextAuth URL matches your Vercel deployment URL.
4. **Webhooks**: Set a highly secure `GITHUB_WEBHOOK_SECRET`.

### Connecting Real GitHub Webhooks

While you can test with seed data locally, connecting real GitHub repositories to your live DevBoard deployment demonstrates the event-driven architecture in real-time.

1. Navigate to your repository on GitHub.
2. Go to **Settings > Webhooks > Add webhook**.
3. **Payload URL**: `https://<your-vercel-domain>/api/webhooks/github`
4. **Content type**: `application/json`
5. **Secret**: Enter the exact string you used for `GITHUB_WEBHOOK_SECRET` in your Vercel environment variables.
6. **Events**: Select **Let me select individual events**, and check the following:
   - Commit comments
   - Pull requests
   - Pull request reviews
   - Pushes
   - Deployments
   - Issues

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
      workload.ts       -- Workload distribution heuristics
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
