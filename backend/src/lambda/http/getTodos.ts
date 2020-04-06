import 'source-map-support/register';

import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import { createLogger } from '../../utils/logger';

const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
const { TODOS_TABLE } = process.env;
const logger = createLogger('getTodos');

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user
  const userId = event.requestContext.authorizer.principalId;

  const payload = await docClient
    .query({
      TableName: TODOS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false,
    })
    .promise();
  
  logger.info('Get todo items', { payload });
  const response = {
    statusCode: 200,
    body: JSON.stringify(payload),
  };
  return response;
};
