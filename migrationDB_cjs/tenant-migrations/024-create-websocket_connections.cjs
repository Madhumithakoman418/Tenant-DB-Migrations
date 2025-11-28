exports.up = function (knex) {
    return knex.schema.createTable("websocket_connections", (table) => {
        table.increments("id").primary();           // Integer (PK)

        table.string("connection_id");              // Varchar
        table.timestamp("created_at").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.timestamp("updated_at").defaultTo(knex.fn.now());  // TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        table.string("user_id");                    // Varchar
        table.string("client_ip");                  // Varchar
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("websocket_connections");
};
