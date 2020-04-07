import 'source-map-support/register';

import * as AWS from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';

const { TODOS_TABLE, TODOS_BUCKET, SIGNED_URL_EXPIRATION } = process.env;
const signedUrlExpiration = Number(SIGNED_URL_EXPIRATION);
const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
const s3 = new AWS.S3({
  signatureVersion: 'v4',
});
const logger = createLogger('generateUploadUrl');

const getUploadUrl = (key: string): string => {
  return s3.getSignedUrl('putObject', {
    Bucket: TODOS_BUCKET,
    Key: key,
    Expires: signedUrlExpiration,
  });
};

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId;

    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info('Caller event', event);
    const userId = event.requestContext.authorizer.principalId;
    const key = `${userId}_${todoId}`;
    const uploadUrl = getUploadUrl(key);
    await docClient
      .update({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId,
        },
        UpdateExpression: `SET attachmentUrl = :attachmentUrl`,
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${TODOS_BUCKET}.s3.amazonaws.com/${key}`,
        },
        ReturnValues: 'NONE',
      })
      .promise();
    const response = {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl }),
    };
    return response;
  },
);

handler.use(httpErrorHandler()).use(cors({ credentials: true }));
