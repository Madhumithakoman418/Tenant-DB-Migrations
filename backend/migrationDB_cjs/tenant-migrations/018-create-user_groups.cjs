exports.up = function (knex) {
    return knex.schema.createTable("user_groups", (table) => {
        table.bigIncrements("group_id").primary();   // Bigint (PK)
        table.string("group_name").notNullable();                  // Varchar
        table.bigInteger('created_by').notNullable().comment('User ID of the group creator. Assumes a link to a users table.');  //bigint
        table.timestamp('created_at').nullable().defaultTo(knex.fn.now());    //timestamp
        table.timestamp('updated_at').nullable().defaultTo(knex.fn.now()).onUpdate(knex.fn.now()); //timestamp
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("user_groups");
};
