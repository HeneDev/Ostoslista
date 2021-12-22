import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { app } from '../src/app';

describe.only('Documentation', () => {
  it('Get HTML documentation file', async () => {
    const { status, headers } = await request(app).get('/docs/');

    expect(status).toEqual(StatusCodes.OK);
    expect(headers['content-type']).toContain('text/html');
  });

  it('Get JSON documentation file', async () => {
    const { status, body, headers } = await request(app).get('/docs.json');

    expect(status).toEqual(StatusCodes.OK);
    expect(body.components).toBeDefined();
    expect(body.paths).toBeDefined();
    expect(body.openapi).toEqual('3.0.0');
    expect(headers['content-type']).toContain('application/json');
  });
});
