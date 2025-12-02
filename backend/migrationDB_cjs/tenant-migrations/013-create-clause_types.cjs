exports.up = function (knex) {
    return knex.schema.createTable("clause_types", (table) => {
        table.increments("id").primary();         // Integer (PK)
        table.string("type");                     // Varchar
        table.enu("source", ['AVIVO','ORGANIZATION','USER']); // Enum
        table.timestamp("created_at").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.timestamp("updated_at").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.integer("created_by_user_id");      // Integer
        table.integer("updated_by_user_id");      // Integer
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("clause_types");
};
