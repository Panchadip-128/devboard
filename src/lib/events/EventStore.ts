import { VectorClock } from './VectorClock';
import { randomUUID } from 'crypto';

export type EventType = 'COMMIT_PUSHED' | 'PR_OPENED' | 'PR_CLOSED' | 'INCIDENT_CREATED';

export interface DomainEvent {
  eventId: string;
  type: EventType;
  payload: any;
  vclock: Record<string, number>; // Serialized Vector Clock
  timestamp: number;
}

/**
 * Immutable Event Store (Append-Only Log).
 * Bypasses standard CRUD operations. All mutations in the system must be
 * appended to this log with a Vector Clock stamp.
 */
export class EventStore {
  private static instance: EventStore;
  private log: DomainEvent[] = [];

  private constructor() {}

  public static getInstance(): EventStore {
    if (!EventStore.instance) {
      EventStore.instance = new EventStore();
    }
    return EventStore.instance;
  }

  public append(type: EventType, payload: any, vclock: VectorClock): string {
    const event: DomainEvent = {
      eventId: randomUUID(),
      type,
      payload,
      vclock: vclock.toJSON(),
      timestamp: Date.now()
    };
    
    this.log.push(event);
    return event.eventId;
  }

  public getLog(): DomainEvent[] {
    return [...this.log];
  }

  /**
   * Uses mathematical Vector Clocks to sort events causally, regardless 
   * of the physical time they were received by the server.
   */
  public getCausallyOrderedLog(): DomainEvent[] {
    return [...this.log].sort((e1, e2) => {
      const v1 = new VectorClock(e1.vclock);
      const v2 = new VectorClock(e2.vclock);
      
      if (VectorClock.happensBefore(v1, v2)) return -1;
      if (VectorClock.happensBefore(v2, v1)) return 1;
      
      // If mathematically concurrent, fallback to physical wall-clock timestamp
      return e1.timestamp - e2.timestamp;
    });
  }
}
