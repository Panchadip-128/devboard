# DevBoard: Engineering Team Intelligence Platform

DevBoard is an advanced engineering telemetry and intelligence platform designed to ingest raw development lifecycle events and transform them into actionable insights. By leveraging an event-driven architecture, DevBoard computes complex DORA metrics, maps pull request bottlenecks, and predicts team health in real-time.

## System Architecture

Our platform is built to handle high-concurrency webhook streams without dropping events, utilizing an exactly-once delivery system.

- **Event Ingestion Pipeline:** We process concurrent GitHub webhook streams using `pg-boss`, which relies on PostgreSQL's advanced `SKIP LOCKED` row-level concurrency. This allows multiple worker instances to lock and process database rows safely without race conditions.
- **Data Normalization:** A background worker normalizes complex JSON webhook payloads into strict relational data models for Pull Requests, Commits, Deployments, and Incidents.
- **Push-Based Telemetry:** We utilize Server-Sent Events (SSE) to push live metric updates to the browser. This unidirectional stream avoids the heavy handshake overhead of WebSockets while ensuring sub-second latency from backend calculation to dashboard rendering.

## Advanced SDE Features

Our core analytics engine implements several advanced algorithms and system design patterns to ensure scalability and deep intelligence.

### 1. Algorithmic PR Dependency Graph
Developers frequently encounter "dependency hell" where review chains become blocked. We implemented a Directed Acyclic Graph (DAG) algorithm utilizing Depth First Search (DFS) to detect circular pull request dependencies. Furthermore, we use dynamic programming to calculate the "Critical Path"—the longest sequential chain of wait times currently blocking a deployment.

### 2. LRU Aggregation Caching Layer
Calculating aggregate DORA metrics across tens of thousands of commits is computationally expensive. To protect the database during traffic spikes, we developed an in-memory Least Recently Used (LRU) Cache layer. This cache employs a Time-To-Live (TTL) eviction strategy to serve highly complex analytical queries in constant time.

### 3. Predictive Burnout Analysis Heuristics
Engineering management requires foresight into team health. We developed a predictive heuristic algorithm that parses the raw timestamp metadata of commit histories. By calculating ratios of excessive weekend work and late-night coding (10 PM to 4 AM), the system programmatically assigns a "Burnout Risk Level" to individual engineers, enabling proactive team management.

### 4. DORA Metrics Engine
The core engine natively calculates Deployment Frequency, Lead Time for Changes, and Mean Time To Recovery (MTTR). These metrics are cross-referenced with active bug densities to generate a composite executive-level Team Health Score.

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Queue:** pg-boss (PostgreSQL-native job queue)
- **UI & Visualization:** TailwindCSS, Tremor, shadcn/ui

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

4. Start the development server:
```bash
npm run dev
```

The application will be running at `http://localhost:3000`. Access the dashboard at `/dashboard`.
