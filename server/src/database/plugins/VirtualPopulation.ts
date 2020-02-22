import { DocumentType } from '@typegoose/typegoose';
import { Schema } from 'mongoose';

type PopulationFunction<M> = (document?: DocumentType<M>) => Promise<void>;

export interface VirtualPopulationOptions<M> {
  populateDocument: PopulationFunction<M>;
}

/**
 * Adds hooks to populate documents after the following queries:
 * - `findOne`
 * - `save`
 *
 * Population is done by calling the provided `populateDocument` function.
 *
 * @param schema Schema to modify
 * @param options Plugin options
 */
export default function VirtualPopulation<M>(
  schema: Schema<M>,
  { populateDocument }: VirtualPopulationOptions<M>
) {
  if (!assertPopulateDocument(populateDocument)) {
    return;
  }

  const populateFunction = async function(result: any, next: () => void) {
    await populateDocument(result);

    next();
  };

  schema.post('findOne', populateFunction);
  schema.post('save', populateFunction);
}

function assertPopulateDocument<M>(
  populateDocument: any
): populateDocument is PopulationFunction<M> {
  if (!populateDocument) {
    throw new Error('The populateDocument() function is not specified in the plugin options.');
  }

  if (typeof populateDocument !== 'function') {
    throw new Error(
      `The populatedDocument property in the plugin's options is not a function (type is '${typeof populateDocument}')`
    );
  }

  if (populateDocument.length !== 1) {
    throw new Error(
      `The populateDocument function takes in ${populateDocument.length} arguments but it must only take 1 argument.`
    );
  }

  return true;
}
