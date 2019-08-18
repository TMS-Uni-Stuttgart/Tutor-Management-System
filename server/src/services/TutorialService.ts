import { Tutorial, TutorialDTO } from 'shared/dist/model/Tutorial';
import { getIdOfDocumentRef } from '../helpers/documentHelpers';
import TutorialModel, { TutorialDocument } from '../model/documents/TutorialDocument';
import { DocumentNotFoundError, BadRequestError } from '../model/Errors';
import userService from './UserService';
import { UserDocument } from '../model/documents/UserDocument';
import { CollectionName } from '../model/CollectionName';

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
    const tutor: UserDocument | undefined = dto.tutorId
      ? await userService.getUserDocumentWithId(dto.tutorId)
      : undefined;
    const createdTutorial = await TutorialModel.create({ ...dto, tutor });

    if (tutor) {
      tutor.tutorials = [...tutor.tutorials, createdTutorial];
      await tutor.save();
    }

    // TODO: Check correctors

    return this.getTutorialOrReject(createdTutorial);
  }

  public async getTutorialWithID(id: string): Promise<Tutorial> {
    const tutorial = await this.getTutorialDocumentWithID(id);
    // TODO: Populate REF fields

    return this.getTutorialOrReject(tutorial);
  }

  public async getTutorialDocumentWithID(id: string): Promise<TutorialDocument> {
    const tutorial: TutorialDocument | null = await TutorialModel.findById(id).populate(
      CollectionName.USER
    );

    if (!tutorial) {
      this.rejectTutorialNotFound();
    }

    return tutorial;
  }

  public async updateTutorial(id: string, dto: TutorialDTO): Promise<Tutorial> {
    // TODO: Implement me

    // TODO: Adjust tutors' documents so they know that their tutorial(s) might have changed.

    // TODO: Change / Check correctors.

    throw new Error('Not implemented yet.');
  }

  public async deleteTutorial(id: string): Promise<void> {
    const tutorial: TutorialDocument = await this.getTutorialDocumentWithID(id);

    if (tutorial.students && tutorial.students.length > 0) {
      return Promise.reject(new BadRequestError('A tutorial with students cannot be deleted.'));
    }

    tutorial.remove();
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
