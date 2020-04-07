import 'source-map-support/register';

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda';
import { createLogger } from '../../utils/logger';
import { verifyToken } from '../../businessLogic/auth';

const logger = createLogger('auth');

const getClaim = (subject: string = '') => {
  return {
    principalId: subject,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: subject ? 'Allow' : 'Deny',
          Resource: '*',
        },
      ],
    },
  };
};

const authHandler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  logger.info('Caller event', event);
  let subject = '';
  try {
    const [, token] = event.authorizationToken.split(' ');
    const decoded = await verifyToken(token);
    subject = decoded.sub;
  } catch (e) {
    logger.error('User not authorized', { error: e.message });
  }
  return getClaim(subject);
};

export const handler = authHandler;
