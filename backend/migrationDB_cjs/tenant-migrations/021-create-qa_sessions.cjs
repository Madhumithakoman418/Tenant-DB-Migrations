exports.up = function (knex) {
    return knex.schema.createTable("qa_sessions", (table) => {
        table.increments("session_id").primary();   // Integer (PK)

        table.integer("user_id");                   // Integer
        table.json("ci_file_guid_arr");             // JSON
        table.json("tag_ids_arr");                  // JSON
        table.integer("parent_session_id");         // Integer
        table.timestamp("created_date");                        // Timestamp
        table.timestamp("updated_date");   
        table.bigInteger("archived_by").nullable();           // BIGINT NULL 
        table.binary("title");                      // Blob
        table.integer("chat_type");                 // Integer
        table.string("connection_id");              // Varchar
        table.string("ci_file_guid", 100);                    // Varchar(100)

    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("qa_sessions");
};
