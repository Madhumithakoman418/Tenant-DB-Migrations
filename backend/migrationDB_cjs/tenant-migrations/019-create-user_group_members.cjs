exports.up = function (knex) {
    return knex.schema.createTable("user_group_members", (table) => {
        table.bigInteger("user_member_id").notNullable();                // Bigint (FK)
        table.bigInteger("group_id").notNullable();                // Bigint (FK)
        table.bigInteger("user_id").notNullable();                 // Bigint (FK)
        table.timestamp('created_at').nullable().defaultTo(knex.fn.now()).comment('Timestamp for when the user was added.'); // Timestamp
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("user_group_members");
};
