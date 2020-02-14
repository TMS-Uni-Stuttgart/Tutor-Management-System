import { DocumentType, modelOptions, plugin, prop } from '@typegoose/typegoose';
import mongooseAutoPopulate from 'mongoose-autopopulate';
import { CollectionName } from '../../../helpers/CollectionName';
import { TutorialModel, TutorialDocument } from '../../tutorial/tutorial.model';

@plugin(mongooseAutoPopulate)
@modelOptions({ schemaOptions: { collection: CollectionName.TEAM } })
export class TeamModel {
  @prop({ required: true })
  teamNo!: number;

  @prop({ required: true, autopopulate: true, ref: TutorialModel })
  tutorial!: TutorialDocument;

  // TODO: Points
}

export type TeamDocument = DocumentType<TeamModel>;
