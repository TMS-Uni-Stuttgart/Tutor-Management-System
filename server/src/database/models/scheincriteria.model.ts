import { DocumentType, modelOptions, mongoose, prop } from '@typegoose/typegoose';
import { CollectionName } from '../../helpers/CollectionName';
import { NoFunctions } from '../../helpers/NoFunctions';
import { Scheincriteria } from '../../module/scheincriteria/container/Scheincriteria';
import { ScheinCriteriaResponse } from '../../shared/model/ScheinCriteria';

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
