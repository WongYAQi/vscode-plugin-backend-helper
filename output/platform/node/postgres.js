"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executePgQuery = exports.createPgClient = void 0;
const pg = require("pg");
async function createPgClient({ host, port }) {
    let client = new pg.Client({
        user: 'postgres',
        password: 'postgres',
        host,
        port
    });
    await client.connect();
    return client;
}
exports.createPgClient = createPgClient;
function executePgQuery({ client, query }) {
    return client.query(query);
}
exports.executePgQuery = executePgQuery;
