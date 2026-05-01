import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
  const { data, error } = await supabase.from('service_requests').select('*').limit(1);
  console.log("service_requests error:", error);
  
  const { data: d2, error: e2 } = await supabase.from('suggestions').select('*').limit(1);
  console.log("suggestions error:", e2);
  
  const { data: d3, error: e3 } = await supabase.from('project_submissions').select('*').limit(1);
  console.log("project_submissions error:", e3);
  
}
inspect();
