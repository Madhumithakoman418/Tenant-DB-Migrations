module.exports = {

    tenant: {
        client: "mysql2",
        connection: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.TENANT_DB
        },
        migrations: {
            directory: "./tenant-migrations",
            tableName: "tenant_migrations_history",  
            lockTableName: "tenant_migrations_history_lock"
        }
    }
};
