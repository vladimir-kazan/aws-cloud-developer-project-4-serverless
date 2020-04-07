import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';

import { createLogger } from '../../utils/logger';
import { generateUploadUrl } from '../../businessLogic/todos';

const logger = createLogger('generateUploadUrl');

const generateUploadUrlHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const userId = event.requestContext.authorizer.principalId;
  const todoId = event.pathParameters.todoId;
  logger.info('Caller event', event);
  const uploadUrl = await generateUploadUrl(userId, todoId);
  const response = {
    statusCode: 200,
    body: JSON.stringify({ uploadUrl }),
  };
  return response;
};

export const handler = middy(generateUploadUrlHandler)
  .use(httpErrorHandler())
  .use(cors({ credentials: true }));
