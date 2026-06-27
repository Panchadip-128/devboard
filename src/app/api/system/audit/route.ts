import { NextResponse } from 'next/server';
import { MerkleAudit } from '@/lib/crypto/MerkleAudit';

export async function GET() {
  const audit = MerkleAudit.getInstance();
  const chain = audit.getChain();
  const isValid = audit.verifyChain();

  return NextResponse.json({
    isValid,
    totalRecords: chain.length,
    chain
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventType, payload } = body;
    
    if (!eventType || !payload) {
      return NextResponse.json({ error: 'Missing eventType or payload' }, { status: 400 });
    }

    const audit = MerkleAudit.getInstance();
    const record = audit.appendRecord(eventType, payload);

    return NextResponse.json(record);
  } catch (e) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
