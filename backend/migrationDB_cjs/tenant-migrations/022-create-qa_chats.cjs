exports.up = function (knex) {
  return knex.schema.createTable("qa_chats", (table) => {
    table.increments("chat_id").primary();             // INT (PK)
    table.integer("session_id");                       // INT
    table.binary("question");                          // BLOB
    table.binary("answer");                            // MEDIUMBLOB
    table.timestamp("created_date").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_date").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.integer("is_archived").defaultTo(0);         // INT DEFAULT 0
    table.text("error");                               // TEXT
    table.string("ai_chat_type");                      // VARCHAR
    table.json("ci_file_guid_arr");                    // JSON
    table.string("request_id");                        // VARCHAR
    table.bigInteger("file_id").nullable();            // BIGINT NULL
    table.string("file_name").nullable();              // VARCHAR NULL
    table.string("connection_id").nullable();          // VARCHAR NULL
    table.string("request_id").nullable();                // VARCHAR NULL
    
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("qa_chats");
};
