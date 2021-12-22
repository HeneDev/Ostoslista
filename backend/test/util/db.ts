import {
  Connection,
  ConnectionOptions,
  createConnection,
  getConnectionOptions,
} from 'typeorm';

export async function createDatabase(connectionOptions: ConnectionOptions) {
  const db = await createConnection({
    ...connectionOptions,
    type: 'postgres',
    database: 'postgres', // Use default database for connection
    name: 'it-setup',
  });

  const exists = await db.query(
    `SELECT 1 FROM pg_database WHERE datname = '${connectionOptions.database}'`,
  );

  if (!exists || exists.length === 0) {
    await db.query(`CREATE DATABASE "${connectionOptions.database}"`);
  }

  await db.close();
}

export async function getDatabaseConnection(name = 'it') {
  // Get connection options from 'ormconfig' file
  const connectionOptions = await getConnectionOptions(name);

  // Create database for tests if doesn't already exist
  await createDatabase(connectionOptions);

  // Return connection with 'default' name
  // Name is required to application work
  return createConnection({
    ...connectionOptions,
    name: 'default',
  });
}

export function clearDatabase(db: Connection) {
  // Get database entities
  const entities = db.entityMetadatas;

  // Clear tables and restart auto increment
  const queries = entities.map((entity) => db.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`));

  return Promise.all(queries);
}
