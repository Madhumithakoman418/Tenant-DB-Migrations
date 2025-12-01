exports.up = function (knex) {
  return knex.schema.createTable("message_chunks", (table) => {
    table.increments("id").primary();                  // INT (PK)
    table.integer("user_id");                          // INT
    table.integer("session_id");                       // INT
    table.string("connection_id");                     // VARCHAR
    table.string("request_id");                        // VARCHAR
    table.integer("chunk_order");                      // INT
    table.binary("chunk_content");                     // MEDIUMBLOB
    table.text("error").nullable();                    // TEXT (stores error messages if any)
    table.boolean("stream_completed_status");          // TINYINT
    table.string("chat_id");                           // VARCHAR
    table.timestamp("created_date").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_date").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("inserted_at").defaultTo(knex.fn.now());    // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("message_chunks");
};
