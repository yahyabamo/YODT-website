const fs = require('fs');
const SUPABASE_URL = "https://yiehmevcbfahyantgmbh.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZWhtZXZjYmZhaHlhbnRnbWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1Mzg2NDAsImV4cCI6MjA4NzExNDY0MH0.YRYbKYjGOznhaBO8WxseO4-lE5FIL0Ji3DfRuqAE9Ns";

async function fetchSchema() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });
        const schema = await response.json();
        fs.writeFileSync('schema_dump.json', JSON.stringify(schema, null, 2));
        console.log("Schema dumped to schema_dump.json");

        const allTables = Object.keys(schema.definitions);
        console.log("Total tables found:", allTables.length);

        const targets = ['profiles', 'activities', 'likes', 'comments', 'point_history', 'points_histories', 'points_history'];
        targets.forEach(t => {
            if (allTables.includes(t)) {
                console.log(`Table exists: ${t}`);
            }
        });
    } catch (error) {
        console.error('Error fetching schema:', error);
    }
}

fetchSchema();
