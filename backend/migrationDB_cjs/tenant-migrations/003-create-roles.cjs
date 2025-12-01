exports.up = function (knex) {
    return knex.schema.createTable("user_roles", (table) => {
        table.increments("role_id").primary();       // Integer (PK)

        table.string("role");                        // Varchar
        table.enu("category", ["ADMIN", "USER", "OWNER", "VIEWER"]); // Enum (example values)
        table.integer("user_id");                    // Integer
        table.timestamp("created_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.timestamp("updated_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("user_roles");
};
