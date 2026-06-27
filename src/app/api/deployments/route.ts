import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const deployments = await prisma.deployment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        repository: true,
      }
    });

    return NextResponse.json(deployments);
  } catch (error) {
    console.warn('Database offline. Falling back to Demo Mode for Deployments:', error);
    
    // Demo Mock Fallback for Causal Ordering
    const mockDeployments = [
      {
        id: 'dep_1',
        status: 'SUCCESS',
        environment: 'production',
        createdAt: new Date().toISOString(),
        repository: { name: 'dev-board-core' }
      },
      {
        id: 'dep_2',
        status: 'IN_PROGRESS',
        environment: 'staging',
        createdAt: new Date(Date.now() - 60000).toISOString(),
        repository: { name: 'auth-service' }
      }
    ];

    return NextResponse.json(mockDeployments);
  }
}
