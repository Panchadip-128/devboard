import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  firstName: 'Demo',
  lastName: 'User',
  theme: 'dark',
  twoFactor: true,
  toggles: {
    'Incident Creation (P1/P2)': true,
    'Deployment Success': false,
    'High CPU Utilization (>90%)': true,
    'DevQL Syntax Errors': false
  },
  integrations: {
    'GitHub Enterprise': true,
    'Slack': false,
    'Datadog': false
  }
};

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
    const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch (e: any) {
    if (e.code === 'ENOENT') {
      return NextResponse.json(DEFAULT_SETTINGS);
    }
    return NextResponse.json({ error: 'Failed to read settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await ensureDataDir();
    const body = await req.json();
    
    let current = { ...DEFAULT_SETTINGS };
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf-8');
      current = JSON.parse(data);
    } catch (e) {}

    const newSettings = { ...current, ...body };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
