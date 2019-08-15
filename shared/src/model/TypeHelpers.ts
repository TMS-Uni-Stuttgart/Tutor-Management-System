import { Typegoose } from 'typegoose';

export type OmitTypegoose<T> = Omit<T, keyof Typegoose> & { readonly _id: string };
