import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { app } from './app';

// create connection with database
// note that its not active database connection
// TypeORM creates you connection pull to uses connections from pull on your requests
createConnection()
  .then(async () => {
    const PORT = process.env.PORT || 3100;

    app.listen(PORT, () => console.log(`Server started on http://127.0.0.1:${PORT}`));
  })
  .catch((error) => console.log('TypeORM connection error: ', error));
