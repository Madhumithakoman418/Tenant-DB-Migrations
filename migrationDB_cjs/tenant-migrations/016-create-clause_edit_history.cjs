exports.up = function (knex) {
  return knex.schema.createTable("clause_edit_history", (table) => {
    table.increments("id").primary();                   // INT (PK)
    table.integer("clause_id");                         // INT
    table.integer("user_id");                           // INT
    table.integer("org_id");                            // INT
    table.text("change_reason");                        // TEXT
    table.text("old_description");                      // TEXT
    table.text("new_description");                      // TEXT
    table.timestamp("created_at").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("clause_edit_history");
};
