import { Tutorial, TutorialDTO } from 'shared/dist/model/Tutorial';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import TutorialModel, { TutorialDocument } from '../model/documents/TutorialDocument';
import { DocumentNotFoundError } from '../model/Errors';

class TutorialService {
  public async getAllTutorials(): Promise<Tutorial[]> {
    const tutorialDocuments: TutorialDocument[] = await TutorialModel.find();
    const tutorials: Tutorial[] = [];

    for (const doc of tutorialDocuments) {
      tutorials.push(await this.getTutorialOrReject(doc));
    }

    return tutorials;
  }

  public async createTutorial(dto: TutorialDTO): Promise<Tutorial> {
    // TODO: Set tutor document -- Needed if we have the ID?
    // TODO: Check correctors
    const createdTutorial = await TutorialModel.create({ ...dto });

    return this.getTutorialOrReject(createdTutorial);
  }

  public async getTutorialWithID(id: string): Promise<Tutorial> {
    const tutorial = await this.getTutorialDocumentWithID(id);
    // TODO: Populate REF fields

    return this.getTutorialOrReject(tutorial);
  }

  public async getTutorialDocumentWithID(id: string): Promise<TutorialDocument> {
    const tutorial: TutorialDocument | null = await TutorialModel.findById(id);

    if (!tutorial) {
      this.rejectTutorialNotFound();
    }

    return tutorial;
  }

  public async updateTutorial(id: string, dto: TutorialDTO): Promise<Tutorial> {
    // TODO: Implement me

    // TODO: Set tutor document -- Needed if we have the ID?
    // TODO: Change / Check correctors.

    throw new Error('Not implemented yet.');
  }

  public async deleteTutorial(id: string): Promise<void> {
    // TODO: Implement me

    // TODO: Tutorials with students should not be deletabel (create issue to adjust FRONTEND aswell!)
    throw new Error('Not implemented yet.');
  }

  private async getTutorialOrReject(document: TutorialDocument | null): Promise<Tutorial> {
    if (!document) {
      return this.rejectTutorialNotFound();
    }

    const {
      _id,
      slot,
      tutor,
      dates,
      correctors,
      startTime,
      endTime,
      students,
      teams,
      substitutes,
    } = document;

    return {
      id: _id,
      slot,
      tutor: tutor ? getIdOfDocumentRef(tutor) : undefined,
      dates,
      correctors: correctors.map(getIdOfDocumentRef),
      startTime,
      endTime,
      students,
      teams,
      substitutes,
    };
  }

  private async rejectTutorialNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('User with that ID was not found.'));
  }
}

const tutorialService = new TutorialService();
export default tutorialService;
