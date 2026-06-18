import { getQueue } from '@/lib/queue';
import prisma from '@/lib/prisma';

export async function startGithubWorker() {
  const queue = await getQueue();

  await queue.work('github-webhook', async ([job]: any[]) => {
    const { eventType, payload } = job.data as { eventType: string; payload: any };
    
    try {
      // Find repo
      const repoName = payload.repository?.full_name;
      if (!repoName) return;

      const repository = await prisma.repository.findFirst({
        where: { fullName: repoName }
      });

      if (!repository) {
        console.warn(`Repository ${repoName} not found in DB`);
        return;
      }

      // Day 3: Event Normalization
      if (eventType === 'pull_request') {
        const pr = payload.pull_request;
        await prisma.pullRequest.upsert({
          where: { githubId: pr.id },
          update: {
            state: pr.state,
            title: pr.title,
            mergedAt: pr.merged_at ? new Date(pr.merged_at) : null,
            closedAt: pr.closed_at ? new Date(pr.closed_at) : null,
            updatedAt: new Date(pr.updated_at),
          },
          create: {
            githubId: pr.id,
            repositoryId: repository.id,
            number: pr.number,
            title: pr.title,
            state: pr.state,
            authorId: pr.user.login,
            createdAt: new Date(pr.created_at),
            updatedAt: new Date(pr.updated_at),
          }
        });
      }

      if (eventType === 'push') {
        const commits = payload.commits || [];
        for (const commit of commits) {
          await prisma.commit.upsert({
            where: { sha: commit.id },
            update: {},
            create: {
              sha: commit.id,
              repositoryId: repository.id,
              authorId: commit.author.username || commit.author.name,
              message: commit.message,
              createdAt: new Date(commit.timestamp),
            }
          });
        }
      }

      if (eventType === 'deployment_status') {
        const status = payload.deployment_status;
        const deployment = payload.deployment;
        
        await prisma.deployment.upsert({
          where: { githubId: deployment.id },
          update: {
            status: status.state,
            updatedAt: new Date(status.updated_at),
          },
          create: {
            githubId: deployment.id,
            repositoryId: repository.id,
            environment: deployment.environment,
            status: status.state,
            createdAt: new Date(deployment.created_at),
            updatedAt: new Date(status.updated_at),
          }
        });
      }

    } catch (error) {
      console.error('Error processing github webhook job', error);
      throw error;
    }
  });
}
