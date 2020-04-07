import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { getTodos } from '../../businessLogic/todos';

const logger = createLogger('getTodos');

const getTodosHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId;
  logger.info('Caller event', event);
  const items = await getTodos(userId);
  const response = {
    statusCode: 200,
    body: JSON.stringify({ items }),
  };
  return response;
};

export const handler = middy(getTodosHandler)
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
