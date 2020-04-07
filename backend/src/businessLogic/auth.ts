import { AuthAccess } from '../dataLayer/authAccess';
import { JwtPayload } from '../models/JwtPayload';
import { verify } from 'jsonwebtoken';
import { createLogger } from '../utils/logger';

const { AUTH_CLIENT_ID, AUTH_ISSUER } = process.env;

const authAccess = new AuthAccess();
const logger = createLogger('BL/verifyToken');

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const pem = await authAccess.getPublicKey();
  logger.info('PEM & token', { pem, token });
  const decoded = verify(token, pem, {
    audience: AUTH_CLIENT_ID,
    issuer: AUTH_ISSUER,
  });
  logger.info('decoded', { decoded });
  return <JwtPayload>decoded;
};
