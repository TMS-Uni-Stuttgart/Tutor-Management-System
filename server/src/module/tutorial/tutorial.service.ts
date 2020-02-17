import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
  BadRequestException,
} from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { Tutorial, TutorialDTO } from '../../shared/model/Tutorial';
import { TutorialDocument, TutorialModel } from '../models/tutorial.model';
import { UserService } from '../user/user.service';
import { Role } from '../../shared/model/Role';
import { UserDocument } from '../models/user.model';
import { ServiceInterface } from '../../helpers/ServiceInterface';

@Injectable()
export class TutorialService implements ServiceInterface<Tutorial, TutorialDTO, TutorialDocument> {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectModel(TutorialModel)
    private readonly tutorialModel: ReturnModelType<typeof TutorialModel>
  ) {}

  /**
   * @returns All tutorials saved in the database.
   */
  async findAll(): Promise<Tutorial[]> {
    const tutorials: TutorialDocument[] = await this.tutorialModel.find().exec();

    // TODO: Add proper teams!
    return tutorials.map(tutorial => tutorial.toDTO([]));
  }

  async findById(id: string): Promise<TutorialDocument> {
    throw new NotImplementedException();
  }

  /**
   * Creates a new tutorial based on the given information.
   *
   * @param dto Information about the tutorial to create.
   *
   * @throws `NotFoundException` - If the tutor or any of the correctors could not be found.
   * @throws `BadRequestExpcetion` - If the tutor to be assigned does not have the TUTOR role or if any of the correctors to be assigned does not have the CORRECTOR role.
   *
   * @returns Created tutorial.
   */
  async create(dto: TutorialDTO): Promise<Tutorial> {
    const { slot, tutorId, correctorIds, startTime, endTime, dates } = dto;
    // TODO: Add check if there is a tutorial with the same slot!

    const [tutor, correctors] = await Promise.all([
      tutorId ? this.userService.findById(tutorId) : undefined,
      Promise.all(correctorIds.map(id => this.userService.findById(id))),
    ]);

    this.assertTutorHasTutorRole(tutor);
    this.assertCorrectorsHaveCorrectorRole(correctors);

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const tutorial = new TutorialModel({
      slot,
      tutor,
      startTime: startDate,
      endTime: endDate,
      students: [],
      dates: dates.map(date => new Date(date)),
      correctors,
      substitutes: new Map(),
    });

    const created = await this.tutorialModel.create(tutorial);

    return created.toDTO([]);
  }

  private assertTutorHasTutorRole(tutor?: UserDocument) {
    if (tutor && !tutor.roles.includes(Role.TUTOR)) {
      throw new BadRequestException('The tutor of a tutorial needs to have the TUTOR role.');
    }
  }

  private assertCorrectorsHaveCorrectorRole(correctors: UserDocument[]) {
    for (const doc of correctors) {
      if (!doc.roles.includes(Role.CORRECTOR)) {
        throw new BadRequestException(
          'The corrector of a tutorial needs to have the CORRECTOR role.'
        );
      }
    }
  }
}
