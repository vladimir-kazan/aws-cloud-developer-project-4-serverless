import 'source-map-support/register';

import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
const { TODOS_TABLE } = process.env;
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
const logger = createLogger('updateTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    const userId = event.requestContext.authorizer.principalId;

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
    logger.info('Update Todo item with', { updatedTodo });
    const item = await docClient
      .update({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: `SET
          #name = :name, 
          dueDate = :dueDate, 
          done = :done
        `,
        ExpressionAttributeValues: {
          ':name': updatedTodo.name,
          ':dueDate': updatedTodo.dueDate,
          ':done': updatedTodo.done,
        },
        ExpressionAttributeNames: {
          '#name': 'name',
        },
        ReturnValues: 'ALL_NEW',
      })
      .promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify({ item }),
    };
    return response;
  },
);

handler.use(httpErrorHandler()).use(cors({ credentials: true }));
