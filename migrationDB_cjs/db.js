
// import fs from "fs";
// import path from "path";
// import mysql from "mysql2/promise";

// // ================================
// //   Dynamic Tenant Connection Pools
// // ================================
// const tenantConnectionPools = new Map();


// // -------------------------------------------
// // Load password from local secrets file
// // secrets/<orgName>.json
// // -------------------------------------------
// function loadLocalPassword(orgName) {
//     const __dirname = path.resolve();
//     const secretsPath = path.join(__dirname, "secrets", `${orgName}.json`);

//     if (!fs.existsSync(secretsPath)) {
//         throw new Error(`Secret file not found: /secrets/${orgName}.json`);
//     }

//     const file = fs.readFileSync(secretsPath, "utf8");
//     const json = JSON.parse(file);

//     if (!json.tenant_password) {
//         throw new Error(`tenant_password missing inside /secrets/${orgName}.json`);
//     }

//     return json.tenant_password;
// }


// // ================================
// //     queryTenantDb()
// // ================================
// export async function queryTenantDb(orgName, sql, params = []) {
//     if (!orgName) {
//         throw new Error("Tenant orgName is required.");
//     }

//     let pool;
//     const databaseName = `${orgName}_db`;

//     // -----------------------------------
//     // Reuse existing pool
//     // -----------------------------------
//     if (tenantConnectionPools.has(orgName)) {
//         pool = tenantConnectionPools.get(orgName);
//     } else {
//         // -----------------------------------
//         // Create new pool
//         // -----------------------------------
//         const password = loadLocalPassword(orgName);
//         const username = `${orgName}_user`;

//         pool = mysql.createPool({
//             host: "127.0.0.1",
//             user: username,
//             password: password,
//             port: 3306,
//             waitForConnections: true,
//             connectionLimit: 10
//         });

//         tenantConnectionPools.set(orgName, pool);
//     }

//     // -----------------------------------
//     // ALWAYS switch DB before running query
//     // -----------------------------------
//     await pool.query(`USE \`${databaseName}\`;`);

//     // -----------------------------------
//     // Run actual query
//     // -----------------------------------
//     return pool.query(sql, params);
// }



// // ================================
// //     queryGlobalDb()
// // ================================
// const globalDbPool = mysql.createPool({
//     host: "127.0.0.1",
//     user: "root",
//     password: "",
//     database: "common_db",
//     port: 3306,
//     waitForConnections: true,
//     connectionLimit: 10
// });

// export function queryGlobalDb(sql, params = []) {
//     return globalDbPool.query(sql, params);
// }
import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

// ================================
//   Dynamic Tenant Connection Pools
// ================================
const tenantConnectionPools = new Map();


// -------------------------------------------
// Load tenant password + orgName from ANY path
// -------------------------------------------
function loadTenantSecretFromFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`Secret file not found at: ${filePath}`);
    }

    const file = fs.readFileSync(filePath, "utf8");
    const json = JSON.parse(file);

    if (!json.organization) {
        throw new Error(`Missing field: organization in ${filePath}`);
    }
    if (!json.tenant_password) {
        throw new Error(`Missing field: tenant_password in ${filePath}`);
    }

    return {
        orgName: json.organization, 
        password: json.tenant_password
    };
}


// ================================
//     queryTenantDb(filePath)
// ================================
export async function queryTenantDb(filePath, sql, params = []) {
    if (!filePath) {
        throw new Error("Secret file path is required.");
    }

    // Load details from JSON file  
    const { orgName, password } = loadTenantSecretFromFile(filePath);
    const username = `${orgName}_user`;
    const databaseName = `${orgName}_db`;

    let pool;

    // Reuse existing pool
    if (tenantConnectionPools.has(orgName)) {
        pool = tenantConnectionPools.get(orgName);
    } else {
        // Create new pool
        pool = mysql.createPool({
            host: "127.0.0.1",
            user: username,
            password: password,
            port: 3306,
            waitForConnections: true,
            connectionLimit: 10
        });

        tenantConnectionPools.set(orgName, pool);
    }

    // ALWAYS switch database
    await pool.query(`USE \`${databaseName}\`;`);

    return pool.query(sql, params);
}



// ================================
//     queryGlobalDb()
// ================================
const globalDbPool = mysql.createPool({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "common_db",
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});

export function queryGlobalDb(sql, params = []) {
    return globalDbPool.query(sql, params);
}

