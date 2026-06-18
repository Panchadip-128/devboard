# Automated Root Cause Analysis (GenAI Integration)

Modern incident management requires rapid triage. DevBoard features a highly sophisticated integration with Google's Gemini Large Language Model (LLM) to automatically deduce the root cause of production incidents based on raw telemetry data.

This document details the Machine Learning and GenAI architecture driving this feature.

## The Architecture: Retrieval-Augmented Generation (RAG)

Standard LLMs lack context about a company's specific codebase or active production state. To solve this, DevBoard utilizes the **Retrieval-Augmented Generation (RAG)** pattern.

Instead of asking a generic question, our API endpoint (`/api/incidents/[id]/analyze`) acts as an intelligent orchestration layer:

1. **Trigger:** A developer requests an AI Analysis for an active incident via the UI.
2. **Retrieval (The "R"):** The backend queries the PostgreSQL database to construct an ultra-specific context window. It pulls:
    * The exact description and severity of the Incident.
    * The last 10 code commits leading up to the exact minute the incident fired.
    * The last 5 production deployments.
3. **Augmentation (The "A"):** This raw data is formatted into a dense, structured string payload.
4. **Generation (The "G"):** The backend injects this context into a highly restrictive prompt template and transmits it to the Gemini LLM. The model is forced into a persona ("Senior DevOps Engineer") and instructed to output a concise, highly probable root cause hypothesis.

## The Prompt Engineering Strategy

Crafting the perfect prompt is essential to prevent "hallucinations" (the AI making up false correlations). Our prompt is structured with strict boundaries:

```text
You are a Senior DevOps Engineer analyzing a production incident. 
Based on the following data, provide a concise, 1-paragraph highly likely root cause.

Incident: [Title & Severity]

Recent Commits (last 10):
- [Commit SHA] | [Author] | [Commit Message]

Recent Deployments (last 5):
- [Deployment Environment] | [Status]

Hypothesis:
```

### Why this works:
* **Persona Adoption:** Instructing the model to act as a "Senior DevOps Engineer" forces it to utilize its technical latency and systems training weights.
* **Bounded Context:** By explicitly providing only the chronologically relevant commits and deployments, the model's attention mechanism is heavily weighted toward actual recent changes, preventing it from guessing blindly.

## Real-Time Feedback Loop

The analysis is computationally expensive. Therefore, we do not block the frontend while waiting for the LLM's response. 
Instead, the endpoint returns immediately, processes the RAG pipeline asynchronously, and utilizes our **Redis Pub/Sub SSE stream** to push the final AI-generated hypothesis directly into the browser the second it finishes computing.
