exports.up = function (knex) {
  return knex.schema.createTable("llm_process_status", (table) => {
    table.bigIncrements("process_id").primary();           // BIGINT (PK)
    table.string("ci_file_guid");                          // VARCHAR
    table.boolean("retryable_file").defaultTo(false);      // TINYINT(1) DEFAULT 0 
    table.integer("completed_steps").unsigned().notNullable().defaultTo(0); // INT UNSIGNED NOT NULL DEFAULT 0
    table.text("error_msg");                    // TEXT
    table.integer("retry_count").unsigned().notNullable().defaultTo(0);            // INT UNSIGNED NOT NULL DEFAULT 0
    table.integer("process_type").unsigned().notNullable();              // INT  UNSIGNED NOT NULL
   
    table.timestamp("created_time").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_time").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("process_start_time").nullable();          // TIMESTAMP NULL
    table.timestamp("process_end_time").nullable();            // TIMESTAMP NULL
    table.boolean("in_queue").defaultTo(true);                // TINYINT(1) DEFAULT 1
    table.integer("execution_progress_percent").notNullable().defaultTo(0);  // int NOT NULL DEFAULT 0

  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("llm_process_status");
};
