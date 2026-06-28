import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), '.data');
const KEYS_FILE = path.join(DATA_DIR, 'keys.json');

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function GET() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(KEYS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return NextResponse.json([
        { id: 'default_1', name: 'Production CI/CD', token: 'devboard_prod_8f92...', lastUsed: '2 minutes ago' }
      ]);
    }
    return NextResponse.json({ error: 'Failed to read keys' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await ensureDataDir();
    let keys = [
      { id: 'default_1', name: 'Production CI/CD', token: 'devboard_prod_8f92...', lastUsed: '2 minutes ago' }
    ];
    try {
      const data = await fs.readFile(KEYS_FILE, 'utf-8');
      keys = JSON.parse(data);
    } catch (e) {}

    const token = crypto.randomBytes(32).toString('hex');
    const newKey = {
      id: Date.now().toString(),
      name: 'Generated API Key',
      token: `devboard_live_${token.substring(0, 8)}...`,
      lastUsed: 'Never'
    };

    keys.push(newKey);
    await fs.writeFile(KEYS_FILE, JSON.stringify(keys, null, 2));

    return NextResponse.json({ success: true, key: newKey });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to generate key' }, { status: 500 });
  }
}
