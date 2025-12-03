exports.up = function (knex) {
    return knex.schema.createTable("contract_clauses", (table) => {
        table.increments("id").primary();        // Integer (PK)

        table.integer("contract_type_id").notNullable();        // Integer
        table.integer("clause_type_id").notNullable();          // Integer
        table.integer("clause_order").notNullable();            // Integer
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("contract_clauses");
};
