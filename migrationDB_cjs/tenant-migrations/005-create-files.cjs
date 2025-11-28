// exports.up = function (knex) {
//     return knex.schema.createTable("files", (table) => {
//         table.increments("file_id").primary();         // Integer (PK)

//         table.string("name");                          // Varchar
//         table.integer("user_id");                      // Integer
//         table.string("upload_state");                  // Varchar
//         table.string("llm_process_state");             // Varchar
//         table.string("ci_file_guid");                  // Varchar
//         table.string("ci_org_guid");                   // Varchar
//         table.integer("file_size");                    // Integer
//         table.integer("is_archived");                  // Integer
//         table.string("preview_url");                   // Varchar
//         table.integer("parent_id");                    // Integer
//         table.integer("type");                         // Integer
//         table.integer("file_type");                    // Integer
//         table.integer("is_contract");                  // Integer
//         table.integer("page_number");                  // Integer
//     });
// };

// exports.down = function (knex) {
//     return knex.schema.dropTable("files");
// };
 exports.up = function (knex) {
  return knex.schema.createTable("files", (table) => {
    table.increments("file_id").primary();                 // INT (PK)
    table.string("name");                                  // VARCHAR
    table.integer("user_id");                              // INT
    table.string("upload_state");                          // VARCHAR
    table.string("llm_process_state");                     // VARCHAR
    table.timestamp("created_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_on").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.integer("file_size");                            // INT
    table.string("meta_data_title_1").nullable();          // VARCHAR
    table.string("meta_data_title_2").nullable();          // VARCHAR
    table.string("meta_data_title_3").nullable();          // VARCHAR
    table.string("meta_data_title_4").nullable();          // VARCHAR
    table.string("meta_data_title_5").nullable();          // VARCHAR
    table.string("ci_file_guid");                          // VARCHAR
    table.integer("is_archived").defaultTo(0);             // INT DEFAULT 0
    table.string("preview_url");                           // VARCHAR
    table.text("meta_data_value_1").nullable();            // TEXT
    table.text("meta_data_value_2").nullable();            // TEXT
    table.text("meta_data_value_3").nullable();            // TEXT
    table.text("meta_data_value_4").nullable();            // TEXT
    table.text("meta_data_value_5").nullable();            // TEXT
    table.string("ci_org_guid");                           // VARCHAR
    
   
    table.integer("parent_id").nullable();                 // INT NULL
    table.integer("type").nullable();                      // INT NULL
    table.string("status").nullable();                     // VARCHAR 
    table.integer("file_type").nullable();                 // INT NULL
    table.string("stored_path").nullable();                // VARCHAR
    table.integer("is_contract").defaultTo(0);             // INT DEFAULT 0
    table.json("response_json").nullable();                // JSON 
    table.boolean("is_template").defaultTo(false);         // BOOL 
    table.integer("page_number").nullable();               // INT NULL
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("files");
};
