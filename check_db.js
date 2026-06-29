const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const deployments = await prisma.deployment.findMany();
  console.log("Deployments in DB:", deployments);
  
  const repos = await prisma.repository.findMany();
  console.log("Repos in DB:", repos);
}
run().finally(() => prisma.$disconnect());
