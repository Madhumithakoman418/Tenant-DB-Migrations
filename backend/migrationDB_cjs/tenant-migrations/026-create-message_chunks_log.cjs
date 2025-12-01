exports.up = function (knex) {
    return knex.schema.createTable("message_chunks_log", (table) => {
        table.increments("id").primary();                // Int (PK)

        table.integer("user_id");                        // Int
        table.integer("session_id");                     // Int
        table.string("connection_id", 255);              // Varchar(255)
        table.string("request_id", 255);                 // Varchar(255)
        table.integer("chunk_order");                    // Int
        table.binary("chunk_content");                   // Mediumblob
        table.text("error");                             // Text
        table.boolean("stream_completed_status");        // Tinyint(1)
        table.timestamp("created_date");                 // Timestamp
        table.timestamp("updated_date");                 // Timestamp
        table.string("chat_id", 255);                    // Varchar(255)
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("message_chunks_log");
};
