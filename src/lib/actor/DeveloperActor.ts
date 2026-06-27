import { Actor, ActorMessage } from './Actor';

/**
 * Phase 6: Developer Actor.
 * A stateful representation of a Developer in memory. 
 * Instead of querying Postgres for burnout scores, the state lives directly in RAM,
 * updated purely via mailbox messages.
 */
export class DeveloperActor extends Actor {
  // Completely isolated memory. No other class can read/write this directly.
  private state = {
    burnoutScore: 0,
    activePRs: 0,
    incidentsResolved: 0
  };

  protected async receive(message: ActorMessage): Promise<void> {
    switch (message.type) {
      case 'PR_OPENED':
        this.state.activePRs++;
        this.state.burnoutScore += 5; // Context switching penalty
        break;
      
      case 'PR_MERGED':
        this.state.activePRs = Math.max(0, this.state.activePRs - 1);
        this.state.burnoutScore = Math.max(0, this.state.burnoutScore - 2); // Dopamine hit
        break;

      case 'INCIDENT_ASSIGNED':
        this.state.burnoutScore += 20; // Massive stress spike
        break;
        
      case 'INCIDENT_RESOLVED':
        this.state.incidentsResolved++;
        this.state.burnoutScore = Math.max(0, this.state.burnoutScore - 5);
        break;

      default:
        console.warn(`[Developer ${this.id}] DeadLetter: Unhandled message type ${message.type}`);
    }
  }

  /**
   * Expose a safe, read-only snapshot for API responses.
   * In a pure actor system, we would reply via a 'GET_STATE' message,
   * but we provide a direct accessor here for Next.js prototype convenience.
   */
  public getSnapshot() {
    return { ...this.state };
  }
}
