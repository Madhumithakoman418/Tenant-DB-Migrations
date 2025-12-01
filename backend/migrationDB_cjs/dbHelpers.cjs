require("dotenv").config();
const knex = require("knex");

// -------- Enhanced DB Helpers --------
// Adds: pool eviction, reconnection handling, retry logic, optional logging, simple LRU cleanup

// -------- Default Pool Options --------
const DEFAULT_POOL_OPTIONS = {
    min: 0,
    max: parseInt(process.env.DB_POOL_MAX || "10", 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || "300000", 10),
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT_MS || "60000", 10)
};

// -------- Transient Error Checker --------
function isTransientError(err) {
    if (!err) return false;
    const msg = (err.message || "").toLowerCase();
    const code = err.code || "";

    const transient = [
        "PROTOCOL_CONNECTION_LOST",
        "ER_LOCK_WAIT_TIMEOUT",
        "ER_LOCK_DEADLOCK",
        "ER_CON_COUNT_ERROR",
        "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR",
        "ECONNRESET",
        "ETIMEDOUT"
    ];

    if (transient.includes(code)) return true;
    if (msg.includes("server has gone away") || msg.includes("deadlock") || msg.includes("timeout")) return true;

    return false;
}

// -------- Retry Wrapper --------
async function retryAsync(fn, opts = {}) {
    const retries = opts.retries ?? 5;
    const base = opts.delayBase ?? 200;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn(attempt);
        } catch (err) {
            if (!isTransientError(err) || attempt === retries) throw err;

            const backoff = base * Math.pow(2, attempt - 1) + Math.floor(Math.random() * base);
            console.warn(`Retry ${attempt}/${retries} after error: ${err.code || err.message}`);
            await new Promise(r => setTimeout(r, backoff));
        }
    }
}

// -------- LRU Registry for Knex Instances --------
const KNEX_REGISTRY = new Map();
const KNEX_MAX = parseInt(process.env.KNEX_MAX_INSTANCES || "5", 10);
const KNEX_IDLE_DESTROY_MS = parseInt(process.env.KNEX_IDLE_DESTROY_MS || "600000", 10);

function touchRegistry(key, instance) {
    const now = Date.now();
    KNEX_REGISTRY.set(key, { knex: instance, lastUsed: now });

    if (KNEX_REGISTRY.size > KNEX_MAX) {
        let oldestKey = null;
        let oldest = Infinity;

        for (const [k, v] of KNEX_REGISTRY.entries()) {
            if (v.lastUsed < oldest) {
                oldest = v.lastUsed;
                oldestKey = k;
            }
        }

        if (oldestKey) {
            KNEX_REGISTRY.get(oldestKey).knex.destroy();
            KNEX_REGISTRY.delete(oldestKey);
        }
    }
}

function periodicRegistryCleanup() {
    const now = Date.now();

    for (const [k, v] of KNEX_REGISTRY.entries()) {
        if (now - v.lastUsed > KNEX_IDLE_DESTROY_MS) {
            v.knex.destroy();
            KNEX_REGISTRY.delete(k);
        }
    }
}

setInterval(periodicRegistryCleanup, 60000);

// -------- Create Knex Client --------
function createKnexClient(opts = {}) {
    const tag = opts.tag || `knex-${Date.now()}`;
    const pool = { ...DEFAULT_POOL_OPTIONS, ...(opts.pool || {}) };

    const cfg = {
        client: opts.client || "mysql2",
        connection: opts.connection,
        pool: {
            min: pool.min,
            max: pool.max,
            idleTimeoutMillis: pool.idleTimeoutMillis,
            acquireTimeoutMillis: pool.acquireTimeoutMillis,
            afterCreate: (conn, done) => {
                try {
                    conn.on("error", err =>
                        console.error(`[${tag}] MySQL error:`, err.code || err.message)
                    );
                } catch {}
                done(null, conn);
            }
        },
        migrations: opts.migrations
    };

    const instance = knex(cfg);
    touchRegistry(tag, instance);
    return { instance, tag };
}

// -------- Run With Retries --------
async function runWithRetries(fn) {
    return retryAsync(fn, {
        retries: parseInt(process.env.DB_RETRIES || "5", 10),
        delayBase: 200
    });
}

module.exports = {
    createKnexClient,
    runWithRetries
};
