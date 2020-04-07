import 'source-map-support/register';
import axios from 'axios';
import { createLogger } from '../utils/logger';

const { AUTH_JWKS } = process.env;
const logger = createLogger('AuthAccessClass');

const certToPEM = (cert: string) => {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

export class AuthAccess {
  private pem = '';

  async getPublicKey(forceDownload: boolean = false): Promise<string> {
    if (!this.pem || forceDownload) {
      const { data } = await axios.get(AUTH_JWKS);
      const [key] = data.keys;
      const x5c = key.x5c[0];
      this.pem = certToPEM(x5c);
    }
    logger.info('PEM', { pem: this.pem });
    return this.pem;
  }
}
