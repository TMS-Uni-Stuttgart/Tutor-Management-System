import { Tutorial, TutorialDTO } from 'shared/dist/model/Tutorial';
import { Ref } from 'typegoose';
import { isDocument } from 'typegoose/lib/utils';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import TutorialModel, { TutorialDocument } from '../../model/documents/TutorialDocument';
import { UserDocument } from '../../model/documents/UserDocument';
import { BadRequestError, DocumentNotFoundError } from '../../model/Errors';
import userService from '../user-service/UserService.class';
import { Student } from 'shared/dist/model/Student';
import studentService from '../student-service/StudentService.class';
import { StudentDocument } from '../../model/documents/StudentDocument';

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
      ? await userService.getDocumentWithId(dto.tutorId)
      : undefined;
    const createdTutorial = await TutorialModel.create({ ...dto, tutor });

    if (tutor) {
      tutor.tutorials = [...(tutor.tutorials || []), createdTutorial];
      await tutor.save();
    }

    // TODO: Check correctors

    return this.getTutorialOrReject(createdTutorial);
  }

  public async getTutorialWithID(id: string): Promise<Tutorial> {
    const tutorial = await this.getDocumentWithID(id);

    return this.getTutorialOrReject(tutorial);
  }

  public async getDocumentWithID(id: string): Promise<TutorialDocument> {
    const tutorial: TutorialDocument | null = await TutorialModel.findById(id);

    if (!tutorial) {
      return this.rejectTutorialNotFound();
    }

    return tutorial;
  }

  public async updateTutorial(
    id: string,
    { slot, dates, startTime, endTime, tutorId, correctorIds }: TutorialDTO
  ): Promise<Tutorial> {
    const doc: TutorialDocument = await this.getDocumentWithID(id);
    const tutorial: TutorialDocument = await doc.populate('tutor').execPopulate();

    if (tutorial.tutor) {
      const tutor = await this.getTutorDocumentOfTutorial(tutorial.tutor);

      if (tutor._id !== tutorId) {
        tutor.tutorials = await this.filterTutorials(tutor.tutorials, t => t !== id);

        await tutor.save();
      }
    }

    tutorial.slot = slot;
    tutorial.startTime = new Date(startTime);
    tutorial.endTime = new Date(endTime);
    tutorial.dates = dates.map(date => new Date(date));

    // TODO: Change / Check correctors.

    if (tutorId) {
      const nextTutor = await userService.getDocumentWithId(tutorId);

      nextTutor.tutorials = [...nextTutor.tutorials, tutorial];
      await nextTutor.save();
    }

    return this.getTutorialOrReject(await tutorial.save());
  }

  public async deleteTutorial(id: string): Promise<Tutorial> {
    const tutorial: TutorialDocument = await this.getDocumentWithID(id);

    if (tutorial.students && tutorial.students.length > 0) {
      return Promise.reject(new BadRequestError('A tutorial with students cannot be deleted.'));
    }

    if (tutorial.tutor) {
      const tutor = await this.getTutorDocumentOfTutorial(tutorial.tutor);

      tutor.tutorials = await this.filterTutorials(
        tutor.tutorials,
        t => t !== tutorial._id.toString()
      );

      await tutor.save();
    }

    return this.getTutorialOrReject(await tutorial.remove());
  }

  public async getStudentsOfTutorial(id: string): Promise<Student[]> {
    const tutorial = await this.getDocumentWithID(id);

    await tutorial.populate('students').execPopulate();
    const students: StudentDocument[] = tutorial.students as StudentDocument[];

    return Promise.all(students.map(studentService.getStudentOrReject));
  }

  public async getTutorialOrReject(document: TutorialDocument | null): Promise<Tutorial> {
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
      students: students.map(getIdOfDocumentRef),
      teams: teams.map(getIdOfDocumentRef),
      substitutes,
    };
  }

  private async rejectTutorialNotFound(): Promise<any> {
    return Promise.reject(new DocumentNotFoundError('Tutorial with that ID was not found.'));
  }

  private async getTutorDocumentOfTutorial(tutor: Ref<UserDocument>): Promise<UserDocument> {
    return isDocument(tutor) ? tutor : await userService.getDocumentWithId(tutor.toString());
  }

  private async filterTutorials(
    tutorials: Ref<TutorialDocument>[],
    filterFunc: (id: string) => boolean
  ): Promise<TutorialDocument[]> {
    const promises = tutorials
      .map(getIdOfDocumentRef)
      .filter(filterFunc)
      .map(id => this.getDocumentWithID(id));

    return Promise.all(promises);
  }
}

const tutorialService = new TutorialService();
export default tutorialService;
