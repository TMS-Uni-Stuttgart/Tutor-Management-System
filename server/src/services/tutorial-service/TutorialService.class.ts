import _ from 'lodash';
import { Student } from 'shared/dist/model/Student';
import { SubstituteDTO, Tutorial, TutorialDTO } from 'shared/dist/model/Tutorial';
import { User } from 'shared/dist/model/User';
import { Ref, Typegoose } from 'typegoose';
import { isDocument } from 'typegoose/lib/utils';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { StudentDocument } from '../../model/documents/StudentDocument';
import TutorialModel, {
  TutorialDocument,
  TutorialSchema,
} from '../../model/documents/TutorialDocument';
import { UserDocument } from '../../model/documents/UserDocument';
import { BadRequestError, DocumentNotFoundError } from '../../model/Errors';
import studentService from '../student-service/StudentService.class';
import userService from '../user-service/UserService.class';
import { Types } from 'mongoose';

class TutorialService {
  public async getAllTutorials(): Promise<Tutorial[]> {
    const tutorialDocuments: TutorialDocument[] = await TutorialModel.find();
    const tutorials: Tutorial[] = [];

    for (const doc of tutorialDocuments) {
      tutorials.push(await this.getTutorialOrReject(doc));
    }

    return tutorials;
  }

  public async createTutorial({
    dates,
    endTime,
    startTime,
    correctorIds,
    ...dto
  }: TutorialDTO): Promise<Tutorial> {
    const tutor: UserDocument | undefined = dto.tutorId
      ? await userService.getDocumentWithId(dto.tutorId)
      : undefined;

    const tutorial: Omit<TutorialSchema, keyof Typegoose> = {
      ...dto,
      tutor,
      dates: dates.map(d => new Date(d)),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      students: [],
      teams: new Types.Array(),
      correctors: [],
    };

    const createdTutorial = await TutorialModel.create(tutorial);

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

    return Promise.all(students.map(stud => studentService.getStudentOrReject(stud)));
  }

  public async getSubstitutesOfTutorial(id: string): Promise<Map<Date, User>> {
    const tutorial = await this.getDocumentWithID(id);
    const substitutesByDate: Map<Date, User> = new Map();

    if (!tutorial.substitutes) {
      return substitutesByDate;
    }

    for (const [key, subst] of tutorial.substitutes) {
      const date = new Date(key);
      const substitute: User = await userService.getUserWithId(subst);

      substitutesByDate.set(date, substitute);
    }

    return substitutesByDate;
  }

  public async addSubstituteToTutorial(id: string, substDTO: SubstituteDTO): Promise<Tutorial> {
    const tutorial = await this.getDocumentWithID(id);
    const substitute = await userService.getDocumentWithId(substDTO.tutorId);

    const newDates: Date[] = substDTO.dates.map(d => new Date(d));
    const previousDates: Date[] = [];

    if (!tutorial.substitutes) {
      tutorial.substitutes = new Types.Map();
    }

    for (const [key, substId] of tutorial.substitutes) {
      if (substId === substDTO.tutorId) {
        previousDates.push(new Date(key));
      }
    }

    for (const date of _.difference(previousDates, newDates)) {
      tutorial.substitutes.delete(date.toDateString());
    }

    for (const date of _.difference(newDates, previousDates)) {
      tutorial.substitutes.set(date.toDateString(), substitute._id);
    }

    return this.getTutorialOrReject(await tutorial.save());
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

    const parsedSubstitutes: Tutorial['substitutes'] = {};
    if (substitutes) {
      substitutes.forEach((substId, key) => (parsedSubstitutes[key] = substId));
    }

    return {
      id: _id,
      slot,
      tutor: tutor ? getIdOfDocumentRef(tutor) : undefined,
      dates: dates.map(d => new Date(d)),
      correctors: correctors.map(getIdOfDocumentRef),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      students: students.map(getIdOfDocumentRef),
      teams: teams.map(getIdOfDocumentRef),
      substitutes: parsedSubstitutes,
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
