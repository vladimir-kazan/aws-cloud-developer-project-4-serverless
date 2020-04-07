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



// import 'source-map-support/register';

// import * as AWS from 'aws-sdk';
// import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';
// import * as middy from 'middy';
// import { cors, httpErrorHandler } from 'middy/middlewares';
// import * as createError from 'http-errors';
// import { createLogger } from '../../utils/logger';

// const { TODOS_TABLE, TODOS_BUCKET } = process.env;
// const docClient = new AWS.DynamoDB.DocumentClient({ convertEmptyValues: true });
// const s3 = new AWS.S3({
//   signatureVersion: 'v4',
// });
// const logger = createLogger('deleteTodo');

// export const handler = middy(
//   async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
//     const todoId = event.pathParameters.todoId;
//     const userId = event.requestContext.authorizer.principalId;
//     // TODO: Remove a TODO item by id
//     const record = await docClient
//       .get({
//         TableName: TODOS_TABLE,
//         Key: {
//           userId,
//           todoId,
//         },
//       })
//       .promise();

//     logger.info('Item to delete', { record });
//     // if (!record || !record['todoId']) {
//     //   throw createError(404, { error: 'Todo item does not exist' });
//     // }
//     await s3.deleteObject({
//       Bucket: TODOS_BUCKET,
//       Key: `${userId}_${todoId}`
//     }).promise();

//     await docClient
//       .delete({
//         TableName: TODOS_TABLE,
//         Key: {
//           userId,
//           todoId,
//         },
//       })
//       .promise();

//     const response = {
//       statusCode: 200,
//       body: JSON.stringify({ todoId }),
//     };
//     return response;
//   },
// );

// handler.use(httpErrorHandler()).use(cors({ credentials: true }));
