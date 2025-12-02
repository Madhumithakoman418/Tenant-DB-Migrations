exports.up = function (knex) {
  return knex.schema.createTable("alerts", (table) => {
    table.bigIncrements("alert_id").primary();           // BIGINT (PK)
    table.string("ci_org_guid");                         // VARCHAR
    table.bigInteger("alert_type_id");                   // BIGINT
    table.text("alert_message");                         // TEXT
    table.timestamp("raised_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT now()
    table.timestamp("sent_on").nullable();               // TIMESTAMP NULL
    table.text("to_email_ids");                          // TEXT
    table.integer("sent_status");                        // INTEGER
    table.string("ci_file_guid");                        // VARCHAR
    table.timestamp("updated_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT now()
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("alerts");
};

