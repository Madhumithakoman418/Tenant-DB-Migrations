exports.up = function (knex) {
    return knex.schema.createTable("conceptual_search_data", (table) => {
        table.increments("id").primary();        // Integer (PK)

        table.integer("org_id");                 // Integer
        table.integer("user_id");                // Integer
        table.text("conceptual_search_query");   // Text
        table.json("received_fileids");          // JSON
        table.timestamp("inserted_at").defaultTo(knex.fn.now());    // TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("conceptual_search_data");
};
