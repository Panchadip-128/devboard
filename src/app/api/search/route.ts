import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const query = {
    contains: q,
    mode: 'insensitive' as const,
  };

  try {
    const [users, teams, repositories, incidents] = await Promise.all([
      prisma.user.findMany({
        where: { name: query },
        select: { id: true, name: true, email: true },
        take: 5,
      }),
      prisma.team.findMany({
        where: { name: query },
        select: { id: true, name: true },
        take: 5,
      }),
      prisma.repository.findMany({
        where: { name: query },
        select: { id: true, name: true, url: true },
        take: 5,
      }),
      prisma.incident.findMany({
        where: { title: query },
        select: { id: true, title: true, state: true, severity: true },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      users,
      teams,
      repositories,
      incidents,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
