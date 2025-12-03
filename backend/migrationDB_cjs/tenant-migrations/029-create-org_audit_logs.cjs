exports.up = function (knex) {
  return knex.schema.createTable("org_audit_logs", (table) => {
    table.increments("audit_id").primary();       // INT (PK)
    table.integer("user_id").nullable();                     // INT
    table.string("module").nullable();                       // VARCHAR
    table.string("action").nullable();                       // VARCHAR
    table.string("affected_entity_id").nullable();           // VARCHAR
    table.text("details");                        // TEXT
    table.timestamp("timestamp").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.json("details_json").nullable();        // JSON NULL
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("org_audit_logs");
};
