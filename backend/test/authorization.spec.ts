import { SuperAgentTest } from 'supertest';
import { Connection } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { app } from '../src/app';
import { createRequest } from './util/request';
import { clearDatabase, getDatabaseConnection } from './util/db';

describe('authorization', () => {
  let db: Connection;
  let request: SuperAgentTest;

  beforeAll(async () => {
    db = await getDatabaseConnection();
    request = createRequest(app);
  });

  describe('Should return unauthorized when not logged in', () => {
    it('when fetching lists', async () => {
      const { status } = await request.get('/lists');
      expect(status).toEqual(StatusCodes.UNAUTHORIZED);
    });

    it('when fetching list items', async () => {
      const { status } = await request.get('/lists/1/items');
      expect(status).toEqual(StatusCodes.UNAUTHORIZED);
    });
  });

  afterAll(async () => {
    await clearDatabase(db);
    await db.close();
  });
});
