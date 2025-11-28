require("dotenv").config();
const mysql = require("mysql2/promise");
const crypto = require("crypto");
const fs = require("fs");
const { createKnexClient, runWithRetries } = require("./dbHelpers.cjs");
const config = require("./knexfile.cjs");
const { runStep, loadCheckpoint, simulateError, clearCheckpoint } = require("./workflowRunner.cjs");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
  database: "common_db"
});

const mockSecretStore = {};

// ------------------ ENCRYPTION HELPERS ------------------
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // must be 32 bytes
const IV_LENGTH = 16;

function encryptData(data) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(JSON.stringify(data));
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decryptData(encryptedText) {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encryptedData = Buffer.from(encryptedHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return JSON.parse(decrypted.toString());
}

// ------------------ EXISTING FUNCTIONS ------------------
function generateOrgId() {
  const randomHex = Math.random().toString(16).substring(2, 8);
  return `org_${randomHex}`;
}

//  UPDATED: saveTenantSecrets now stores encrypted credentials in DB
async function saveTenantSecrets(org, user, pass) {
  const credentials = {
    host: process.env.DB_HOST,
    user,
    password: pass,
    database: `db_${org}`
  };

  const encryptedData = encryptData(credentials);

  await db.query(
    `UPDATE organizations SET db_credentials = ? WHERE ci_org_guid = ?`,
    [encryptedData, org]
  );

  console.log(`Encrypted tenant DB credentials stored in organizations table for ${org}`);
}

//  UPDATED: testTenantConnection now reads and decrypts credentials from DB
async function testTenantConnection(orgId) {
  try {
    const [rows] = await db.query(
      `SELECT db_credentials FROM organizations WHERE ci_org_guid = ?`,
      [orgId]
    );

    if (!rows.length || !rows[0].db_credentials) {
      console.error(`Encrypted credentials not found for ${orgId}`);
      return;
    }

    const creds = decryptData(rows[0].db_credentials);

    const connection = await mysql.createConnection({
      host: creds.host,
      user: creds.user,
      password: creds.password,
      database: creds.database,
      port: process.env.DB_PORT
    });

    const [result] = await connection.query("SELECT 1");
    console.log(`DB Connection Successful for ${orgId}`);
    await connection.end();
    return result;
  } catch (err) {
    console.error(`DB Connection Failed for ${orgId} : ${err.message}`);
  }
}


async function Initialization(org_name, first_name, last_name, email, phone_no) {
  console.log(`\n========== STEP 1: ORGANIZATION INITIALIZATION ==========`);

  const admin_details = { first_name, last_name, email, phone_number: phone_no, role: "1" };
  const ci_org_guid = generateOrgId();
  const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");

  const sql = `INSERT INTO organizations (ci_org_guid, name, org_state, created_date) VALUES (?, ?, ?, ?)`;
  await db.query(sql, [ci_org_guid, org_name, "INITIATED", timestamp]);

  console.log(` Organization "${org_name}" created successfully with ID: ${ci_org_guid}`);
  console.log(`-----------------------------------------------------------`);

  return { ci_org_guid, org_state: "INITIATED", name: org_name, admin_details };
}

async function CreateS3Bucket(ci_org_guid, name = null) {
  console.log(`\n========== STEP 2: S3 BUCKET CREATION ==========`);

  const bucketName = `product-org-${ci_org_guid}`;
  console.log(`Generating S3 bucket for organization "${name}"...`);
  console.log(`Proposed bucket name: ${bucketName}`);

  const sql = `
    UPDATE organizations
    SET s3_bucket_name = ?, org_state = ?
    WHERE ci_org_guid = ?
  `;
  await db.query(sql, [bucketName, "S3_PROVISIONED", ci_org_guid]);

  console.log(` S3 bucket "${bucketName}" created and organization state updated to 'S3_PROVISIONED'.`);
  console.log(`-----------------------------------------------------------`);

  return { ci_org_guid, s3_bucket_name: bucketName, org_state: "S3_PROVISIONED" };
}

async function CreateTenantDB(org_id, org_name) {
  const db_name = `db_${org_id}`;
  const db_user = `user_${org_id}`;
  const db_secret_arn = `org_${org_name}`;
  const db_pass = crypto.randomBytes(8).toString("base64") + "!@#";

  console.log(`\n-------- TENANT DB CREATION --------`);
  console.log(`Creating tenant database: ${db_name}`);
  console.log(`Creating tenant user: ${db_user}`);

  await db.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\``);
  await db.query(`CREATE USER IF NOT EXISTS '${db_user}'@'%' IDENTIFIED BY '${db_pass}'`);
  await db.query(`GRANT ALL PRIVILEGES ON \`${db_name}\`.* TO '${db_user}'@'%'`);
  await db.query(`FLUSH PRIVILEGES`);

  mockSecretStore[db_secret_arn] = { db_secret_arn, db_user, db_pass };

  const sql = `
    UPDATE organizations
    SET db_name = ?, db_secret_arn = ?, org_state = ?
    WHERE ci_org_guid = ?
  `;
  await db.query(sql, [db_name, db_secret_arn, "DB_CREATED", org_id]);

  return { org_id, db_name, db_user, db_pass, db_secret_arn, org_state: "DB_CREATED" };
}

