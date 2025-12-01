exports.up = function (knex) {
  return knex.schema.createTable("file_metadata", (table) => {
    table.bigIncrements("data_id").primary();       // BIGINT (PK)

    table.string("cl_file_guid");                   // VARCHAR
    table.string("metadata_title");                 // VARCHAR
    table.text("metadata_text_value");              // TEXT
    table.float("metadata_int_value");              // FLOAT
    table.decimal("metadata_decimal_value");        // DECIMAL
    table.bigInteger("tag_id");                     // BIGINT
    table.string("field");                          // VARCHAR - field name
    table.string("type");                           // VARCHAR - type of metadata
    table.boolean("has_recurring_payment").defaultTo(false); // TINYINT(1) DEFAULT 0
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("file_metadata");
};
