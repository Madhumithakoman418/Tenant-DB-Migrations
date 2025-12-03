exports.up = function (knex) {
    return knex.schema.createTable("websocket_connections", (table) => {
        table.increments("id").primary();           // Integer (PK)

        table.string("connection_id").notNullable();              // Varchar
        table.timestamp("created_at").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.timestamp("updated_at").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.string("user_id").Nullable();                    // Varchar
        table.string("client_ip").Nullable();                  // Varchar
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("websocket_connections");
};
