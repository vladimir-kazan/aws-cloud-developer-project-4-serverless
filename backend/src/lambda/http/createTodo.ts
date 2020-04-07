import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { createTodo } from '../../businessLogic/todos';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';

const logger = createLogger('createTodo');

const createTodoHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId;
  const body: CreateTodoRequest = JSON.parse(event.body);
  logger.info('Caller event', event);
  const item = await createTodo(userId, body);
  const response = {
    statusCode: 201,
    body: JSON.stringify({ item }),
  };
  return response;
};

export const handler = middy(createTodoHandler)
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
