# Ohjelmistoprojekti Backend

## Requirements

- Node.js v12.20+
- Docker and Docker Compose


## Setup for development

1. Install needed depencies with `npm i` command
2. Copy `ormconfig.sample.js` file to `ormconfig.js`
3. Set a password to `ormconfig.js` file
4. Start the PostgreSQL database with `npm run db:start` command
5. Start the Node.js dev server with `npm run dev`
6. Development server should now be running on http://127.0.0.1:3100

To generate some sample data execute [sample-data.sql](./sql/sample-data.sql) file inside the database.


## Production

Update contents of `ormconfig.js` to match with production environment. After that simply run `docker-compose up -d` to start server on http://127.0.0.1:3100.


## Running tests

1. Setup local PostgreSQL database for testing
2. Set credentials to `ormconfig.js`'s test configuration
3. Run `npm run test` or `npm run tdd` to run in watch mode
