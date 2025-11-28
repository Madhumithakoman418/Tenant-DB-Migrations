exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("user_id").primary();                 // INT (PK)
    table.string("firstname");                             // VARCHAR
    table.string("lastname");                              // VARCHAR
    table.string("email");                                 // VARCHAR
    table.string("phone_no");                              // VARCHAR
    table.text("avatar_image_url");                        // TEXT
    table.integer("user_role");                            // INT
    table.string("ci_org_guid");                           // VARCHAR
    table.string("cognito_sub");                           // VARCHAR
    table.timestamp("last_login").nullable();              // TIMESTAMP NULL
    table.timestamp("created_date").defaultTo(knex.fn.now()); // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.timestamp("updated_on").defaultTo(knex.fn.now());   // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    table.string("identity_provider");                     // VARCHAR
    table.integer("is_archived").defaultTo(0);             // INT DEFAULT 0
    table.binary("answer1").nullable();                    // BLOB
    table.binary("answer2").nullable();                    // BLOB
    table.binary("answer3").nullable();                    // BLOB
    table.binary("answer4").nullable();                    // BLOB
    table.binary("answer5").nullable();                    // BLOB
    table.integer("subscription_plan").nullable();         // INT NULL
    table.timestamp("archived_date").nullable();           // TIMESTAMP NULL
    table.integer("changed_by").defaultTo(0);              // INT DEFAULT 0
    table.integer("org_id").defaultTo(0);                  // INT DEFAULT 0
    table.integer("user_signup_status").nullable();        // INT NULL
    table.string("customer_type").nullable();              // VARCHAR NULL
    
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("users");
};
