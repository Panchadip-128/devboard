import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEVELOPERS = [
  'alice', 'bob', 'charlie', 'diana', 'eve',
  'frank', 'grace', 'heidi', 'ivan', 'judy',
  'karl', 'liam', 'maya', 'nina', 'oscar',
];

const REPO_NAMES = [
  { name: 'api-gateway', fullName: 'acme-corp/api-gateway' },
  { name: 'web-client', fullName: 'acme-corp/web-client' },
  { name: 'auth-service', fullName: 'acme-corp/auth-service' },
  { name: 'data-pipeline', fullName: 'acme-corp/data-pipeline' },
  { name: 'mobile-app', fullName: 'acme-corp/mobile-app' },
  { name: 'infra-config', fullName: 'acme-corp/infra-config' },
  { name: 'ml-engine', fullName: 'acme-corp/ml-engine' },
  { name: 'notification-svc', fullName: 'acme-corp/notification-svc' },
];

const TEAM_NAMES = [
  { name: 'Platform Engineering', slug: 'platform-eng' },
  { name: 'Product Frontend', slug: 'product-frontend' },
  { name: 'Data Infrastructure', slug: 'data-infra' },
];

const PR_TITLES = [
  'feat: Add rate limiting middleware',
  'fix: Resolve memory leak in connection pool',
  'refactor: Extract auth logic into service layer',
  'feat: Implement WebSocket fallback for SSE',
  'fix: Race condition in concurrent queue processing',
  'chore: Upgrade Prisma to v5.22',
  'feat: Add retry logic with exponential backoff',
  'fix: N+1 query in team members endpoint',
  'feat: Implement cursor-based pagination',
  'refactor: Migrate from REST to tRPC internally',
  'feat: Add OpenTelemetry tracing spans',
  'fix: Timezone handling in DORA calculations',
  'feat: GraphQL subscriptions for live metrics',
  'fix: Deadlock in pg-boss SKIP LOCKED under load',
  'chore: Add integration test suite for webhooks',
];

const INCIDENT_TITLES = [
  'API Gateway 502 errors spike',
  'Database connection pool exhausted',
  'Auth service returning 401 for valid tokens',
  'Deployment pipeline stuck in pending state',
  'Memory usage exceeding 90% on worker nodes',
  'SSE stream disconnecting after 30 seconds',
  'Webhook events dropped during traffic burst',
  'Search indexer lagging behind by 2 hours',
];

const ROOT_CAUSES = [
  'Connection pool misconfiguration',
  'Memory leak in third-party dependency',
  'Race condition under high concurrency',
  'Expired TLS certificate',
  'Misconfigured load balancer health check',
  'Database migration left dangling locks',
  'Unhandled exception in error middleware',
];

function randomDate(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
}

