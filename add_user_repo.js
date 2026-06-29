const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addRepo() {
  const team = await prisma.team.findFirst();
  if (!team) {
    console.log("No teams found in db!");
    return;
  }
  
  let repo = await prisma.repository.findFirst({ where: { fullName: 'Panchadip-128/devboard' } });
  if (!repo) {
    repo = await prisma.repository.create({
      data: {
        githubId: 888888,
        name: 'devboard',
        fullName: 'Panchadip-128/devboard',
        url: 'https://github.com/Panchadip-128/devboard',
        teamId: team.id
      }
    });
  }

  let repo2 = await prisma.repository.findFirst({ where: { fullName: 'Panchadip-128/dev-board' } });
  if (!repo2) {
    repo2 = await prisma.repository.create({
      data: {
        githubId: 888889,
        name: 'dev-board',
        fullName: 'Panchadip-128/dev-board',
        url: 'https://github.com/Panchadip-128/dev-board',
        teamId: team.id
      }
    });
  }
  
  console.log("Added user repos successfully:", repo.fullName, repo2.fullName);
}

addRepo().finally(() => prisma.$disconnect());
