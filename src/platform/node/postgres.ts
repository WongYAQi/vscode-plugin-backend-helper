import pg = require('pg')

export async function createPgClient ({ host, port }: { host: string, port: number }) {
  let client = new pg.Client({
    user: 'postgres',
    password: 'postgres',
    host,
    port
  })
  await client.connect()
  return client
}

export function executePgQuery ({ client, query }: { client: pg.Client, query: string }) {
  return client.query(query)
}

