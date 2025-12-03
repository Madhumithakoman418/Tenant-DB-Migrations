exports.up = function (knex) {
    return knex.schema.createTable("file_metadata_dates", (table) => {
        table.bigIncrements("data_id").primary();      // Bigint (PK)

        table.string("ci_file_guid");                  // Varchar
        table.string("date_title").nullable();                    // Varchar Default NULL
        table.dateTime("date_value").nullable;                  // Datetime Default NULL
        table.timestamp("updated_on").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("file_metadata_dates");
};
