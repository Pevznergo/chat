
import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

async function checkSchemas() {
  const sql = postgres(process.env.POSTGRES_URL!, { max: 1 });
  
  try {
    const invites = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'invites'
    `;
    console.log('Invites Table:', invites);

    const referrals = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'referrals'
    `;
    console.log('Referrals Table:', referrals);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.end();
  }
}

checkSchemas();
