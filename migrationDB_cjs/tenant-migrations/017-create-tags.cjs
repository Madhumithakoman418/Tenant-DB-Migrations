exports.up = function (knex) {
    return knex.schema.createTable("tags", (table) => {
        table.increments("tag_id").primary();     // Integer (PK)

        table.string("name");                     // Varchar
        table.text("description");                // Text
        table.enu("tag_type", ['template','clause','user_collection']); // Enum
        table.integer("user_id");                 // Integer
        table.boolean("is_default");              // Tinyint
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("tags");
};
