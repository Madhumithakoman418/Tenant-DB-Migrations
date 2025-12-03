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
    table.integer("user_id").nullable().defaultTo(null); // default null
    table.string("upload_state");                          // VARCHAR
    table.string("llm_process_state");                     // VARCHAR
    table.timestamp("created_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_on").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.integer("file_size").nullable().defaultTo(null); // default null
    table.binary("meta_data_title_1").nullable();   // BLOB
    table.binary("meta_data_title_2").nullable();   // BLOB
    table.binary("meta_data_title_3").nullable();   // BLOB
    table.binary("meta_data_title_4").nullable();   // BLOB
    table.binary("meta_data_title_5").nullable();   // BLOB
    table.string("ci_file_guid");                          // VARCHAR
    table.integer("is_archived").defaultTo(null);   // INT DEFAULT NULL
    table.string("preview_url");                           // VARCHAR
    table.binary("meta_data_value_1").nullable();            // blob
    table.binary("meta_data_value_2").nullable();             // blob
    table.binary("meta_data_value_3").nullable();             // blob
    table.binary("meta_data_value_4").nullable();             // blob
    table.binary("meta_data_value_5").nullable();             // blob
    table.string("ci_org_guid");                           // VARCHAR
    
   
    table.integer("parent_id").nullable();                 // INT NULL
    table.integer("type").notNullable().defaultTo(0);                      // INT not NULL default(0)
    table.string("status").nullable();                     // VARCHAR 
    table.integer("file_type").nullable();                 // INT NULL
    table.text("stored_path").nullable();    // TEXT
    table.integer("is_contract").defaultTo(0);             // INT DEFAULT 0
    table.specificType("response_json", "LONGBLOB").nullable();  // LONGBLOB
    table.specificType("is_template", "TINYINT").defaultTo(0);   // TINYINT DEFAULT 0
    table.integer("page_number").notNullable().defaultTo(0);     // INT NOT NULL DEFAULT 0

  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("files");
};
