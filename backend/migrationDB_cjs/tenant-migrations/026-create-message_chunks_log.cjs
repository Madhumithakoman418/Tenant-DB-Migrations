exports.up = function (knex) {
    return knex.schema.createTable("message_chunks_log", (table) => {
        table.increments("id").primary();                // Int (PK)

        table.integer("user_id").nullable();                        // Int
        table.integer("session_id").nullable();                     // Int
        table.string("connection_id", 255).nullable();              // Varchar(255)
        table.string("request_id", 255).nullable();                 // Varchar(255)
        table.integer("chunk_order").nullable();                    // Int
        table.binary("chunk_content").nullable();                   // Mediumblob
        table.text("error");                             // Text
        table.boolean("stream_completed_status").nullable();        // Tinyint(1)
        table.timestamp("created_date").defaultTo(knex.fn.now());                 // Timestamp
        table.timestamp("updated_date").defaultTo(knex.fn.now());                 // Timestamp
        table.string("chat_id", 255).nullable();                    // Varchar(255)
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("message_chunks_log");
};
