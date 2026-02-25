import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
    'https://yiehmevcbfahyantgmbh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZWhtZXZjYmZhaHlhbnRnbWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg2NDAsImV4cCI6MjA4NzExNDY0MH0.YRYbKYjGOznhaBO8WxseO4-lE5FIL0Ji3DfRuqAE9Ns'
);

async function run() {
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'Password123!';

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: 'Test Agent User 3', gender: 'male' },
        },
    });

    if (error) {
        fs.writeFileSync('result2.json', JSON.stringify({ error: error.message }));
        return;
    }

    await new Promise(r => setTimeout(r, 2000));

    // Fetch users like the dashboard does
    const { data: fetchUsersData, error: fetchError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, status, total_points, university, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .limit(5);

    fs.writeFileSync('result2.json', JSON.stringify({ fetchUsersData, fetchError }, null, 2));
}

run();
