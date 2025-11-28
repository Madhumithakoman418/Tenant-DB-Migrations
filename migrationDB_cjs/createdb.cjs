require("dotenv").config();
const mysql = require("mysql2/promise");
const readline = require("readline");
const crypto = require("crypto");
const fs = require("fs");
const config = require("./knexfile.cjs");
const { createKnexClient, runWithRetries } = require("./dbHelpers.cjs");

// -------- Generate Strong Password --------
function generateStrongPassword() {
    return crypto.randomBytes(12)
        .toString("base64")
        .replace(/[^a-zA-Z0-9!@#$%^&*()_+=-]/g, "")
        .slice(0, 16);
}

// -------- Ask Organization Name --------
function askOrgName() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise(resolve =>
        rl.question("Enter Organization Name: ", ans => {
            rl.close();
            resolve(ans.trim().toLowerCase());
        })
    );
}

// -------- Check / Create DB / User / Save secrets --------
async function databaseExists(conn, db) {
    const [rows] = await conn.query(
        "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?",
        [db]
    );
    return rows.length > 0;
}

async function createDatabaseIfNotExists(conn, db) {
    if (!(await databaseExists(conn, db))) {
        await conn.query(`CREATE DATABASE \`${db}\``);
    }
}

async function createTenantUser(conn, username, password, db) {
    await conn.query(`CREATE USER IF NOT EXISTS '${username}'@'%' IDENTIFIED BY '${password}'`);
    await conn.query(`GRANT ALL PRIVILEGES ON \`${db}\`.* TO '${username}'@'%'`);
    await conn.query("FLUSH PRIVILEGES");
}

function saveTenantSecrets(org, user, pass) {
    if (!fs.existsSync("secrets")) fs.mkdirSync("secrets");
    fs.writeFileSync(`secrets/${org}.json`, JSON.stringify({
        organization: org,
        tenant_username: user,
        tenant_password: pass,
        created_at: new Date().toISOString()
    }, null, 4));
}

// ==========================
// MAIN PROCESS
// ==========================
async function run() {
    const orgName = await askOrgName();

    const tenantDbName = `${orgName}_db`;
    const tenantUser = `${orgName}_user`;
    const tenantPass = generateStrongPassword();

    saveTenantSecrets(orgName, tenantUser, tenantPass);

    const root = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: process.env.DB_PORT
    });

    // -------- TENANT DB CHECK --------
    const tenantExists = await databaseExists(root, tenantDbName);

    if (!tenantExists) {
        console.log(`Creating tenant DB: ${tenantDbName}`);
        await createDatabaseIfNotExists(root, tenantDbName);

        console.log(`Creating tenant user: ${tenantUser}`);
        await createTenantUser(root, tenantUser, tenantPass, tenantDbName);

        console.log(`Tenant DB and user created: ${tenantDbName}`);
    } else {
        console.log(`Tenant DB already exists. Skipped: ${tenantDbName}`);
    }

    await root.end();

    // -------- TENANT MIGRATIONS --------
    console.log(`Running tenant migrations on ${tenantDbName} ...`);
    const { instance: tenantDb } = createKnexClient({
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            user: tenantUser,
            password: tenantPass,
            database: tenantDbName,
            port: process.env.DB_PORT
        },
        migrations: config.tenant.migrations
    });

    await runWithRetries(() => tenantDb.migrate.latest(), "tenant");
    await tenantDb.destroy();

    console.log("Tenant provisioning complete.");
}

run().catch(err => console.error("ERROR:", err));
