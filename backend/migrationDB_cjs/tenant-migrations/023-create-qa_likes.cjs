exports.up = function (knex) {
    return knex.schema.createTable("qa_likes", (table) => {
        table.increments("data_id").primary();  // Integer (PK)

        table.integer("chat_id").nullable();               // Integer
        table.integer("user_id").nullable();               // Integer
        table.integer("is_liked").nullable();              // Integer
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("qa_likes");
};
