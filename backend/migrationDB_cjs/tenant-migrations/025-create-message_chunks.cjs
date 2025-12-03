exports.up = function (knex) {
  return knex.schema.createTable("message_chunks", (table) => {
    table.increments("id").primary();                  // INT (PK)
    table.integer("user_id").nullable();                          // INT
    table.integer("session_id").nullable();                       // INT
    table.string("connection_id").nullable();                     // VARCHAR
    table.string("request_id").nullable();                        // VARCHAR
    table.integer("chunk_order").nullable();                      // INT
    table.binary("chunk_content");                     // MEDIUMBLOB
    table.text("error");                    // TEXT 
    table.boolean("stream_completed_status").nullable();          // TINYINT
    table.string("chat_id").nullable();                           // VARCHAR
    table.timestamp("created_date").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_date").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("inserted_at").defaultTo(knex.fn.now());    // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("message_chunks");
};
