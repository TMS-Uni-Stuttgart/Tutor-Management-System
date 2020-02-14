import { modelOptions, DocumentType } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'students' } })
export class StudentModel {}

export type StudentDocument = DocumentType<StudentModel>;
