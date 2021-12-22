import { Action, useExpressServer } from 'routing-controllers';
import express, {
  Response, Request, NextFunction,
} from 'express';
import swaggerUi from 'swagger-ui-express';
import { getRepository } from 'typeorm';
import { AuthController, ListController, ListItemController } from './controller';
import { ErrorHandler } from './middleware';
import { getOpenApiSpec } from './util/open-api';
import { User } from './entity';

// Create Express app
const expressApp = express();

// Register routing controllers
const app = useExpressServer(expressApp, {
  controllers: [
    ListController,
    ListItemController,
    AuthController,
  ],
  middlewares: [
    ErrorHandler,
  ],
  cors: true,
  defaultErrorHandler: false,
  validation: {
    always: true,
  },
  authorizationChecker: async (action: Action) => {
    const id = action.request.headers['user-id'];

    return getRepository(User)
      .findOne({ id }, { select: ['id'] })
      .then((user) => user !== undefined);
  },
  currentUserChecker: async (action: Action) => {
    const id = action.request.headers['user-id'];

    return getRepository(User)
      .findOne({ id }, { select: ['id'] });
  },
});

// Middleware for Swagger UI documentation
app.use('/docs', swaggerUi.serve, swaggerUi.setup(getOpenApiSpec()));

// Middleware for Open API JSON documentation
app.use('/docs.json', (req: Request, res: Response, next: NextFunction) => {
  res.json(getOpenApiSpec());
  next();
});

export { app };
