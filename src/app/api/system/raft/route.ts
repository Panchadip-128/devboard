import { NextRequest, NextResponse } from 'next/server';
import { RaftNode } from '@/lib/consensus/RaftNode';

// Get the global Raft node from the current process memory
const globalSymbol = Symbol.for('global_raft_node');

/**
 * Internal Network RPC Endpoint for Raft Consensus.
 * Other containers in the cluster will hit this endpoint to request votes or send heartbeats.
 */
export async function POST(req: NextRequest) {
  const raftNode = (global as any)[globalSymbol] as RaftNode | undefined;
  
  if (!raftNode) {
    return NextResponse.json({ error: 'Raft consensus not running on this node' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { type, term, candidateId, leaderId } = body;

    // Process RequestVote RPC
    if (type === 'RequestVote') {
      const voteGranted = raftNode.handleRequestVote(term, candidateId);
      return NextResponse.json({ term: raftNode.currentTerm, voteGranted });
    } 
    // Process AppendEntries RPC
    else if (type === 'AppendEntries') {
      const success = raftNode.handleAppendEntries(term, leaderId);
      return NextResponse.json({ term: raftNode.currentTerm, success });
    }

    return NextResponse.json({ error: 'Invalid RPC protocol type' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
