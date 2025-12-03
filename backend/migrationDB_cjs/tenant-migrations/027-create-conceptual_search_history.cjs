exports.up = function (knex) {
    return knex.schema.createTable("conceptual_search_history", (table) => {
        table.increments("id").primary();        // Integer (PK)

        table.integer("user_id").notNullable();                // Integer
        table.text("conceptual_search_query").notNullable();   // Text
        table.timestamp("inserted_at").defaultTo(knex.fn.now());    // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("conceptual_search_history");
};
