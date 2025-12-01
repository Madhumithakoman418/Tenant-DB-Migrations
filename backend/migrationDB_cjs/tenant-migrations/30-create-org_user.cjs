exports.up = function (knex) {
  return knex.schema.createTable("org_users", (table) => {
    table.increments("link_id").primary();       // PK (INT AUTO_INCREMENT)

    table.integer("user_id").unsigned().notNullable();   // FK → users.user_id
    table.integer("org_id").unsigned().notNullable();    // FK → orgs.org_id  

    table.integer("user_role").nullable();       // INT
    table.integer("link_state").nullable();      // INT
    table.integer("added_by").nullable();        // INT
    table.timestamp("updated_on").defaultTo(knex.fn.now()); // TIMESTAMP

  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("org_users");
};