exports.up = function (knex) {
    return knex.schema.createTable("alerts_enabled", (table) => {
        table.bigIncrements("alert_enabled_id").primary();  // Bigint (PK)

        table.bigInteger("config_id").defaultTo(null);                      // Bigint
        table.bigInteger("alert_type_id").defaultTo(null);                  // Bigint
        table.integer("is_enabled").defaultTo(null);                        // Integer
        table.integer("days_before").default(null);                       // Integer
        table.timestamp("updated_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT now()
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("alerts_enabled");
};
