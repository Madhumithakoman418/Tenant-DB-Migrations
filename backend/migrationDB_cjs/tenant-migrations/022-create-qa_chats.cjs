exports.up = function (knex) {
  return knex.schema.createTable("qa_chats", (table) => {
    table.increments("chat_id").primary();             // INT (PK)
    table.integer("session_id").nullable();                       // INT
    table.binary("question");                          // BLOB
    table.binary("answer");                            // MEDIUMBLOB
    table.timestamp("created_date").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_date").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.integer("is_archived").nullable();         // INT DEFAULT null
    table.text("error");                               // TEXT
    table.string("ai_chat_type").nullable();                      // VARCHAR
    table.json("ci_file_guid_arr").nullable();                    // JSON
    table.bigInteger("file_id").nullable();            // BIGINT NULL
    table.string("file_name").nullable();              // VARCHAR NULL
    table.string("request_id").nullable();                        // VARCHAR
    table.string("connection_id").nullable();          // VARCHAR NULL
    
    
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("qa_chats");
};
