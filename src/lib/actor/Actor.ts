export interface ActorMessage {
  type: string;
  payload?: any;
  sender?: string;
}

/**
 * Phase 6: The Core Actor.
 * An isolated stateful entity that communicates purely via asynchronous messages.
 * This guarantees absolute thread-safety and eliminates race conditions without mutex locks.
 */
export abstract class Actor {
  public id: string;
  private mailbox: ActorMessage[] = [];
  private isProcessing: boolean = false;

  constructor(id: string) {
    this.id = id;
  }

  /**
   * The only way to interact with an Actor is to send it a message.
   */
  public tell(message: ActorMessage) {
    this.mailbox.push(message);
    this.processMailbox();
  }

  /**
   * Processes messages strictly one-at-a-time, guaranteeing sequential
   * mutation of internal state even if 10,000 requests hit simultaneously.
   */
  private async processMailbox() {
    if (this.isProcessing) return; // Prevent concurrent loops
    this.isProcessing = true;

    while (this.mailbox.length > 0) {
      const msg = this.mailbox.shift();
      if (msg) {
        try {
          await this.receive(msg);
        } catch (e) {
          console.error(`[Actor ${this.id}] Crash during message processing:`, e);
          // In Erlang/Akka, this would trigger a Supervisor strategy (Restart/Resume)
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Subclasses implement their own behavior here.
   */
  protected abstract receive(message: ActorMessage): Promise<void> | void;
}
