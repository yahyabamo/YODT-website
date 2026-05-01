import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function checkTable(table) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  if (!res.ok) {
    console.log(`Table ${table} failed: ${res.status} ${await res.text()}`);
  } else {
    const data = await res.json();
    console.log(`Table ${table} exists! Data:`, data);
  }
}

async function run() {
  await checkTable('job_applications');
}
run();
