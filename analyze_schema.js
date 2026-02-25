const fs = require('fs');

function analyze() {
    const schema = JSON.parse(fs.readFileSync('schema_dump.json', 'utf8'));
    const defs = schema.definitions;
    const allTables = Object.keys(defs).sort();

    console.log("--- TABLES LIST ---");
    console.log(allTables.join("\n"));

    const targets = ['profiles', 'activities', 'likes', 'comments', 'point_history', 'points_history', 'activities_log'];

    targets.forEach(t => {
        if (defs[t]) {
            console.log(`\n--- ${t} ---`);
            console.log(Object.keys(defs[t].properties).join(", "));
        } else {
            console.log(`\n--- ${t} (NOT FOUND) ---`);
        }
    });
}

analyze();