function weightedRandomHour(): number {
  // 70% chance of work hours (9-18), 20% evening (18-22), 10% late night (22-4)
  const rand = Math.random();
  if (rand < 0.70) return 9 + Math.floor(Math.random() * 9);
  if (rand < 0.90) return 18 + Math.floor(Math.random() * 4);
  return (22 + Math.floor(Math.random() * 6)) % 24;
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('Cleaning existing data...');
  await prisma.incidentUpdate.deleteMany();
  await prisma.incident.deleteMany();
  await prisma.deployment.deleteMany();
  await prisma.commit.deleteMany();
  await prisma.pullRequest.deleteMany();
  await prisma.issue.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.repository.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();

  console.log('Seeding teams...');
  const teams = await Promise.all(
    TEAM_NAMES.map((t) =>
      prisma.team.create({ data: { name: t.name, slug: t.slug } })
    )
  );

  console.log('Seeding repositories...');
  const repos = await Promise.all(
    REPO_NAMES.map((r, i) =>
      prisma.repository.create({
        data: {
          githubId: 100000 + i,
          name: r.name,
          fullName: r.fullName,
          url: `https://github.com/${r.fullName}`,
          teamId: teams[i % teams.length].id,
        },
      })
    )
  );

  console.log('Seeding commits (2000+)...');
  const commitData = [];
  for (let i = 0; i < 2200; i++) {
    const date = randomDate(90);
    date.setHours(weightedRandomHour());
    commitData.push({
      sha: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}${i}`,
      repositoryId: randomElement(repos).id,
      authorId: randomElement(DEVELOPERS),
      message: `commit ${i}: ${randomElement(PR_TITLES).replace(/^(feat|fix|chore|refactor): /, '')}`,
      createdAt: date,
    });
  }
  await prisma.commit.createMany({ data: commitData });

  console.log('Seeding pull requests (250+)...');
  const prData = [];
  for (let i = 0; i < 260; i++) {
    const created = randomDate(90);
    const isMerged = Math.random() > 0.15;
    const mergeDelay = Math.floor(Math.random() * 72) + 2; // 2-74 hours
    const merged = isMerged ? new Date(created.getTime() + mergeDelay * 3600000) : null;
    const reviewRequested = new Date(created.getTime() + Math.random() * 3600000);
    const reviewDelay = Math.floor(Math.random() * 48) + 1;
    const reviewed = isMerged ? new Date(reviewRequested.getTime() + reviewDelay * 3600000) : null;

    prData.push({
      githubId: 200000 + i,
      repositoryId: randomElement(repos).id,
      number: 100 + i,
      title: randomElement(PR_TITLES),
      state: isMerged ? 'closed' : 'open',
      authorId: randomElement(DEVELOPERS),
      mergedAt: merged,
      closedAt: merged,
      reviewRequestedAt: reviewRequested,
      reviewedAt: reviewed,
      createdAt: created,
      updatedAt: merged || created,
    });
  }
  await prisma.pullRequest.createMany({ data: prData });

  console.log('Seeding deployments (80+)...');
  const deployData = [];
  for (let i = 0; i < 85; i++) {
    const created = randomDate(90);
    deployData.push({
      githubId: 300000 + i,
      repositoryId: randomElement(repos).id,
      environment: randomElement(['production', 'staging', 'preview']),
      status: Math.random() > 0.1 ? 'success' : 'failure',
      createdAt: created,
      updatedAt: created,
    });
  }
  await prisma.deployment.createMany({ data: deployData });

  console.log('Seeding incidents with timelines...');
  for (let i = 0; i < 12; i++) {
    const opened = randomDate(90);
    const isResolved = Math.random() > 0.2;
    const resolutionHours = Math.floor(Math.random() * 24) + 1;
    const resolved = isResolved
      ? new Date(opened.getTime() + resolutionHours * 3600000)
      : null;

    const incident = await prisma.incident.create({
      data: {
        githubId: 400000 + i,
        repositoryId: randomElement(repos).id,
        title: randomElement(INCIDENT_TITLES),
        state: isResolved ? 'resolved' : 'open',
        severity: randomElement(['low', 'medium', 'high', 'critical']),
        rootCause: isResolved ? randomElement(ROOT_CAUSES) : null,
        postmortem: isResolved
          ? `## Summary\nThis incident was caused by ${randomElement(ROOT_CAUSES).toLowerCase()}. The issue was detected via our anomaly detection engine and resolved within ${resolutionHours} hours.\n\n## Impact\nApproximately ${Math.floor(Math.random() * 500) + 50} requests were affected during the outage window.\n\n## Lessons Learned\n- Improved monitoring coverage for the affected service\n- Added circuit breaker pattern to prevent cascading failures`
          : null,
        actionItems: isResolved
          ? ['Add alerting threshold for this metric', 'Write regression test', 'Update runbook']
          : [],
        openedAt: opened,
        resolvedAt: resolved,
      },
    });

    // Create timeline updates for each incident
    const statuses = isResolved
      ? ['investigating', 'identified', 'monitoring', 'resolved']
      : ['investigating', 'identified'];

    let updateTime = new Date(opened);
    for (const status of statuses) {
      await prisma.incidentUpdate.create({
        data: {
          incidentId: incident.id,
          status,
          message: status === 'investigating'
            ? `Alert triggered. Team is investigating the root cause of "${incident.title}".`
            : status === 'identified'
            ? `Root cause identified: ${randomElement(ROOT_CAUSES)}.`
            : status === 'monitoring'
            ? 'Fix deployed. Monitoring metrics for regression.'
            : 'Incident resolved. All systems nominal.',
          authorId: randomElement(DEVELOPERS),
          createdAt: updateTime,
        },
      });
      updateTime = new Date(updateTime.getTime() + Math.floor(Math.random() * 3) * 3600000 + 1800000);
    }
  }

  console.log('Seeding sprints with issues...');
  for (let t = 0; t < teams.length; t++) {
    for (let s = 0; s < 3; s++) {
      const start = new Date();
      start.setDate(start.getDate() - (s + 1) * 14);
      const end = new Date(start);
      end.setDate(end.getDate() + 14);

      const sprint = await prisma.sprint.create({
        data: {
          name: `Sprint ${3 - s}`,
          teamId: teams[t].id,
          startDate: start,
          endDate: end,
        },
      });

      const issueCount = Math.floor(Math.random() * 8) + 8;
      for (let i = 0; i < issueCount; i++) {
        const created = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        const isClosed = Math.random() > 0.25;
        const labels = ['feature', 'bug', 'blocked', 'tech-debt', 'documentation'];
        const selectedLabels = [randomElement(labels)];
        if (Math.random() > 0.7) selectedLabels.push(randomElement(labels));

        await prisma.issue.create({
          data: {
            githubId: 500000 + t * 100 + s * 20 + i,
            repositoryId: randomElement(repos).id,
            number: 200 + t * 100 + s * 20 + i,
            title: `${randomElement(['Implement', 'Fix', 'Refactor', 'Add', 'Remove'])} ${randomElement(['auth flow', 'search index', 'caching layer', 'API endpoint', 'UI component', 'database migration'])}`,
            state: isClosed ? 'closed' : 'open',
            labels: selectedLabels,
            createdAt: created,
            closedAt: isClosed ? new Date(created.getTime() + Math.random() * 7 * 86400000) : null,
            sprintId: sprint.id,
          },
        });
      }
    }
  }

  console.log('Seed complete.');
  const counts = await Promise.all([
    prisma.team.count(),
    prisma.repository.count(),
    prisma.commit.count(),
    prisma.pullRequest.count(),
    prisma.deployment.count(),
    prisma.incident.count(),
    prisma.incidentUpdate.count(),
    prisma.sprint.count(),
    prisma.issue.count(),
  ]);

  console.log(`  Teams: ${counts[0]}`);
  console.log(`  Repositories: ${counts[1]}`);
  console.log(`  Commits: ${counts[2]}`);
  console.log(`  Pull Requests: ${counts[3]}`);
  console.log(`  Deployments: ${counts[4]}`);
  console.log(`  Incidents: ${counts[5]}`);
  console.log(`  Incident Updates: ${counts[6]}`);
  console.log(`  Sprints: ${counts[7]}`);
  console.log(`  Issues: ${counts[8]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
