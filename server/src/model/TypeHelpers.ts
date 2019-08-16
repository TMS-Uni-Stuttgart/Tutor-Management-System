import { Document } from 'mongoose';

export type CreateMongooseModel<T> = Omit<Document, 'id'> & Partial<T> & { _id: string };
