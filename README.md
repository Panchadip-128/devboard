# DevBoard: Enterprise Engineering Intelligence Platform

[![CI Pipeline](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml/badge.svg)](https://github.com/Panchadip-128/devboard/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

DevBoard is a high-performance engineering telemetry platform designed to ingest raw development lifecycle events and transform them into actionable insights. Built with a distributed architecture, DevBoard natively calculates complex DORA metrics, maps pull request bottlenecks, and predicts team workload health in real-time.

It demonstrates a deep understanding of robust, highly concurrent systems engineering required for modern cloud-native infrastructures.

---

## Production Engineering Architecture

DevBoard is engineered to handle enterprise-grade workloads, emphasizing high concurrency, strict consistency, and real-time observability.

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

## Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (Strict)
- **Systems Core:** V8 `SharedArrayBuffer`, OS `mmap`, Event Emitters
- **Database:** PostgreSQL (Prisma ORM)
- **Queueing:** pg-boss (PostgreSQL-native job queue using `SKIP LOCKED`)
- **Real-time:** Server-Sent Events (SSE)
- **UI Architecture:** TailwindCSS, Tremor, shadcn/ui

---

## Local Installation

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

## Architecture Diagnostics Mode

To see the raw infrastructure engines running live, navigate to the `/platform-diagnostics` route in the application. This interactive sandbox provides direct access to the JIT Compiler output, the Columnar Mmap results, and the Stateful Actor mailboxes.

---

## Conclusion

DevBoard serves as a comprehensive demonstration of full-stack architectural maturity. It showcases the ability to blend complex data ingestion pipelines, low-level OS/memory optimization, custom compiler design, and highly responsive user interfaces into a single, cohesive enterprise product.
