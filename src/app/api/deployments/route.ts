import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const deployments = await prisma.deployment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      repository: true,
    }
  });

  return NextResponse.json(deployments);
}
