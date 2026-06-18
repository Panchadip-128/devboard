# REST API Reference

DevBoard exposes a robust, typed REST API powering the frontend dashboard and external integrations.

## Core Principles
1. **Validation:** All incoming POST/PUT bodies are strictly validated using `Zod` schemas before hitting the database.
2. **Authorization:** Endpoints utilize the `requireRole()` RBAC middleware to enforce access controls tied to the NextAuth JWT.
3. **Caching:** Heavy aggregation endpoints are cached via Redis LRU layers.

---

## Endpoints

### 1. `POST /api/webhooks/github`
Ingests raw GitHub event payloads.
* **Security:** Validates the `x-hub-signature-256` HMAC using the `GITHUB_WEBHOOK_SECRET`.
* **Behavior:** Synchronously enqueues the payload into `pg-boss` with exponential backoff configurations and returns a fast `200 OK`. 

### 2. `GET /api/stream`
A persistent Server-Sent Events (SSE) connection providing real-time telemetry.
* **Headers:** `Content-Type: text/event-stream`
* **Behavior:** Subscribes to the internal `realtime-updates` Redis channel. Pushes JSON-formatted events (e.g., `incident_analyzed`) to connected clients instantly.

### 3. `GET /api/search`
The engine behind the Global Command Palette.
* **Query Params:** `?q=query_string`
* **Response:** Concurrently queries Users, Teams, Repositories, and Incidents via `Promise.all` using case-insensitive partial text matching.

### 4. `POST /api/incidents/[id]/analyze`
Triggers the Automated Root Cause GenAI pipeline.
* **Params:** `id` (The Incident UUID)
* **Behavior:** Fetches historical context, queries the Gemini LLM via RAG, updates the database, and fires a Redis Pub/Sub event to trigger a real-time UI update on the SSE stream.

### 5. `POST /api/teams`
Creates a new engineering organization.
* **Authorization:** **STRICT - `ADMIN` Role Required**. The request will fail with a `403 Forbidden` if the calling JWT lacks the Admin role claim.
* **Validation:** 
```typescript
const CreateTeamSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/)
});
```

### 6. `GET /api/teams/[teamId]/metrics`
Aggregates historical DORA metrics for an entire team.
* **Performance:** Protected by the Redis caching layer. Repeated requests within a 5-minute window will return a cache hit, bypassing the expensive PostgreSQL SQL aggregations entirely.
