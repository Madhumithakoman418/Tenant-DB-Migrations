// exports.up = function (knex) {
//     return knex.schema.createTable("tenant_info", (table) => {
//         table.increments("org_id").primary();                // Int (PK)

//         table.string("ci_org_guid", 45).notNullable();       // Varchar(45)  NOT_NULL
//         table.string("name", 100).notNullable();             // Varchar(100) NOT_NULL
//         table.text("description");                           // Text
//         table.timestamp("created_date");                     // Timestamp
//         table.integer("owner_id");                           // Int
//         table.integer("plan_id");                            // Int
//         table.string("stripe_customer_id", 255);             // Varchar(255)
//         table.bigInteger("totalStorageLimit");               // Bigint
//         table.bigInteger("useStorage");                      // Bigint
//         table.integer("org_type");                           // Int
//         table.boolean("Is_Team");                            // Tinyint(1)
//         table.timestamp("updated_on");                       // Timestamp

//     });
// };

// exports.down = function (knex) {
//     return knex.schema.dropTable("tenant_info");
// };
exports.up = function (knex) {
  return knex.schema.createTable("tenant_info", (table) => {
    table.increments("tenant_id").primary();                 // INT NOT NULL AUTO_INCREMENT PRIMARY KEY
    table.integer("org_id").notNullable();                   // INT NOT NULL
    table.bigInteger("storage_used").defaultTo(0);           // BIGINT DEFAULT 0
    table.bigInteger("storage_limit").defaultTo(1073741824); // BIGINT DEFAULT 1GB
    table.timestamp("last_storage_calculated").nullable();   // TIMESTAMP NULL
    table.integer("plan_id").defaultTo(null);                // INT DEFAULT NULL
    table.json("settings_json").defaultTo(null);             // JSON DEFAULT NULL
    table.string("theme", 255).defaultTo(null);              // VARCHAR(255) DEFAULT NULL
    table.string("logo_url", 255).defaultTo(null);           // VARCHAR(255) DEFAULT NULL
    table.json("onboarding_flags").defaultTo(null);          // JSON DEFAULT NULL
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("tenant_info");
};
