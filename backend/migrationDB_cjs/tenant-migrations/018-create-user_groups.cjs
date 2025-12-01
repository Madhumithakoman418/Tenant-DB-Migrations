exports.up = function (knex) {
    return knex.schema.createTable("user_groups", (table) => {
        table.bigIncrements("group_id").primary();   // Bigint (PK)
        table.string("group_name");                  // Varchar
        table.bigInteger("created_by");              // Bigint
        table.timestamp("created_at");               // Timestamp
        table.timestamp("updated_at");               // Timestamp
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("user_groups");
};
