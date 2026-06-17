import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const CreateTeamSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: { select: { id: true, role: true, userId: true } },
        repositories: { select: { id: true, name: true, fullName: true } },
        _count: { select: { members: true, repositories: true, sprints: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ teams, count: teams.length });
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateTeamSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.team.findUnique({ where: { slug: validated.data.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Team slug already exists' }, { status: 409 });
    }

    const team = await prisma.team.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
      },
    });

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Failed to create team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
