import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://yiehmevcbfahyantgmbh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZWhtZXZjYmZhaHlhbnRnbWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg2NDAsImV4cCI6MjA4NzExNDY0MH0.YRYbKYjGOznhaBO8WxseO4-lE5FIL0Ji3DfRuqAE9Ns'
);

async function run() {
    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
    console.log("LAST 10 PROFILES (by created_at desc):");
    console.table(data);

    // Also query if there are any profiles with null created_at
    const { data: nullDates } = await supabase
        .from('profiles')
        .select('id, full_name, role, status, created_at')
        .is('created_at', null)
        .limit(10);
    console.log("PROFILES WITH NULL CREATED_AT:");
    console.table(nullDates);

    // Check auth table if possible (with anon key we probably can't, but we can try)
}

run();
