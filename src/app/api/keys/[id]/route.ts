import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const data = await fs.readFile(KEYS_FILE, 'utf-8');
    let keys = JSON.parse(data);

    const filtered = keys.filter((k: any) => k.id !== params.id);
    await fs.writeFile(KEYS_FILE, JSON.stringify(filtered, null, 2));

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete key' }, { status: 500 });
  }
}
