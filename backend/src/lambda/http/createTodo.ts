import 'source-map-support/register';

import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import * as uuid from 'uuid';

import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import { createLogger } from '../../utils/logger';

const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
const { TODOS_TABLE } = process.env;
const logger = createLogger('createTodo');

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const body: CreateTodoRequest = JSON.parse(event.body);
  // TODO: Implement creating a new TODO item
  const payload = {
    ...body,
    userId: event.requestContext.authorizer.principalId,
    createdAt: new Date().toISOString(),
    todoId: uuid.v4(),
    done: false,
    attachmentUrl: '',
  };

  logger.info('Create new item', { payload });

  await docClient
    .put({
      TableName: TODOS_TABLE,
      Item: payload,
    })
    .promise();

  return {
    statusCode: 201,
    body: JSON.stringify(payload),
  };
};