async function RunTenantMigrations(tenantDetails) {
  const { db_name: tenantDbName, db_user: tenantUser, db_pass: tenantPass } = tenantDetails;

  console.log(`\n-------- TENANT MIGRATIONS --------`);
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

  await db.query(`UPDATE organizations SET org_state = ? WHERE db_name = ?`, ["MIGRATED", tenantDbName]);
  console.log("Tenant migrations complete.");
  return { db_name: tenantDbName, org_state: "MIGRATED" };
}

async function CreateSuperAdmin(tenantDetails, adminDetails) {
  const { db_name, db_user, db_pass } = tenantDetails;
  const { first_name, last_name, email, phone_number, role } = adminDetails;

  console.log(`\n-------- STEP 5: CREATING SUPER ADMIN USER --------`);

  const tenantDb = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: db_user,
    password: db_pass,
    database: db_name,
    port: process.env.DB_PORT
  });

  const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
  const insertUserSQL = `
    INSERT INTO users 
    (firstname, lastname, email, phone_no, user_role, created_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  await tenantDb.query(insertUserSQL, [first_name, last_name, email, phone_number, role, created_at]);
  await tenantDb.end();

  console.log("Super Admin user created successfully.");
  return { first_name, last_name, email, phone_number, role };
}

// -------------------- MAIN --------------------
(async () => {
  try {
    const checkpoint = loadCheckpoint();
    const startFrom = checkpoint.currentStep || "STEP_1";
    const org = "TCS-005";

    let step1, step2, step3, step4, step5;

    try {
      if (["STEP_1"].includes(startFrom)) {
        step1 = await runStep("STEP_1", Initialization, org, "madhumitha", "Koman", "madhumitha@gmail.com", "9987654383");
        simulateError("STEP_1");
      } else {
        step1 = checkpoint.data?.STEP_1 || checkpoint.data;
      }
    } catch (err) {
      console.error("STEP_1 failed:", err.message);
    }

    try {
      if (["STEP_1", "STEP_2"].includes(startFrom)) {
        step2 = await runStep("STEP_2", CreateS3Bucket, step1?.ci_org_guid, step1?.name);
        simulateError("STEP_2");
      } else {
        step2 = checkpoint.data?.STEP_2 || checkpoint.data;
      }
    } catch (err) {
      console.error("STEP_2 failed:", err.message);
    }

    try {
      if (["STEP_1", "STEP_2", "STEP_3"].includes(startFrom)) {
        step3 = await runStep("STEP_3", CreateTenantDB, step1?.ci_org_guid, step1?.name);
        simulateError("STEP_3");
        if (step3) await saveTenantSecrets(step1.ci_org_guid, step3.db_user, step3.db_pass);
      } else {
        step3 = checkpoint.data?.STEP_3 || checkpoint.data;
      }
    } catch (err) {
      console.error("STEP_3 failed:", err.message);
    }

    try {
      if (["STEP_1", "STEP_2", "STEP_3", "STEP_4"].includes(startFrom)) {
        step4 = await runStep("STEP_4", RunTenantMigrations, step3);
        simulateError("STEP_4");
      } else {
        step4 = checkpoint.data?.STEP_4 || checkpoint.data;
      }
    } catch (err) {
      console.error("STEP_4 failed:", err.message);
    }

    try {
      if (["STEP_1", "STEP_2", "STEP_3", "STEP_4", "STEP_5"].includes(startFrom)) {
        step5 = await runStep("STEP_5", CreateSuperAdmin, step3, step1?.admin_details);
        simulateError("STEP_5");
      } else {
        step5 = checkpoint.data?.STEP_5 || checkpoint.data;
      }
    } catch (err) {
      console.error("STEP_5 failed:", err.message);
    }

    try {
      if (step1?.ci_org_guid) {
        await db.query(`UPDATE organizations SET org_state = 'ACTIVE' WHERE ci_org_guid = ?`, [step1.ci_org_guid]);
        console.log("Organization status updated to ACTIVE after Step 5");
      }
    } catch (err) {
      console.error("Failed to update organization state:", err.message);
    }

    console.log("\nIn-memory Secret Store:", mockSecretStore);
    console.log("\nRunning DB Connection Test...");
    if (step1?.ci_org_guid) await testTenantConnection(step1.ci_org_guid);

    clearCheckpoint();
  } catch (err) {
    console.error("Workflow failed:", err);
  } finally {
    try {
      await db.end();
    } catch (_) {}
    process.exit(0);
  }
})();

// require("dotenv").config();
// const mysql = require("mysql2/promise");
// const crypto = require("crypto");
// const fs = require("fs");
// const { createKnexClient, runWithRetries } = require("./dbHelpers.cjs");
// const config = require("./knexfile.cjs");
// const { runStep, loadCheckpoint, simulateError, clearCheckpoint } = require("./workflowRunner.cjs");

// const db = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
//   database: "common_db"
// });

// const mockSecretStore = {};

// function generateOrgId() {
//   const randomHex = Math.random().toString(16).substring(2, 8);
//   return `org_${randomHex}`;
// }

// function saveTenantSecrets(org, user, pass) {
//   if (!fs.existsSync("secrets")) fs.mkdirSync("secrets");
//   const filePath = `secrets/${org}.json`;
//   const data = {
//     organization: org,
//     tenant_username: user,
//     tenant_password: pass,
//     created_at: new Date().toISOString()
//   };
//   fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
//   console.log(`Tenant credentials saved to ${filePath}`);
// }

// async function testTenantConnection(orgId) {
//   try {
//     const filePath = `secrets/${orgId}.json`;
//     if (!fs.existsSync(filePath)) {
//       console.error(`Secrets file not found for ${orgId}`);
//       return;
//     }

//     const tenantSecrets = JSON.parse(fs.readFileSync(filePath, "utf-8"));
//     const { tenant_username, tenant_password } = tenantSecrets;
//     const db_name = `db_${orgId}`;

//     const connection = await mysql.createConnection({
//       host: process.env.DB_HOST,
//       user: tenant_username,
//       password: tenant_password,
//       database: db_name,
//       port: process.env.DB_PORT
//     });

//     const [rows] = await connection.query("SELECT 1");
//     console.log(`DB Connection Successful for ${orgId}`);
//     await connection.end();
//     return rows;
//   } catch (err) {
//     console.error(`DB Connection Failed for ${orgId} : ${err.message}`);
//   }
// }

// async function Initialization(org_name, first_name, last_name, email, phone_no) {
//   console.log(`\n========== STEP 1: ORGANIZATION INITIALIZATION ==========`);

//   if (!org_name || typeof org_name !== "string") throw new Error("org_name must be a non-empty string");
//   console.log(`Creating new organization record for "${org_name}"...`);
//   console.log(`Admin Details -> Name: ${first_name} ${last_name}, Email: ${email}, Phone: ${phone_no}`);

//   const admin_details = { first_name, last_name, email, phone_number: phone_no, role: "1" };
//   const ci_org_guid = generateOrgId();
//   const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
//   const sql = `INSERT INTO organizations (ci_org_guid, name, org_state, created_date) VALUES (?, ?, ?, ?)`;
//   await db.query(sql, [ci_org_guid, org_name, "INITIATED", timestamp]);

//   console.log(` Organization "${org_name}" created successfully with ID: ${ci_org_guid}`);
//   console.log(`-----------------------------------------------------------`);

//   return { ci_org_guid, org_state: "INITIATED", name: org_name, admin_details };
// }

// async function CreateS3Bucket(ci_org_guid, name = null) {
//   console.log(`\n========== STEP 2: S3 BUCKET CREATION ==========`);

//   const bucketName = `product-org-${ci_org_guid}`;
//   console.log(`Generating S3 bucket for organization "${name}"...`);
//   console.log(`Proposed bucket name: ${bucketName}`);

//   //  Simulated Error for Testing
//   throw new Error("Simulated failure in Step 2: S3 bucket creation failed due to permission issue.");

//   const sql = `
//     UPDATE organizations
//     SET s3_bucket_name = ?, org_state = ?
//     WHERE ci_org_guid = ?
//   `;
//   await db.query(sql, [bucketName, "S3_PROVISIONED", ci_org_guid]);

