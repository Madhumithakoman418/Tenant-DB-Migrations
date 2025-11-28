exports.up = function (knex) {
  return knex.schema.createTable("contract_types", (table) => {
    table.increments("type_id").primary();             // INT (PK)
    table.string("name").notNullable();                // VARCHAR NOT NULL
    table.timestamp("created_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("contract_types");
};
