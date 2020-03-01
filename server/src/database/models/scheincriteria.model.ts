import { DocumentType, modelOptions, mongoose, post, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { Scheincriteria } from '../../module/scheincriteria/container/Scheincriteria';
import { ScheinCriteriaResponse } from '../../shared/model/ScheinCriteria';

/**
 * Transforms the criteria to an actual object instance.
 *
 * If the provided parameter is `null` the function is essentially a no-op.
 *
 * @param doc Document to perform transformation on or `null`.
 */
function transformCriteriaToInstance(doc: ScheincriteriaModel | null) {
  if (!doc) {
    return;
  }

  const { identifier, ...data } = doc.criteria;
  doc.criteria = Scheincriteria.fromDTO({ identifier, data, name: doc.name });
}

@post<ScheincriteriaModel>('find', function(result) {
  result.forEach(transformCriteriaToInstance);
})
@post<ScheincriteriaModel>('findOne', transformCriteriaToInstance)
@modelOptions({ schemaOptions: { collection: CollectionName.SCHEINCRITERIA } })
export class ScheincriteriaModel {
  constructor(fields: NoFunctions<ScheincriteriaModel>) {
    Object.assign(this, fields);
  }

  @prop({ required: true })
  name!: string;

  @prop({ required: true, type: mongoose.Schema.Types.Mixed })
  criteria!: Scheincriteria;

  toDTO(this: ScheincriteriaDocument): ScheinCriteriaResponse {
    const data: ScheinCriteriaResponse['data'] = {};

    for (const key in JSON.parse(JSON.stringify(this.criteria))) {
      if (key !== 'identifier') {
        data[key] = (this.criteria as any)[key];
      }
    }

    return {
      id: this.id,
      identifier: this.criteria.identifier,
      name: this.name,
      data,
    };
  }
}

export type ScheincriteriaDocument = DocumentType<ScheincriteriaModel>;
