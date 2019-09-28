import { parse } from 'date-fns';
import _ from 'lodash';
import { Types } from 'mongoose';
import { Student } from 'shared/dist/model/Student';
import { SubstituteDTO, Tutorial, TutorialDTO } from 'shared/dist/model/Tutorial';
import { User, TutorInfo } from 'shared/dist/model/User';
import { Ref } from '@hasezoey/typegoose';
import { isDocument } from '@hasezoey/typegoose';
import { getIdOfDocumentRef } from '../../helpers/documentHelpers';
import { TypegooseDocument } from '../../helpers/typings';
import { StudentDocument } from '../../model/documents/StudentDocument';
import TutorialModel, {
  TutorialDocument,
  TutorialSchema,
} from '../../model/documents/TutorialDocument';
import { UserDocument } from '../../model/documents/UserDocument';
import { BadRequestError, DocumentNotFoundError } from '../../model/Errors';
import studentService from '../student-service/StudentService.class';
import userService from '../user-service/UserService.class';

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

    const correctors: UserDocument[] = await Promise.all(
      correctorIds.map(corr => userService.getDocumentWithId(corr))
    );

    const { startDate, endDate } = this.parseStartAndEndTimes(startTime, endTime);

    const tutorial: TypegooseDocument<TutorialSchema> = {
      ...dto,
      tutor,
      dates: dates.map(d => new Date(d)),
      startTime: startDate,
      endTime: endDate,
      students: [],
      teams: new Types.Array(),
      correctors,
    };

    const createdTutorial = await TutorialModel.create(tutorial);

    if (tutor) {
      await userService.makeUserTutorOfTutorial(tutor, createdTutorial, { saveUser: true });
      // tutor.tutorials = [...(tutor.tutorials || []), createdTutorial];
      // await tutor.save();
    }

    return this.getTutorialOrReject(createdTutorial);
  }

  public async updateTutorial(
    id: string,
    { slot, dates, startTime, endTime, tutorId, correctorIds }: TutorialDTO
  ): Promise<Tutorial> {
    const doc: TutorialDocument = await this.getDocumentWithID(id);
    const tutorial: TutorialDocument = await doc.populate('tutor').execPopulate();
    const currentCorrectors: string[] = tutorial.correctors.map(getIdOfDocumentRef);

    const correctorsToRemove = await Promise.all(
      _.difference(currentCorrectors, correctorIds).map(corr => userService.getDocumentWithId(corr))
    );

    const correctorsToAdd = await Promise.all(
      _.difference(correctorIds, currentCorrectors).map(corr => userService.getDocumentWithId(corr))
    );

    // const correctors: UserDocument[] = await Promise.all(
    //   correctorIds.map(corr => userService.getDocumentWithId(corr))
    // );

    if (tutorial.tutor) {
      if (getIdOfDocumentRef(tutorial.tutor) !== tutorId) {
        const tutor = await this.getTutorDocumentOfTutorial(tutorial.tutor);

        await userService.removeUserAsTutorFromTutorial(tutor, tutorial, { saveUser: true });
      }
    }

    const { startDate, endDate } = this.parseStartAndEndTimes(startTime, endTime);

    tutorial.slot = slot;
    tutorial.startTime = startDate;
    tutorial.endTime = endDate;
    tutorial.dates = dates.map(date => new Date(date));

    if (tutorId) {
      if (!tutorial.tutor || getIdOfDocumentRef(tutorial.tutor) !== tutorId) {
        const nextTutor = await userService.getDocumentWithId(tutorId);

        await userService.makeUserTutorOfTutorial(nextTutor, tutorial, { saveUser: true });
      }
    }

    for (const corr of correctorsToRemove) {
      await userService.removeUserAsCorrectorFromTutorial(corr, tutorial, { saveUser: true });
    }

    for (const corr of correctorsToAdd) {
      await userService.makeUserCorrectorOfTutorial(corr, tutorial, { saveUser: true });
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

      tutor.tutorials = await this.filterTutorials(tutor.tutorials, t => t !== tutorial.id);

      await tutor.save();
    }

    return this.getTutorialOrReject(await tutorial.remove());
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

  public async getTutorInfoOfTutorial(id: string): Promise<TutorInfo> {
    const tutorial = await this.getDocumentWithID(id);

    if (!tutorial.tutor) {
      throw new BadRequestError('Tutorial does not have a tutor.');
    }

    const { lastname, firstname } = await userService.getDocumentWithId(
      getIdOfDocumentRef(tutorial.tutor)
    );

    return { lastname, firstname };
  }

  public async getCorrectorsOfTutorial(id: string): Promise<User[]> {
    const tutorial = await this.getDocumentWithID(id);
    await tutorial.populate('correctors').execPopulate();

    const correctors: UserDocument[] = tutorial.correctors as UserDocument[];

    return Promise.all(correctors.map(cor => userService.getUserOrReject(cor)));
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
      tutorial.substitutes.set(date.toDateString(), substitute.id);
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

  private parseStartAndEndTimes(startTime: string, endTime: string) {
    const startDate = parse(startTime, 'HH:mm:ss', new Date());
    const endDate = parse(endTime, 'HH:mm:ss', new Date());

    startDate.setSeconds(0);
    endDate.setSeconds(0);

    return { startDate, endDate };
  }
}

const tutorialService = new TutorialService();
export default tutorialService;
