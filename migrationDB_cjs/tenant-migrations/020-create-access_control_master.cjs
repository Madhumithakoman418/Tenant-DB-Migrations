exports.up = function (knex) {
    return knex.schema.createTable("access_control_master", (table) => {
        table.bigIncrements("acm_id").primary();              // Bigint (PK)

        table.string("ci_file_guid", 100);                    // Varchar(100)
        table.bigInteger("tag_id");                           // Bigint
        table.bigInteger("group_id");                         // Bigint
        table.bigInteger("user_id");                          // Bigint

        table.bigInteger("shared_with");                      // Bigint
        table.bigInteger("shared_by_user_id");                // Bigint
        table.bigInteger("source_tag_id");                    // Bigint
        table.bigInteger("perm_id");                          // Bigint

        table.timestamp("created_at");                        // Timestamp
        table.timestamp("updated_at");                        // Timestamp
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("access_control_master");
};
