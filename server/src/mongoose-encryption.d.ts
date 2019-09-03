declare module 'mongoose' {
  interface MongooseDocument extends MongooseDocumentOptionals {
    id: string;
  }
}
