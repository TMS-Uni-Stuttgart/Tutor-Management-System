declare module 'mongoose' {
    interface MongooseDocument {
        // All documents used have the virtual 'id' getter. Therefore we can type it properly. This overrides the type declared in the 'MongooseDocumentOptionals' interface.
        id: string;
    }
}