//   console.log(` S3 bucket "${bucketName}" created and organization state updated to 'S3_PROVISIONED'.`);
//   console.log(`-----------------------------------------------------------`);

//   return { ci_org_guid, s3_bucket_name: bucketName, org_state: "S3_PROVISIONED" };
// }

// async function CreateTenantDB(org_id, org_name) {
//   if (!org_id || typeof org_id !== "string") throw new Error("org_id must be a string");
//   if (!org_name || typeof org_name !== "string") throw new Error("org_name must be a string");

//   const db_name = `db_${org_id}`;
//   const db_user = `user_${org_id}`;
//   const db_secret_arn = `org_${org_name}`;
//   const db_pass = crypto.randomBytes(8).toString("base64") + "!@#";

//   console.log(`\n-------- TENANT DB CREATION --------`);
//   console.log(`Creating tenant database: ${db_name}`);
//   console.log(`Creating tenant user: ${db_user}`);

//   await db.query(`CREATE DATABASE IF NOT EXISTS \`${db_name}\``);
//   await db.query(`CREATE USER IF NOT EXISTS '${db_user}'@'%' IDENTIFIED BY '${db_pass}'`);
//   await db.query(`GRANT ALL PRIVILEGES ON \`${db_name}\`.* TO '${db_user}'@'%'`);
//   await db.query(`FLUSH PRIVILEGES`);

