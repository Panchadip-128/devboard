import { NextRequest, NextResponse } from 'next/server';
import { ActorSystem } from '@/lib/actor/ActorSystem';

/**
 * Phase 6 Endpoint: Interactive testing for the Distributed Actor Model.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const system = ActorSystem.getInstance();

    if (body.type === 'SEND_MESSAGE') {
      const { devId, messageType } = body.payload;
      
      // Send async message (fire and forget, no database locks)
      system.send(`dev_${devId}`, { type: messageType });
      
      return NextResponse.json({ success: true, message: `Message ${messageType} routed to dev_${devId} mailbox` });
    } 
    else if (body.type === 'GET_STATE') {
      const { devId } = body.payload;
      
      // Lazily instantiate if not exists
      const actor = system.getOrCreateDeveloper(devId);
      
      return NextResponse.json({ 
        actorId: actor.id,
        state: actor.getSnapshot(),
        message: 'State retrieved directly from Actor RAM (No Database Query)'
      });
    }

    return NextResponse.json({ error: 'Invalid command' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
