import 'source-map-support/register';

import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';
// import * as createError from 'http-errors'
import { createLogger } from '../../utils/logger';

const { TODOS_TABLE } = process.env;
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
const logger = createLogger('deleteTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;
    const userId = event.requestContext.authorizer.principalId;
    // TODO: Remove a TODO item by id
    await docClient
      .delete({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId,
        },
      })
      .promise();

    logger.info('Delete Todo item', { todoId });

    const response = {
      statusCode: 200,
      body: JSON.stringify({ todoId }),
    };
    return response;
  },
);

handler
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));