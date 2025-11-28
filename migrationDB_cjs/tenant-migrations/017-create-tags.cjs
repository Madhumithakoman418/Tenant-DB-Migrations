exports.up = function (knex) {
    return knex.schema.createTable("tags", (table) => {
        table.increments("tag_id").primary();     // Integer (PK)

        table.string("name");                     // Varchar
        table.text("description");                // Text
        table.enu("tag_type", ["system", "custom"]); // Enum
        table.integer("user_id");                 // Integer
        table.integer("org_id");                            // INT
        table.boolean("is_default");              // Tinyint
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("tags");
};
