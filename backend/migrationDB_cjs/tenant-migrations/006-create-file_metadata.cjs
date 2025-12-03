exports.up = function (knex) {
  return knex.schema.createTable("file_metadata", (table) => {
    table.bigIncrements("data_id").primary();       // BIGINT (PK)

    table.string("ci_file_guid");                   // VARCHAR
    table.string("metadata_title");                 // VARCHAR
    table.text("metadata_text_value");              // TEXT
    table.float("metadata_int_value").notNullable().defaultTo(0); // FLOAT default(0)
    table.decimal("metadata_decimal_value", 15, 8).nullable(); // DECIMALdefault NULL
    table.timestamp("updated_on").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    table.bigInteger("tag_id").defaultTo(0);                  // BIGINT DEFAULT (0)
    table.string("field");                          // VARCHAR - field name
    table.string("type");                           // VARCHAR - type of metadata
    table.boolean("has_recurring_payment").defaultTo(null); // TINYINT(1) DEFAULT NULL
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("file_metadata");
};
