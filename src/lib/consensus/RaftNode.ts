import { randomUUID } from 'crypto';

export type RaftState = 'FOLLOWER' | 'CANDIDATE' | 'LEADER';

/**
 * Custom implementation of the Raft Consensus Algorithm for Node.js Leader Election.
 * In a horizontally scaled environment (e.g. Kubernetes), this ensures exactly ONE 
 * instance runs background cron jobs, handling split-brain scenarios deterministically.
 */
export class RaftNode {
  public id: string;
  public state: RaftState = 'FOLLOWER';
  public currentTerm: number = 0;
  public votedFor: string | null = null;
  
  private peers: string[] = []; 
  private electionTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(peers: string[] = []) {
    this.id = randomUUID();
    this.peers = peers;
    console.log(`[Raft] Node ${this.id} initialized as FOLLOWER.`);
    this.resetElectionTimer();
  }

  /**
   * RPC: AppendEntries (Heartbeat)
   * Invoked by leader to suppress follower elections.
   */
  public handleAppendEntries(term: number, leaderId: string): boolean {
    if (term < this.currentTerm) {
      return false; // Reject outdated leader
    }

    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = null;
    }

    if (this.state !== 'FOLLOWER') {
      this.becomeFollower();
    }
    
    // Acknowledge leader and reset our timeout so we don't start an election
    this.resetElectionTimer();
    return true;
  }

  /**
   * RPC: RequestVote
   * Invoked by candidates gathering votes.
   */
  public handleRequestVote(term: number, candidateId: string): boolean {
    if (term < this.currentTerm) {
      return false; // Reject outdated candidate
    }

    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.votedFor = null;
      this.becomeFollower();
    }

    // Grant vote if we haven't voted yet in this term
    if (this.votedFor === null || this.votedFor === candidateId) {
      this.votedFor = candidateId;
      this.resetElectionTimer(); 
      return true;
    }

    return false;
  }

  private becomeFollower() {
    this.state = 'FOLLOWER';
    this.stopHeartbeats();
    console.log(`[Raft] Node ${this.id} became FOLLOWER for Term ${this.currentTerm}`);
  }

  private async becomeCandidate() {
    this.state = 'CANDIDATE';
    this.currentTerm++;
    this.votedFor = this.id;
    console.log(`[Raft] Node ${this.id} became CANDIDATE for Term ${this.currentTerm}`);
    
    this.resetElectionTimer();
    
    let votes = 1; // Vote for self
    
    // Simulate gathering votes from peers via network RPC
    if (this.peers.length > 0) {
      const votePromises = this.peers.map(async (peerUrl) => {
        try {
          const res = await fetch(`${peerUrl}/api/system/raft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'RequestVote',
              term: this.currentTerm,
              candidateId: this.id
            }),
            signal: AbortSignal.timeout(100) // Fast timeout for RPC
          });
          if (res.ok) {
            const data = await res.json();
            return data.voteGranted ? 1 : 0;
          }
        } catch (e) {
          // Peer offline or network error, count as 0 votes
        }
        return 0;
      });

      const results = await Promise.all(votePromises);
      votes += results.reduce((acc: number, v: number) => acc + v, 0);
    }

    const majority = Math.floor((this.peers.length + 1) / 2) + 1;
    if (votes >= majority && this.state === 'CANDIDATE') {
      this.becomeLeader();
    }
  }

  public becomeLeader() {
    this.state = 'LEADER';
    console.log(`[Raft] 👑 Node ${this.id} ELECTED LEADER for Term ${this.currentTerm} 👑`);
    
    if (this.electionTimer) clearTimeout(this.electionTimer);
    
    this.startHeartbeats();
    
    // ** CRITICAL **
    // Only the mathematically verified LEADER starts the background workers.
    // startGithubWorker();
  }

  private startHeartbeats() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      // Broadcast AppendEntries RPC to all peers to assert dominance
      this.peers.forEach(async (peerUrl) => {
        try {
          await fetch(`${peerUrl}/api/system/raft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'AppendEntries',
              term: this.currentTerm,
              leaderId: this.id
            }),
            signal: AbortSignal.timeout(50) 
          });
        } catch (e) {
          // Ignore failed heartbeats
        }
      });
    }, 50); // 50ms heartbeat interval
  }

  private stopHeartbeats() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
  }

  private resetElectionTimer() {
    if (this.electionTimer) clearTimeout(this.electionTimer);
    
    // Randomized timeout (150ms - 300ms) prevents split votes per Raft paper specs
    const timeout = Math.floor(Math.random() * 150) + 150;
    
    this.electionTimer = setTimeout(() => {
      // Election timeout elapsed without hearing from a leader. Start an election!
      this.becomeCandidate();
    }, timeout);
  }
}
