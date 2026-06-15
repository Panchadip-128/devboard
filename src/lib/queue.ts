import PgBoss from 'pg-boss';

const boss = new PgBoss(process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres');

boss.on('error', (error) => console.error('pg-boss error:', error));

let isStarted = false;

export async function getQueue() {
  if (!isStarted) {
    await boss.start();
    isStarted = true;
  }
  return boss;
}
