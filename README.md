# DevBoard: Enterprise Engineering Intelligence Platform

[![CI Pipeline](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

DevBoard is a high-performance engineering telemetry platform designed to ingest raw development lifecycle events and transform them into actionable insights. Built with an event-driven architecture, DevBoard natively calculates complex DORA metrics, maps pull request bottlenecks, detects statistical anomalies in deployment frequencies, and predicts team workload health in real-time.

---

## Production Engineering Standards

DevBoard is engineered to handle enterprise-grade workloads, emphasizing high concurrency, strict authorization, and observability:

- **OpenTelemetry & Prometheus Metrics**: Deep system observability and request tracing, visualized via Grafana dashboards.
- **High-Performance Redis Caching**: Sub-millisecond aggregation retrieval utilizing LRU caching layers to shield the primary database from analytical query spikes.
- **Background Worker Queues**: Safe, highly-concurrent asynchronous task processing backed by PostgreSQL `SKIP LOCKED` (`pg-boss`).
- **Dead Letter Queue (DLQ)**: Zero-data-loss architecture for robust GitHub webhook payload ingestion with exponential backoff retries.
- **Comprehensive Testing Suites**: Full coverage utilizing Vitest for unit/integration testing and `k6` for concurrent API load testing.
- **Enterprise RBAC Authorization**: Strict Role-Based Access Control intercepting NextAuth sessions to prevent privilege escalation.
- **Real-Time SSE Streaming**: Unidirectional Server-Sent Events backed by Redis Pub/Sub for instant dashboard metric updates without WebSocket overhead.

---

## Core Intelligence Features

### Advanced DORA Metrics Engine
Natively calculates standard engineering metrics including **Deployment Frequency**, **Lead Time for Changes**, and **Mean Time To Recovery (MTTR)**. These metrics are dynamically cross-referenced with bug densities to generate composite executive-level Team Health Scores.

### Algorithmic PR Dependency Graph
Implements a Directed Acyclic Graph (DAG) utilizing Depth First Search (DFS) to map pull request dependencies. DevBoard automatically calculates the "Critical Path"—identifying the exact sequential chain of wait times blocking a live deployment.

### Statistical Anomaly Detection
A sliding window Z-score algorithm continuously monitors historical DORA metrics. If a team's deployment frequency or MTTR deviates beyond two standard deviations from its 30-day rolling mean, DevBoard proactively flags an anomaly.

### Workload Distribution Heuristics
A predictive algorithm parsing raw commit timestamp metadata. By calculating ratios of weekend pushes and late-night coding sessions, the system programmatically flags individual engineers at high risk of burnout.

---

## System Architecture

### High-Level Event Ingestion Flow

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

**Architecture Flow Explanation:**
1. **Ingestion & Verification**: GitHub Webhooks send POST payloads to the Next.js API Receiver. The system instantly verifies the HMAC SHA-256 signature to prevent spoofing. Valid payloads are inserted into a PostgreSQL-backed job queue (`pg-boss`), while invalid ones are immediately rejected with a 401 Unauthorized status.
2. **Concurrent Processing**: Background worker instances utilize PostgreSQL's `SKIP LOCKED` feature to concurrently claim jobs from the queue without race conditions. They parse complex nested JSON from GitHub and normalize it into a relational schema in the PostgreSQL Database.
3. **Analytics & Caching**: The Analytical Engine runs heavy aggregate queries on the normalized data to compute DORA metrics and detect anomalies. To protect the database from concurrent dashboard load, these results are cached in an in-memory Least Recently Used (LRU) Cache layer.
4. **Real-Time Delivery**: A dedicated Server-Sent Events (SSE) streaming route pushes the cached metrics and live anomaly alerts directly to the Next.js Dashboard UI, ensuring users see sub-second metric updates without the overhead of WebSockets.

### Real-Time Pub/Sub Sequence Diagram (SSE)

```mermaid
sequenceDiagram
    participant B as Browser (Dashboard)
    participant N as Next.js API (/api/stream)
    participant R as Redis (ioredis)
    participant W as Background Worker
    participant DB as PostgreSQL

    B->>N: Open SSE Connection (GET /api/stream)
    N->>R: Subscribe to 'dashboard:updates' channel
    N-->>B: Establish EventStream stream
    
    Note over W, DB: Worker processes a new Pull Request merge
    W->>DB: Store normalized event
    W->>R: Publish payload to 'dashboard:updates'
    R-->>N: Trigger message event
    N-->>B: Push JSON payload via SSE
    B->>B: Re-render DORA charts instantly
```
**Explanation:** This sequence illustrates our highly efficient unidirectional data flow. Instead of clients aggressively polling the database, they maintain a lightweight, read-only SSE connection. The backend uses Redis Pub/Sub to instantly broadcast database mutations across all serverless instances, which are then pushed directly to active browsers.

### Relational Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    TEAM ||--o{ TEAM_MEMBER : "has"
    TEAM ||--o{ REPOSITORY : "owns"
    USER ||--o{ TEAM_MEMBER : "belongs to"
    REPOSITORY ||--o{ PULL_REQUEST : "contains"
    REPOSITORY ||--o{ COMMIT : "contains"
    REPOSITORY ||--o{ INCIDENT : "tracks"
    REPOSITORY ||--o{ DEPLOYMENT : "logs"

    TEAM {
        string id PK
        string name
        int healthScore
    }
    USER {
        string id PK
        string name
        string email
        string role
    }
    PULL_REQUEST {
        string id PK
        string repositoryId FK
        string state
        int leadTimeMinutes
        datetime mergedAt
    }
    INCIDENT {
        string id PK
        string repositoryId FK
        string severity
        int timeToResolveMinutes
        string rootCause
    }
```
**Explanation:** The relational model maps the abstract nature of GitHub events into a highly queryable schema. By strictly enforcing foreign-key constraints between Repositories, Pull Requests, Commits, and Incidents, the analytical engine can perform ultra-fast SQL `JOIN`s to calculate exact Lead Time for Changes (measuring the delta between a Commit creation and its corresponding Deployment).

### Automated Root Cause Analysis Workflow

```mermaid
stateDiagram-v2
    [*] --> IncidentDetected
    IncidentDetected --> FetchRecentDeployments : Query PostgreSQL
    FetchRecentDeployments --> ExtractCommitDiffs : Hit GitHub API
    ExtractCommitDiffs --> ConstructPrompt : Build Context Window
    ConstructPrompt --> GoogleGeminiAPI : Send to LLM
    GoogleGeminiAPI --> ParseResponse : Receive Markdown
    ParseResponse --> StorePostmortem : Save to Database
    StorePostmortem --> PublishSSE : Alert Dashboard
    PublishSSE --> [*]
```
**Explanation:** When a critical incident is manually flagged or detected via anomalies, this state machine takes over. It traces the active deployment back to its constituent commits, aggregates the raw code diffs, and constructs an engineered prompt for Google Gemini. The resulting analysis is appended to the incident's postmortem automatically.

---

## Platform Previews

### Landing Page & Dashboard
*A modern, dark-themed interface showcasing real-time DORA metrics.*

![Landing Page](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/landing_page.png)
**Explanation:** The landing page serves as the entry point for engineering managers. It emphasizes the platform's core value proposition through a glassmorphic design and clear calls to action, immediately establishing an enterprise-grade aesthetic.

![Dashboard](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/dashboard_page.png)
**Explanation:** The primary metrics dashboard calculates and visualizes four key DORA metrics (Deployment Frequency, Lead Time, MTTR, Change Failure Rate) over a 30-day window. The composite "Team Health" score aggregates these metrics to provide executives with a single, highly readable health grade.

### Architecture Maps & Incidents
*Interactive SVG-based node graphs and chronological incident postmortem timelines.*

![Architecture Map](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/architecture_page.png)
**Explanation:** This diagram visually represents the relationships between different microservices or code repositories within the team's domain. It helps engineering leaders identify structural bottlenecks, single points of failure, and the complex dependency chains that slow down deployments.

![Incidents](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/incidents_page.png)
**Explanation:** The incidents timeline provides a chronological audit trail for production outages. It tracks status transitions from 'investigating' to 'resolved' and houses structured postmortems, enabling teams to categorize root causes and assign actionable follow-ups to prevent future regressions.

### Automated Root Cause Analysis
*Google Gemini integrations automatically analyzing recent commits to generate root cause summaries.*

![GenAI Root Cause](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/incident_ai.png)
**Explanation:** By integrating with Large Language Models (Google Gemini), the platform automatically parses the diffs of commits deployed right before an incident occurred. The AI generates a human-readable hypothesis of the root cause, dramatically reducing the time engineers spend debugging during a live outage.

---

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Queueing:** pg-boss (PostgreSQL-native job queue)
- **Caching & Pub/Sub:** Redis (`ioredis`)
- **Testing:** Vitest, k6
- **UI Architecture:** TailwindCSS, Tremor, shadcn/ui
- **Validation:** Zod

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL instance
- Redis instance

### Local Installation

1. **Clone and Install:**
```bash
git clone https://github.com/Panchadip-128/devboard.git
cd devboard
npm install
```

2. **Environment Configuration:**
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/devboard"
NEXTAUTH_SECRET="your-secure-secret"
GITHUB_WEBHOOK_SECRET="your-webhook-secret"
REDIS_URL="redis://localhost:6379"
```

3. **Initialize Database & Seed Data:**
```bash
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

4. **Start the Development Environment:**
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

### Real GitHub Webhook Integration

To connect real GitHub repositories to your local environment for demonstration:

1. Run the local tunnel script:
```bash
npm run webhook:tunnel
```
2. Navigate to your repository on GitHub > **Settings > Webhooks > Add webhook**.
3. Set the **Payload URL** to the Smee.io link provided by the tunnel script.
4. Set **Content type** to `application/json` and enter your `GITHUB_WEBHOOK_SECRET`.
5. Check **Let me select individual events** (Commits, Pull Requests, Deployments, Issues).

---

## REST API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams` | GET/POST | Team management with Zod input validation |
| `/api/teams/:teamId/metrics` | GET | Highly cached, aggregated DORA & workload metrics |
| `/api/repositories/:repoId/analytics` | GET | Deep repository analysis and PR bottleneck detection |
| `/api/alerts` | GET | Active anomalies across metric time series |
| `/api/webhooks/github` | POST | Webhook receiver utilizing HMAC SHA-256 signature verification |
| `/api/stream` | GET | SSE stream emitting Redis Pub/Sub events |

## Conclusion

DevBoard was engineered to solve the complex challenge of abstracting raw version control events into actionable engineering intelligence. By strictly adhering to enterprise system design principles—such as event-driven background processing, robust memory caching, and unidirectional real-time data flow—the platform ensures absolute data integrity and zero event loss even under extreme load. 

It serves as a comprehensive demonstration of full-stack architectural maturity, showcasing the ability to blend complex data ingestion pipelines, analytical heuristic algorithms, and highly responsive user interfaces into a single, cohesive product.
