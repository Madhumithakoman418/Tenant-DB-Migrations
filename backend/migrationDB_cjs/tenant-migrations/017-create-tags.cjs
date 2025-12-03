exports.up = function (knex) {
    return knex.schema.createTable("tags", (table) => {
        table.increments("tag_id").primary();     // Integer (PK)

        table.string("name").notNullable();                     // Varchar
        table.text("description");                // Text
        table.enu("tag_type", ['template','clause','user_collection']).notNullable(); // Enum
        table.integer("user_id").defaultTo(null);                 // Integer
        table.boolean("is_default").notNullable().defaultTo(0);              // Tinyint
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("tags");
};
