import { Document } from 'mongoose';

export type CreateMongooseModel<T> = Omit<Document, 'id'> & T & { _id: string };
