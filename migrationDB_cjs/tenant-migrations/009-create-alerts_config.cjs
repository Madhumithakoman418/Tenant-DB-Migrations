exports.up = function (knex) {
    return knex.schema.createTable("alerts_config", (table) => {
        table.bigIncrements("config_id").primary();   // Bigint (PK)

        table.string("ci_org_guid");                  // Varchar
        table.integer("send_alerts");                 // Integer
        table.text("email_ids");                      // Text
        table.timestamp("updated_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT now()
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("alerts_config");
};
