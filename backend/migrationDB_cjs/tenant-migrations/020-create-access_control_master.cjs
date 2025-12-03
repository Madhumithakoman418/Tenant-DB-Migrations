exports.up = function (knex) {
    return knex.schema.createTable("access_control_master", (table) => {
        table.bigIncrements("acm_id").primary();              // Bigint (PK)

        table.string("ci_file_guid", 100).defaultTo(null);                    // Varchar(100)
        table.bigInteger("tag_id").defaultTo(null);                           // Bigint
        table.bigInteger("group_id").defaultTo(null);                         // Bigint
        table.bigInteger('user_id').nullable().comment('Represents the tag-user linkage; stores the user ID associated with a tag for access control tracking.');   // Bigint

        table.bigInteger("shared_with").defaultTo(null);                      // Bigint
        table.bigInteger("shared_by_user_id").defaultTo(null);                // Bigint
        table.bigInteger("source_tag_id").defaultTo(null);                    // Bigint
        table.bigInteger("perm_id").defaultTo(null);                          // Bigint

        table.timestamp("created_at");                        // Timestamp
        table.timestamp("updated_at");                        // Timestamp
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("access_control_master");
};
