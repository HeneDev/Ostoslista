import { Express } from 'express';
import { agent } from 'supertest';
import { User } from '../../src/entity';

export function createRequest(app: Express, user?: User) {
  const requestAgent = agent(app);

  if (user) {
    requestAgent.set('user-id', user.id.toString());
  }

  return requestAgent;
}
