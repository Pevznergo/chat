
import { config } from 'dotenv';
import postgres from 'postgres';

// Load env vars with precedence: .env.local > .env
config({ path: '.env.local' });
config({ path: '.env' });

const url = process.env.POSTGRES_URL;

console.log('\n🔍 Checking POSTGRES_URL...');

if (!url) {
    console.error('❌ Error: POSTGRES_URL is not defined in .env or .env.local');
    process.exit(1);
}

// Mask password for display
const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');
console.log(`target: ${maskedUrl}`);

if (!url.startsWith('postgres')) {
    console.error('\n❌ Invalid Protocol: URL must start with "postgresql://"');
    console.error('   Current value starts with:', url.split('://')[0] + '://');
    process.exit(1);
}

const sql = postgres(url, { max: 1, connect_timeout: 10 });

async function checkConnection() {
    try {
        console.log('⏳ Attempting to connect...');
        const result = await sql`SELECT 1 as connected`;
        console.log('✅ Connection Sucessful!');
        console.log('   Database responded:', result);
    } catch (err: any) {
        console.error('\n❌ Connection Failed:');
        console.error(`   Message: ${err.message}`);
        console.error(`   Code: ${err.code || 'UNKNOWN'}`);

        if (err.code === 'ENOTFOUND') {
            console.log('\n💡 Tip: ENOTFOUND usually means the hostname is wrong.');
            console.log('   Supabase DB URLs usually start with: postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres');
            console.log('   Check if you are missing "db." before the project ID.');
        }
    } finally {
        await sql.end();
    }
}

checkConnection();
