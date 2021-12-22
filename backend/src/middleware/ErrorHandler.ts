import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import {
  ExpressErrorMiddlewareInterface,
  HttpError,
  Middleware,
} from 'routing-controllers';
import { ErrorResponse, GroupedValidationError } from '../model';

@Middleware({ type: 'after' })
export class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(
    error: HttpError,
    request: Request,
    response: Response,
  ) {
    const { method, url, body: json } = request;

    const errorResponse: ErrorResponse = {
      message: error.message,
    };

    // If original error includes list of errors array parse them as
    // validation errors
    if ('errors' in error) {
      // @ts-expect-error
      errorResponse.errors = this.parseValidationErrors(error.errors);
    }

    // Include stack trace when running in dev mode
    if (process.env.TS_NODE_DEV) {
      errorResponse.stack = error.stack?.split('\n');
    }

    // Log the error in dev mode
    if (process.env.TS_NODE_DEV) {
      console.error(
        `Request ${method} ${url} ${
          json ? JSON.stringify(json) : '<no body>'
        } failed with:\n`,
        errorResponse,
      );
    }

    // Set the status code and error as json body
    response.status(error.httpCode ?? 500).json(errorResponse);
  }

  private parseValidationErrors(errors: ValidationError[]) {
    try {
      // Parse validation errors to more readable format
      return errors.reduce((prev, { property, constraints }) => {
        prev[property] = constraints;
        return prev;
      }, {} as GroupedValidationError);
    } catch {
      // ... or return empty object on error
      return {};
    }
  }
}
