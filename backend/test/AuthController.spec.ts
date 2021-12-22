import request from 'supertest';
import { Connection } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { app } from '../src/app';
import { User } from '../src/entity';
import { clearDatabase, getDatabaseConnection } from './util/db';

describe('AuthController', () => {
  let db: Connection;

  beforeAll(async () => {
    db = await getDatabaseConnection();
  });

  it('Register succesfully', async () => {
    const newUser = new User();
    newUser.username = 'Kalle';
    newUser.email = 'Kalle@tuni.fi';
    newUser.password = 'KallenSalasana1';

    const { status, body } = await request(app)
      .post('/users/register')
      .send(newUser);
    expect(status).toEqual(StatusCodes.CREATED);
    expect(body.username).toEqual('Kalle');
    expect(body.email).toEqual('Kalle@tuni.fi');
  });

  it('Try to register an account with too short password', async () => {
    const newUser1 = new User();
    newUser1.username = 'Ville';
    newUser1.email = 'Ville@tuni.fi';
    newUser1.password = '12345';

    const { status } = await request(app)
      .post('/users/register')
      .send(newUser1);

    expect(status).toEqual(StatusCodes.BAD_REQUEST);
  });

  it('Login succesfully with existing account', async () => {
    const newUser = new User();
    newUser.username = 'Erkki';
    newUser.email = 'erkki.elavainen@tuni.fi';
    newUser.password = 'ErkinSalasana1';

    await request(app)
      .post('/users/register')
      .send(newUser);

    const user = await db
      .getRepository(User)
      .findOne({ email: 'erkki.elavainen@tuni.fi' });

    const { status, body } = await request(app)
      .post('/users/login')
      .send({ email: user.email, password: 'ErkinSalasana1' });

    expect(status).toEqual(StatusCodes.OK);
    expect(body.username).toEqual('Erkki');
    expect(body.email).toEqual('erkki.elavainen@tuni.fi');
  });

  it('Try to login with wrong credentials', async () => {
    const { status } = await request(app)
      .post('/users/login')
      .send({ email: 'Ville@tuni.fi', password: 'VillenSalasana1' });

    expect(status).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
  });

  afterAll(async () => {
    await clearDatabase(db);
    await db.close();
  });
});
