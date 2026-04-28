import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Fetching all ads directly from DB...');
  const { data: allAds, error: allErr } = await supabase.from('site_ads').select('*');
  if (allErr) {
    console.error('Error fetching all ads:', allErr);
  } else {
    console.log('All ads in DB:', allAds);
  }
}

main();
