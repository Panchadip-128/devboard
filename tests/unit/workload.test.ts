import { describe, it, expect, vi } from 'vitest';
import { predictWorkloadRisk } from '@/lib/metrics/workload';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    commit: {
      findMany: vi.fn(),
    },
  },
}));

describe('predictWorkloadRisk', () => {
  it('returns UNKNOWN if no commits are found', async () => {
    vi.mocked(prisma.commit.findMany).mockResolvedValue([]);
    const result = await predictWorkloadRisk('user-1');
    expect(result.risk).toBe('UNKNOWN');
    expect(result.score).toBe(0);
  });

  it('calculates CRITICAL risk based on excessive late night and weekend commits', async () => {
    // Simulate 10 commits: 5 on weekends, 5 during late nights
    const mockCommits = Array(10).fill({}).map((_, i) => {
      // Create a Sunday date (e.g. 2023-10-01) at 11 PM
      const date = new Date('2023-10-01T23:00:00Z'); 
      return { createdAt: date };
    });
    
    vi.mocked(prisma.commit.findMany).mockResolvedValue(mockCommits as any);
    const result = await predictWorkloadRisk('user-2');
    
    // 100% weekend + 100% late night = score of 100
    expect(result.risk).toBe('CRITICAL');
    expect(result.score).toBe(100);
  });

  it('calculates LOW risk for normal work hours', async () => {
    const mockCommits = Array(10).fill({}).map((_, i) => {
      // Create a Tuesday date (e.g. 2023-10-03) at 2 PM
      const date = new Date('2023-10-03T14:00:00Z'); 
      return { createdAt: date };
    });
    
    vi.mocked(prisma.commit.findMany).mockResolvedValue(mockCommits as any);
    const result = await predictWorkloadRisk('user-3');
    
    expect(result.risk).toBe('LOW');
    expect(result.score).toBe(0);
  });
});
