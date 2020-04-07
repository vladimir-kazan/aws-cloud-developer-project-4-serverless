import 'source-map-support/register';

import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as middy from 'middy';
import { cors } from 'middy/middlewares';
import { createLogger } from '../../utils/logger';

const { TODOS_TABLE } = process.env;
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
const logger = createLogger('getTodos');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // TODO: Get all TODO items for a current user
    const userId = event.requestContext.authorizer.principalId;

    const payload = await docClient
      .query({
        TableName: TODOS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      })
      .promise();

    logger.info('Get todo items', { payload });
    const response = {
      statusCode: 200,
      body: JSON.stringify({ items: payload.Items }),
    };
    return response;
  },
);

handler.use(cors({ credentials: true }));