//   mockSecretStore[db_secret_arn] = { db_secret_arn, db_user, db_pass };

//   const sql = `
//     UPDATE organizations
//     SET db_name = ?, db_secret_arn = ?, org_state = ?
//     WHERE ci_org_guid = ?
//   `;
//   await db.query(sql, [db_name, db_secret_arn, "DB_CREATED", org_id]);

//   return { org_id, db_name, db_user, db_pass, db_secret_arn, org_state: "DB_CREATED" };
// }

// async function RunTenantMigrations(tenantDetails) {
//   const { db_name: tenantDbName, db_user: tenantUser, db_pass: tenantPass } = tenantDetails;
//   if (!tenantDbName || !tenantUser || !tenantPass) throw new Error("Missing tenant DB credentials.");

//   console.log(`\n-------- TENANT MIGRATIONS --------`);
//   console.log(`Running tenant migrations on ${tenantDbName} ...`);

//   //  Simulated Error for Testing
//   throw new Error("Simulated failure in Step 4: Migration script crashed.");

//   const { instance: tenantDb } = createKnexClient({
//     client: "mysql2",
//     connection: {
//       host: process.env.DB_HOST,
//       user: tenantUser,
//       password: tenantPass,
//       database: tenantDbName,
//       port: process.env.DB_PORT
//     },
//     migrations: config.tenant.migrations
//   });

//   await runWithRetries(() => tenantDb.migrate.latest(), "tenant");
//   await tenantDb.destroy();

//   await db.query(`UPDATE organizations SET org_state = ? WHERE db_name = ?`, ["MIGRATED", tenantDbName]);
//   console.log("Tenant migrations complete.");
//   return { db_name: tenantDbName, org_state: "MIGRATED" };
// }

// async function CreateSuperAdmin(tenantDetails, adminDetails) {
//   const { db_name, db_user, db_pass } = tenantDetails;
//   const { first_name, last_name, email, phone_number, role } = adminDetails;

//   console.log(`\n-------- STEP 5: CREATING SUPER ADMIN USER --------`);

