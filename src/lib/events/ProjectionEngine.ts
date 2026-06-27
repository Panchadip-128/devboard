import { EventStore, DomainEvent } from './EventStore';

/**
 * Deterministic Replay Engine.
 * Reads the Event Store and mathematically re-constructs the state of the system
 * into read-optimized Materialized Views.
 */
export class ProjectionEngine {
  private eventStore: EventStore;
  
  // In a real cloud architecture, these would project into Postgres tables or Redis cache.
  // We mock the materialized views in-memory for this architectural demonstration.
  public materializedViews = {
    commits: new Map<string, any>(),
    pullRequests: new Map<string, any>(),
    incidents: new Map<string, any>()
  };

  constructor(eventStore: EventStore) {
    this.eventStore = eventStore;
  }

  /**
   * Deterministically rebuilds the entire database from offset 0 using 
   * causally sorted events (Vector Clock ordering).
   */
  public replayAll() {
    this.materializedViews.commits.clear();
    this.materializedViews.pullRequests.clear();
    this.materializedViews.incidents.clear();

    const events = this.eventStore.getCausallyOrderedLog();
    
    for (const event of events) {
      this.applyEvent(event);
    }
    
    console.log(`[Projection Engine] Deterministically replayed ${events.length} events to rebuild database state.`);
  }

  private applyEvent(event: DomainEvent) {
    switch (event.type) {
      case 'COMMIT_PUSHED':
        this.materializedViews.commits.set(event.payload.sha, event.payload);
        break;
      case 'PR_OPENED':
        this.materializedViews.pullRequests.set(event.payload.id, {
          ...event.payload,
          status: 'OPEN'
        });
        break;
      case 'PR_CLOSED':
        const pr = this.materializedViews.pullRequests.get(event.payload.id);
        if (pr) {
          pr.status = 'CLOSED';
          pr.closedAt = event.timestamp;
        }
        break;
      case 'INCIDENT_CREATED':
        this.materializedViews.incidents.set(event.payload.id, event.payload);
        break;
    }
  }
}
