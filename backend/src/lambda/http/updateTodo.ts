import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { updateTodo } from '../../businessLogic/todos';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';

const logger = createLogger('updateTodo');

const updateToDoHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId;
  const todoId = event.pathParameters.todoId;
  const body: UpdateTodoRequest = JSON.parse(event.body);
  logger.info('Caller event', event);
  const item = await updateTodo(userId, todoId, body);
  const response = {
    statusCode: 200,
    body: JSON.stringify({ item }),
  };
  return response;
};

export const handler = middy(updateToDoHandler)
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