//   const tenantDb = await mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: db_user,
//     password: db_pass,
//     database: db_name,
//     port: process.env.DB_PORT
//   });

//   const created_at = new Date().toISOString().slice(0, 19).replace("T", " ");
//   const insertUserSQL = `
//     INSERT INTO users 
//     (firstname, lastname, email, phone_no, user_role, created_date)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;
//   await tenantDb.query(insertUserSQL, [first_name, last_name, email, phone_number, role, created_at]);
//   await tenantDb.end();

//   console.log("Super Admin user created successfully.");
//   return { first_name, last_name, email, phone_number, role };
// }

// // -------------------- MAIN WORKFLOW --------------------
// (async () => {
//   try {
//     const checkpoint = loadCheckpoint();
//     const startFrom = checkpoint.currentStep || "STEP_1";
//     const org = "TCS-001";

//     let step1, step2, step3, step4, step5;

//     // === STEP 1 ===
//     try {
//       if (["STEP_1"].includes(startFrom)) {
//         step1 = await runStep("STEP_1", Initialization, org, "Madhu", "mitha", "madhumitha@gmail.com", "9987654383");
//         simulateError("STEP_1");
//       } else {
//         step1 = checkpoint.data?.STEP_1 || checkpoint.data;
//       }
//     } catch (err) {
//       console.error("STEP_1 failed:", err.message);
//     }

//     // === STEP 2 ===
//     try {
//       if (["STEP_1", "STEP_2"].includes(startFrom)) {
//         step2 = await runStep("STEP_2", CreateS3Bucket, step1?.ci_org_guid, step1?.name);
//         simulateError("STEP_2");
//       } else {
//         step2 = checkpoint.data?.STEP_2 || checkpoint.data;
//       }
//     } catch (err) {
//       console.error("STEP_2 failed:", err.message);
//     }

//     // === STEP 3 ===
//     try {
//       if (["STEP_1", "STEP_2", "STEP_3"].includes(startFrom)) {
//         step3 = await runStep("STEP_3", CreateTenantDB, step1?.ci_org_guid, step1?.name);
//         simulateError("STEP_3");
//         if (step3) saveTenantSecrets(step1.ci_org_guid, step3.db_user, step3.db_pass);
//       } else {
//         step3 = checkpoint.data?.STEP_3 || checkpoint.data;
//       }
//     } catch (err) {
//       console.error("STEP_3 failed:", err.message);
//     }

//     // === STEP 4 ===
//     try {
//       if (["STEP_1", "STEP_2", "STEP_3", "STEP_4"].includes(startFrom)) {
//         step4 = await runStep("STEP_4", RunTenantMigrations, step3);
//         simulateError("STEP_4");
//       } else {
//         step4 = checkpoint.data?.STEP_4 || checkpoint.data;
//       }
//     } catch (err) {
//       console.error("STEP_4 failed:", err.message);
//     }

//     // === STEP 5 ===
//     try {
//       if (["STEP_1", "STEP_2", "STEP_3", "STEP_4", "STEP_5"].includes(startFrom)) {
//         step5 = await runStep("STEP_5", CreateSuperAdmin, step3, step1?.admin_details);
//         simulateError("STEP_5");
//       } else {
//         step5 = checkpoint.data?.STEP_5 || checkpoint.data;
//       }
//     } catch (err) {
//       console.error("STEP_5 failed:", err.message);
//     }

//     // === FINALIZE ===
//     try {
//       if (step1?.ci_org_guid) {
//         await db.query(`UPDATE organizations SET org_state = 'ACTIVE' WHERE ci_org_guid = ?`, [step1.ci_org_guid]);
//         console.log("Organization status updated to ACTIVE after Step 5");
//       }
//     } catch (err) {
//       console.error("Failed to update organization state:", err.message);
//     }

//     console.log("\nIn-memory Secret Store:", mockSecretStore);
//     console.log("\nRunning DB Connection Test...");
//     if (step1?.ci_org_guid) await testTenantConnection(step1.ci_org_guid);

//     clearCheckpoint();
//   } catch (err) {
//     console.error("Workflow failed:", err);
//   } finally {
//     try {
//       await db.end();
//     } catch (_) {}
//     process.exit(0);
//   }
// })();
