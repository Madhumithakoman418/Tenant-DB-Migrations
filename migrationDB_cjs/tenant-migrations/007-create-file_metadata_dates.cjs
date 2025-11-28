exports.up = function (knex) {
    return knex.schema.createTable("file_metadata_dates", (table) => {
        table.bigIncrements("data_id").primary();      // Bigint (PK)

        table.string("cl_file_guid");                  // Varchar
        table.string("date_title");                    // Varchar
        table.dateTime("date_value");                  // Datetime
        table.timestamp("created_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.timestamp("updated_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("file_metadata_dates");
};
