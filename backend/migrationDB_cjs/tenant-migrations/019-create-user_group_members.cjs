exports.up = function (knex) {
    return knex.schema.createTable("user_group_members", (table) => {
        
        table.bigInteger("group_id");                // Bigint (FK)
        table.bigInteger("user_id");                 // Bigint (FK)
        table.timestamp("created_at");               // Timestamp
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("user_group_members");
};
