import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { deleteTodo } from '../../businessLogic/todos';

const logger = createLogger('deleteTodo');

const deleteTodoHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId;
  const todoId = event.pathParameters.todoId;
  logger.info('Caller event', event);
  await deleteTodo(userId, todoId);
  const response = {
    statusCode: 200,
    body: JSON.stringify({ todoId }),
  };
  return response;
};

export const handler = middy(deleteTodoHandler)
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));

