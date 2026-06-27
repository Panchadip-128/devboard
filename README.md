# DevBoard: Enterprise Engineering Intelligence Platform

[![CI Pipeline](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

DevBoard is a high-performance engineering telemetry platform designed to ingest raw development lifecycle events and transform them into actionable insights. Built with a deeply distributed architecture, DevBoard natively calculates complex DORA metrics, maps pull request bottlenecks, and predicts team workload health in real-time.

It serves as a comprehensive demonstration of full-stack architectural maturity, showcasing the ability to blend complex data ingestion pipelines, low-level OS/memory optimization, custom compiler design, and highly responsive user interfaces into a single, cohesive enterprise product.

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

## Deep Systems Engineering

DevBoard handles enterprise-grade workloads, emphasizing high concurrency, strict consistency, and real-time observability.

### 1. Edge Telemetry Ingestion (Lock-Free Memory Models)
To support massive webhook ingestion, DevBoard implements a custom `SharedArrayBuffer` ring buffer directly in Node.js V8 memory. This allows background workers to parse and store incoming GitHub telemetry entirely outside the primary event loop without traditional Mutex locks, achieving sub-microsecond write latencies and zero V8 heap allocations on the hot path.

### 2. DevQL: JIT Compiler & Hyper-Columnar Mmap Database
For deep analytical querying, DevBoard bypasses traditional SQL. It features **DevQL**, a custom Domain-Specific Language (DSL).
- **Lexer & Parser:** Transforms DevQL string queries into an Abstract Syntax Tree (AST).
- **JIT Compilation:** Compiles the AST into native V8 JavaScript closures at runtime.
- **Hyper-Columnar Mmap Store:** Executes the JIT-compiled queries directly against memory-mapped OS file descriptors (`fs.openSync` + `Float64Array`) for near-instant columnar aggregation, completely bypassing PostgreSQL for analytical workloads.

![Dashboard DevQL Integration](assets/dashboard_final.png)

### 3. Stateful Developer Actors (Erlang/Akka Model)
The Burnout Radar predictive model utilizes an Actor System to manage concurrent telemetry updates without database locking.
- Each Developer is instantiated as an isolated Stateful Actor in RAM.
- Webhook events (e.g., `INCIDENT_ASSIGNED`) are pushed asynchronously into the Actor's mailbox.
- The Actor processes its queue strictly sequentially, updating burnout risk scores with zero race conditions.
- Real-time Memory State is rendered directly to the UI.

![Stateful Actors on Burnout Radar](assets/burnout_final.png)

### 4. Distributed Consensus Coordinator (Raft Protocol)
To ensure high availability, DevBoard nodes negotiate leadership utilizing the Raft Distributed Consensus algorithm. Background tasks (like anomaly detection and DLQ retries) are strictly executed by the elected `LEADER` node, while `FOLLOWER` nodes passively stream state. Cluster status is visually tracked in real-time in the application sidebar.

![Platform Diagnostics Console](assets/diagnostics_final.png)

### 5. Causal Event Sourcing (Vector Clocks)
In distributed systems, physical wall-clocks are unreliable. DevBoard tracks events using **Vector Clocks** to establish absolute mathematical causality. This ensures that CI/CD deployments and incident responses are sorted by true sequential dependency rather than timestamp approximations.

![Vector Clocks on Deployments](assets/deployments_final.png)

---

## Architectural Deep Dive

### High-Level Event Ingestion Flow

```mermaid
graph TD
    A[GitHub Webhooks] -->|POST Payload| B(Next.js API Receiver)
    B -->|HMAC SHA-256 Verify| C{Valid Signature?}
    C -->|Yes| D[(SharedArrayBuffer)]
    C -->|No| E[401 Unauthorized]
    D -->|Lock-Free Ring| F[V8 Worker Thread]
    F -->|Normalize & Store| G[(PostgreSQL Database)]
    G -->|Query Data| H[Analytical Engine]
    H -->|Aggregations| I[LRU Cache Layer]
    I -->|Fast Metrics| J(SSE Streaming Route)
    J -->|Live Push| K[Next.js Dashboard UI]
    H -->|Time Series| L[Anomaly Detection]
    L -->|Z-Score Alerts| K
```

**Architecture Flow Explanation:**
1. **Ingestion & Verification**: GitHub Webhooks send POST payloads to the Next.js API Receiver. The system instantly verifies the HMAC SHA-256 signature to prevent spoofing. Valid payloads drop directly into the `SharedArrayBuffer`, avoiding Node.js event-loop blockage.
2. **Concurrent Processing**: V8 Worker Threads consume the Ring Buffer lock-free. They parse complex nested JSON from GitHub and normalize it into a relational schema in PostgreSQL.
3. **Analytics & Caching**: The Analytical Engine runs heavy aggregate queries on the normalized data to compute DORA metrics and detect anomalies. To protect the database from concurrent dashboard load, these results are cached in an in-memory Least Recently Used (LRU) Cache layer.
4. **Real-Time Delivery**: A dedicated Server-Sent Events (SSE) streaming route pushes the cached metrics and live anomaly alerts directly to the Next.js Dashboard UI, ensuring users see sub-second metric updates without the overhead of WebSockets.

### Real-Time Pub/Sub Sequence Diagram (SSE)

```mermaid
sequenceDiagram
    participant B as Browser (Dashboard)
    participant N as Next.js API (/api/stream)
    participant R as Redis (ioredis)
    participant W as V8 Worker Thread
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

---

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict)
- **Database:** PostgreSQL
- **Systems Core:** V8 `SharedArrayBuffer`, OS `mmap`, Event Emitters
- **ORM:** Prisma
- **Queueing:** pg-boss (PostgreSQL-native job queue)
- **Caching & Pub/Sub:** Redis (`ioredis`)
- **Testing:** Vitest, k6
- **UI Architecture:** TailwindCSS, Tremor, shadcn/ui

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
| `/api/devql` | POST | Sandbox route for JIT compiling DevQL queries |
| `/api/system/actor` | POST/GET | Internal route for mutating or querying Stateful Developer Actors |
| `/api/system/db` | POST | Internal route for appending/aggregating to the Hyper-Columnar mmap |

