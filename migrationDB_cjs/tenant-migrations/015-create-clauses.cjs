exports.up = function (knex) {
  return knex.schema.createTable("clauses", (table) => {
    table.increments("id").primary();                   // INT (PK)
    table.string("name");                               // VARCHAR
    table.text("description");                          // TEXT
    table.text("justification");                        // TEXT
    table.integer("avivo_rank").defaultTo(1);           // INT DEFAULT 1
    table.string("risk_level");                         // VARCHAR
    table.integer("clause_type_id");                    // INT
    table.enu("source", ['AVIVO','ORGANIZATION','USER']);      // ENUM
    table.integer("user_id").nullable();                // INT NULL
    table.text("categories").nullable();                // TEXT
    table.timestamp("created_on").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_on").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.integer("created_by_user_id").nullable();     // INT NULL
    table.integer("updated_by_user_id").nullable();     // INT NULL
    table.boolean("is_archived").defaultTo(false);      // TINYINT DEFAULT 0
    
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("clauses");
};
