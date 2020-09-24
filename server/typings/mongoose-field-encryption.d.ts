declare module 'mongoose-field-encryption' {
  function fieldEncryption(schema: any, options: any): void;

  function encrypt(text: string, secret: string): string;

  function decrypt(content: string, secret: string): any;

  export interface EncryptionFunctionsOnDocument {
    encryptFieldsSync(): void;
    decryptFieldsSync(): void;
    stripEncryptionFieldMarkers(): void;
  }

  export type EncryptedDocument<T> = T & EncryptionFunctionsOnDocument;
}
