import { ConnectionOptions } from 'mongoose';

interface DatabaseConfig {
  databaseURL: string;
  config: ConnectionOptions;
}

const config: DatabaseConfig = {
  databaseURL: 'mongodb://localhost:27017/tms',
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

export default config;
