

import { config } from 'dotenv';
config({ path: '.env.local' });
config({ path: '.env' });

import { db } from './lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Adding note column to invites table...');
  try {
    await db.execute(sql`ALTER TABLE invites ADD COLUMN IF NOT EXISTS note text`);
    console.log('Successfully added note column.');
  } catch (error) {
    console.error('Error adding column:', error);
  }
  process.exit(0);
}

main();

