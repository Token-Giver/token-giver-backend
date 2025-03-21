import * as envVar from 'env-var';
import { config } from 'dotenv';

config();
export const env = {
  app: {
    port: envVar.get('APP_PORT').default(3000).asPortNumber(),
    env: envVar.get('APP_ENV').default('development').asString(),
    isProduction:
      envVar.get('APP_ENV').default('development').asString() === 'production',
    isDevelopment:
      envVar.get('APP_ENV').default('development').asString() === 'development',
    isStaging:
      envVar.get('APP_ENV').default('development').asString() === 'staging',
    apiUrl: envVar.get('API_URL').default('http://localhost:3000').asString(),
  },
  indexer: {
    network: envVar.get('NETWORK').default('sepolia').asString(),
    dnaToken: envVar.get('DNA_TOKEN').required().asString(),
    rpcUrl: envVar
      .get('STARKNET_RPC')
      .default(
        'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/A04H1Fkkg23itl8oWdVYTas9XHJ2-9MQ',
      )
      .asUrlString(),
    dnaClientUrl: envVar
      .get('DNA_CLIENT_URL')
      .default('dns:///sepolia.starknet.a5a.ch')
      .asString(),
    starknetRpc: envVar
      .get('STARKNET_RPC')
      .default(
        'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7/A04H1Fkkg23itl8oWdVYTas9XHJ2-9MQ',
      )
      .asString(),
  },
  aws: {
    accessKeyId: envVar.get('AWS_ACCESS_KEY_ID').required().asString(),
    secretAccessKey: envVar.get('AWS_SECRET_ACCESS_KEY').required().asString(),
    bucketName: envVar.get('AWS_BUCKET_NAME').required().asString(),
    region: envVar.get('AWS_REGION').required().asString(),
  },
};
