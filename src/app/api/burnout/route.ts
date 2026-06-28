import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { predictWorkloadRisk } from '@/lib/metrics/workload';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});

export async function GET() {
  // Get unique authors who have committed in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCommits = await prisma.commit.groupBy({
      by: ['authorId'],
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      _count: { id: true }
    });

    const { ActorSystem } = await import('@/lib/actor/ActorSystem');
    const system = ActorSystem.getInstance();

    const results = await Promise.all(
      recentCommits.map(async c => {
        const dbRisk = await predictWorkloadRisk(c.authorId, 30);
        
        // Phase 6: Fetch real-time state from isolated Actor memory
        const actor = system.getOrCreateDeveloper(c.authorId);
        const actorState = actor.getSnapshot();
        
        const finalScore = dbRisk.score + actorState.burnoutScore;
        let finalRisk = 'LOW';
        if (finalScore >= 80) finalRisk = 'CRITICAL';
        else if (finalScore >= 60) finalRisk = 'HIGH';
        else if (finalScore >= 40) finalRisk = 'MEDIUM';

        return {
          ...dbRisk,
          score: finalScore,
          risk: finalRisk,
          actorState: actorState
        };
      })
    );

    // Aggregate counts
    let healthyCount = 0;
    let mediumCount = 0;
    let criticalCount = 0;

    results.forEach(r => {
      if (r.risk === 'CRITICAL' || r.risk === 'HIGH') criticalCount++;
      else if (r.risk === 'MEDIUM') mediumCount++;
      else healthyCount++;
    });

    // Generate AI Summary
    let aiSummary = "Team health is stable.";
    try {
      const prompt = `
        You are an Engineering Manager reviewing a team burnout report based on the last 30 days of git commit data.
        - Developers with LOW risk (Healthy): ${healthyCount}
        - Developers with MEDIUM risk: ${mediumCount}
        - Developers with HIGH/CRITICAL risk (Burnout warning): ${criticalCount}
        
        Write a 2-3 sentence executive summary explaining the team's health and suggesting an actionable next step for the engineering team.
        Keep it professional, empathetic, and concise. Do not use markdown formatting.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      aiSummary = response.text || aiSummary;
    } catch (e) {
      console.error("AI Summary generation failed:", e);
    }

    const distribution = [
      { name: 'Healthy', value: healthyCount, color: 'emerald' },
      { name: 'At Risk (Medium)', value: mediumCount, color: 'amber' },
      { name: 'Burnout (Critical)', value: criticalCount, color: 'rose' }
    ].filter(d => d.value > 0);

    return NextResponse.json({
      summary: aiSummary,
      distribution,
      developers: results.sort((a, b) => b.score - a.score)
    });
}
