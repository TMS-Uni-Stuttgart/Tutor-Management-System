import { ConnectionOptions } from 'mongoose';

export interface DatabaseConfig {
  databaseURL: string;
  secret: string;
  config: ConnectionOptions;
}

const databaseConfig: DatabaseConfig = {
  databaseURL: 'mongodb://localhost:27017/tms',
  secret: 'keyboard cat',
  config: {
    useNewUrlParser: true,
    // This is needed bc the docker-compose file
    authSource: 'admin',
    auth: {
      user: 'root',
      password: 'example',
    },
    authMechanism: 'SCRAM-SHA-1',
  },
};

export default databaseConfig;
