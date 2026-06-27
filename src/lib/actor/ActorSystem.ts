import { Actor, ActorMessage } from './Actor';
import { DeveloperActor } from './DeveloperActor';

/**
 * Phase 6: Distributed Actor System (Router)
 * Acts as the centralized registry for all stateful actors in the cluster.
 */
export class ActorSystem {
  private static instance: ActorSystem;
  
  // The global actor registry mapping IDs to their specific memory space
  private actors: Map<string, Actor> = new Map();

  private constructor() {}

  public static getInstance(): ActorSystem {
    if (!ActorSystem.instance) {
      ActorSystem.instance = new ActorSystem();
    }
    return ActorSystem.instance;
  }

  /**
   * Lazily boots up an actor if it doesn't exist, similar to Akka/Erlang supervision.
   */
  public getOrCreateDeveloper(devId: string): DeveloperActor {
    const actorId = `dev_${devId}`;
    if (!this.actors.has(actorId)) {
      const actor = new DeveloperActor(actorId);
      this.actors.set(actorId, actor);
      console.log(`[ActorSystem] Spun up DeveloperActor: ${actorId}`);
    }
    return this.actors.get(actorId) as DeveloperActor;
  }

  /**
   * Fire-and-forget message routing.
   * This is how Webhook API routes interact with the system—they do NOT touch databases.
   */
  public send(actorId: string, message: ActorMessage) {
    const actor = this.actors.get(actorId);
    if (actor) {
      actor.tell(message);
    } else {
      console.warn(`[ActorSystem] DeadLetter: Message sent to non-existent actor ${actorId}`);
    }
  }
}
