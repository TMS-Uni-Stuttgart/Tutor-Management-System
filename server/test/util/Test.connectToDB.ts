import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import userService from '../../src/services/user-service/UserService.class';

let mongod: MongoMemoryServer | undefined;

export async function connectToDB() {
  mongod = new MongoMemoryServer({
    instance: {
      dbName: 'tms',
    },
    debug: false,
  });
  const uri = await mongod.getConnectionString();

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await userService.initAdmin();
  } catch (err) {
    throw err;
  }
}

export async function disconnectFromDB(done: jest.DoneCallback) {
  await mongoose.disconnect();

  if (mongod) {
    await mongod.stop();
  }

  done();
}
