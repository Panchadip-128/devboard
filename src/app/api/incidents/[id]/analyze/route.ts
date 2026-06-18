import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';
import redis from '@/lib/redis';

// Initialize the Gemini client. It automatically picks up GEMINI_API_KEY from the environment.
const ai = new GoogleGenAI({});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const incident = await prisma.incident.findUnique({
      where: { id },
      include: { repository: true },
    });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    // Fetch recent context (commits and deployments before the incident)
    const [recentCommits, recentDeployments] = await Promise.all([
      prisma.commit.findMany({
        where: {
          repositoryId: incident.repositoryId,
          createdAt: { lte: incident.openedAt },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { message: true, authorId: true, createdAt: true },
      }),
      prisma.deployment.findMany({
        where: {
          repositoryId: incident.repositoryId,
          createdAt: { lte: incident.openedAt },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { environment: true, status: true, createdAt: true },
      }),
    ]);

    const prompt = `
      You are a senior DevOps engineer analyzing a production incident.
      
      Incident Title: ${incident.title}
      Severity: ${incident.severity}
      Opened At: ${incident.openedAt.toISOString()}
      Repository: ${incident.repository?.name || 'Unknown'}

      Recent Commits (leading up to incident):
      ${recentCommits.map(c => `- ${c.message} (by ${c.authorId} at ${c.createdAt.toISOString()})`).join('\n')}

      Recent Deployments:
      ${recentDeployments.map(d => `- Env: ${d.environment}, Status: ${d.status} at ${d.createdAt.toISOString()}`).join('\n')}

      Based on the context above, write a brief, plausible root cause hypothesis (max 2-3 sentences). Focus on likely correlations between the commits/deployments and the incident title. Do not invent errors that aren't hinted at by the commit messages.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const generatedRootCause = response.text;

    // Update the incident with the new root cause
    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: { rootCause: generatedRootCause },
    });

    // Fire real-time event to connected SSE clients
    await redis.publish('realtime-updates', JSON.stringify({
      type: 'incident_analyzed',
      incidentId: id,
      title: updatedIncident.title
    }));

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Failed to analyze incident:', error);
    return NextResponse.json({ error: 'Failed to generate root cause analysis' }, { status: 500 });
  }
}
