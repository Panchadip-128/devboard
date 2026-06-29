const { PgBoss } = require('pg-boss');
const boss = new PgBoss(process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/devboard?schema=public');
async function run() {
  await boss.start();
  await boss.createQueue('github-webhook');
  await boss.createQueue('dlq-github-webhook');
  console.log('Queues created!');
  process.exit(0);
}
run();
