exports.up = function (knex) {
  return knex.schema.createTable("llm_process_status", (table) => {
    table.bigIncrements("process_id").primary();           // BIGINT (PK)
    table.string("ci_file_guid");                          // VARCHAR
    table.boolean("retryable_file").defaultTo(false);      // TINYINT(1) DEFAULT 0
    table.integer("completed_steps").nullable();           // INT
    table.text("error_msg").nullable();                    // TEXT
    table.integer("retry_count").defaultTo(0);             // INT DEFAULT 0
    table.integer("process_type").nullable();              // INT
   
    table.timestamp("created_time").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_time").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("process_start_time").nullable();          // TIMESTAMP NULL
    table.timestamp("process_end_time").nullable();            // TIMESTAMP NULL
    table.boolean("in_queue").defaultTo(false);                // TINYINT(1) DEFAULT 0
    table.integer("execution_progress_percent").nullable();// INT
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("llm_process_status");
};
