
import { queryTenantDb } from "./db.js";
import path from "path";
import fs from "fs";

// Read JSON file path from CLI
const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: node test-db.js <path_to_json_file>");
    process.exit(1);
}

// Convert to absolute path
const resolvedPath = path.resolve(filePath);

// Validate file exists
if (!fs.existsSync(resolvedPath)) {
    console.error(`JSON file not found: ${resolvedPath}`);
    process.exit(1);
}

async function test() {
    try {
        console.log(`Testing tenant DB using file: ${resolvedPath}\n`);

        // Show tables
        const [tables] = await queryTenantDb(resolvedPath, "SHOW TABLES;");
        console.log("Tables in DB:");
        console.table(tables);

        // Select data
        const [rows] = await queryTenantDb(resolvedPath, "SELECT * FROM users;");
        console.log("Query Result:");
        console.table(rows);

    } catch (err) {
        console.error("ERROR:", err.message);
    }
}

test();
