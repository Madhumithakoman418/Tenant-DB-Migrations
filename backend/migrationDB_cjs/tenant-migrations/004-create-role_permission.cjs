exports.up = function (knex) {
    return knex.schema.createTable("role_permissions", (table) => {
        table.bigIncrements("role_perm_id").primary();   // Bigint (PK)

       table.integer("role_id").notNullable();       // INT NOT NULL
       table.integer("com_id").notNullable();        // INT NOT NULL
       table.integer("perm_id").notNullable();       // INT NOT NULL
       table.boolean("is_enabled").defaultTo(true);  // TINYINT(1) DEFAULT '1'

        table.timestamp("created_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.timestamp("updated_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("role_permissions");
};
