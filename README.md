# DevBoard: Enterprise Engineering Intelligence Platform

[![CI Pipeline](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

DevBoard is a high-performance engineering telemetry platform designed to ingest raw development lifecycle events and transform them into actionable insights. Built with an event-driven architecture, DevBoard natively calculates complex DORA metrics, maps pull request bottlenecks, detects statistical anomalies in deployment frequencies, and predicts team workload health in real-time.

---

## 🚀 Production Engineering Standards

DevBoard is engineered to handle enterprise-grade workloads, emphasizing high concurrency, strict authorization, and observability:

- **OpenTelemetry & Prometheus Metrics**: Deep system observability and request tracing, visualized via Grafana dashboards.
- **High-Performance Redis Caching**: Sub-millisecond aggregation retrieval utilizing LRU caching layers to shield the primary database from analytical query spikes.
- **Background Worker Queues**: Safe, highly-concurrent asynchronous task processing backed by PostgreSQL `SKIP LOCKED` (`pg-boss`).
- **Dead Letter Queue (DLQ)**: Zero-data-loss architecture for robust GitHub webhook payload ingestion with exponential backoff retries.
- **Comprehensive Testing Suites**: Full coverage utilizing Vitest for unit/integration testing and `k6` for concurrent API load testing.
- **Enterprise RBAC Authorization**: Strict Role-Based Access Control intercepting NextAuth sessions to prevent privilege escalation.
- **Real-Time SSE Streaming**: Unidirectional Server-Sent Events backed by Redis Pub/Sub for instant dashboard metric updates without WebSocket overhead.

---

## 🧠 Core Intelligence Features

### Advanced DORA Metrics Engine
Natively calculates standard engineering metrics including **Deployment Frequency**, **Lead Time for Changes**, and **Mean Time To Recovery (MTTR)**. These metrics are dynamically cross-referenced with bug densities to generate composite executive-level Team Health Scores.

### Algorithmic PR Dependency Graph
Implements a Directed Acyclic Graph (DAG) utilizing Depth First Search (DFS) to map pull request dependencies. DevBoard automatically calculates the "Critical Path"—identifying the exact sequential chain of wait times blocking a live deployment.

### Statistical Anomaly Detection
A sliding window Z-score algorithm continuously monitors historical DORA metrics. If a team's deployment frequency or MTTR deviates beyond two standard deviations from its 30-day rolling mean, DevBoard proactively flags an anomaly.

### Workload Distribution Heuristics
A predictive algorithm parsing raw commit timestamp metadata. By calculating ratios of weekend pushes and late-night coding sessions, the system programmatically flags individual engineers at high risk of burnout.

---

## 🏗️ System Architecture

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

Our event ingestion pipeline is built to handle high-concurrency webhook streams without dropping events. By utilizing PostgreSQL's advanced row-level locking, multiple worker instances can process database rows safely without race conditions. 

---

## 📸 Platform Previews

### Landing Page & Dashboard
*A modern, dark-themed interface showcasing real-time DORA metrics.*
![Landing Page](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/landing_page.png)
![Dashboard](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/dashboard_page.png)

### Architecture Maps & Incidents
*Interactive SVG-based node graphs and chronological incident postmortem timelines.*
![Architecture Map](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/architecture_page.png)
![Incidents](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/incidents_page.png)

### Automated Root Cause Analysis
*Google Gemini integrations automatically analyzing recent commits to generate root cause summaries.*
![GenAI Root Cause](https://raw.githubusercontent.com/Panchadip-128/devboard/main/assets/incident_ai.png)

---

## 💻 Technology Stack

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

## ⚙️ Getting Started

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

## 📡 REST API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/teams` | GET/POST | Team management with Zod input validation |
| `/api/teams/:teamId/metrics` | GET | Highly cached, aggregated DORA & workload metrics |
| `/api/repositories/:repoId/analytics` | GET | Deep repository analysis and PR bottleneck detection |
| `/api/alerts` | GET | Active anomalies across metric time series |
| `/api/webhooks/github` | POST | Webhook receiver utilizing HMAC SHA-256 signature verification |
| `/api/stream` | GET | SSE stream emitting Redis Pub/Sub events |

---

*Engineered with focus on reliability, performance, and actionable engineering intelligence.*
