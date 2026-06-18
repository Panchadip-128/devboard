# System Design & Architecture

DevBoard is engineered as a highly concurrent, event-driven platform capable of handling intense developer activity across massive enterprise repositories without dropping webhooks or degrading dashboard performance.

This document details the critical architectural decisions and trade-offs made during development.

## 1. Event Ingestion Pipeline (pg-boss vs. External Queue)

### The Problem
GitHub can send thousands of concurrent webhooks during peak development hours. A synchronous REST API would quickly become overwhelmed, leading to dropped HTTP requests, connection timeouts, and massive data loss. 

### The Solution: `pg-boss`
Instead of processing webhook payloads synchronously, the `/api/webhooks/github` endpoint acts merely as a lightweight ingestion layer. It immediately validates the HMAC SHA-256 signature and enqueues the payload. 

**Trade-off Analysis:**
While systems like RabbitMQ or Kafka are industry standards for event streaming, they introduce significant operational complexity (managing separate clusters, network latency, split-brain scenarios). We chose **`pg-boss`**, a PostgreSQL-native job queue.
* **Why it works:** `pg-boss` utilizes PostgreSQL's highly advanced `SKIP LOCKED` row-level concurrency feature. This allows multiple background Node.js worker instances to simultaneously query the database for new jobs, lock the rows they are working on, and process them—all without race conditions or deadlocks.
* **Resiliency:** Jobs are configured with **exponential backoff**, a **retry limit of 5**, and automatic routing to a **Dead Letter Queue (DLQ)**.

## 2. High-Performance Caching Layer (Redis LRU)

### The Problem
Calculating complex metrics like the 30-day DORA scores or ranking hundreds of contributors by PR review velocity requires massive SQL aggregation queries over millions of rows of historical data. Hitting the database on every dashboard render is unscalable.

### The Solution: Redis In-Memory Cache
We implemented an external Redis container accessed via `ioredis`. 
* **The Strategy:** The most expensive aggregation endpoints (e.g., `/api/teams/[teamId]/metrics`) wrap their database queries in a cache layer. 
* **Eviction Policy:** We utilize a Time-To-Live (TTL) eviction strategy (typically 5 minutes). This ensures that heavy reads are converted into sub-millisecond, O(1) Redis `GET` operations, dramatically reducing PostgreSQL CPU utilization while maintaining near real-time metric accuracy.

## 3. Real-Time Telemetry (SSE vs. WebSockets)

### The Problem
The DevBoard frontend needs to reflect live engineering activity (e.g., a new PR merged, an incident resolved) instantly, without requiring the user to manually refresh the page.

### The Solution: Server-Sent Events (SSE)
We built a real-time push pipeline using a combination of Redis Pub/Sub and Server-Sent Events.

**Trade-off Analysis:**
WebSockets provide full-duplex communication (bidirectional). However, DevBoard's dashboard is strictly a *consumer* of real-time metrics; it doesn't need to push high-frequency data back to the server.
* **Why SSE?** WebSockets require complex handshake protocols and custom proxy configurations, often struggling with corporate firewalls. SSE runs over standard HTTP, making it incredibly lightweight and robust. 
* **Implementation:** The `api/stream` endpoint opens a persistent HTTP connection. When a background worker finishes processing an event, it publishes the result to a Redis channel. The SSE endpoint, subscribed to that channel via a duplicate Redis client, instantly pushes the payload to all connected browsers.

## 4. Role-Based Access Control (RBAC)

Security is paramount when dealing with enterprise intellectual property. The application implements a centralized RBAC layer natively tied into NextAuth's JSON Web Tokens (JWT).
By injecting the database-mapped `Role` (ADMIN, MEMBER, VIEWER) into the cryptographically signed JWT at login, the Edge-compatible `requireRole` middleware can instantly validate permissions on sensitive API routes without needing to hit the database, preventing privilege escalation while maintaining high throughput.
