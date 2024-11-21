import { env } from './env';

export function getEnvPath() {
  const env: string | undefined = process.env.NODE_ENV;
  const envPath = `${process.cwd()}/.env${env ? '.' + env : '.local'}`;

  return envPath;
}

export function getDBConfig() {
  return {
    type: 'postgres',
    host: env.db.host,
    port: env.db.port,
    username: env.db.username,
    password: env.db.password,
    database: env.db.database,
    migrationsTableName: 'migration',
    ssl: env.app.isProduction,
    autoLoadEntities: true,
    synchronize: true,
  };
}
