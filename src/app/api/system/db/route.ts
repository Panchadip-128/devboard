import { NextRequest, NextResponse } from 'next/server';
import { columnDb } from '@/lib/db/ColumnManager';

/**
 * Phase 5 Endpoint: Interactive testing for the Columnar Database Manager.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.type === 'INSERT') {
      const { riskScore, impact, devId } = body.payload;
      columnDb.insertRow(riskScore, impact, devId);
      return NextResponse.json({ success: true, message: 'Row mapped to columns' });
    } 
    else if (body.type === 'AGGREGATE') {
      const start = performance.now();
      // Read directly from mmap OS file descriptor
      const avg = columnDb.getAverageRiskScore();
      const end = performance.now();
      
      return NextResponse.json({ 
        averageRiskScore: avg,
        executionTimeMs: end - start,
        message: 'Aggregated via Columnar SIMD Simulation'
      });
    }

    return NextResponse.json({ error: 'Invalid command' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
