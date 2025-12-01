exports.up = function (knex) {
    return knex.schema.createTable("role_permissions", (table) => {
        table.bigIncrements("role_perm_id").primary();   // Bigint (PK)

        table.integer("role_id");                        // Integer
        table.integer("com_id");                         // Integer
        table.integer("perm_id");                        // Integer
        table.boolean("is_enabled");                     // Tinyint
        table.timestamp("created_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.timestamp("updated_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("role_permissions");
};
