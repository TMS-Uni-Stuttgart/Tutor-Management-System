import { forwardRef, Inject, Injectable, NotImplementedException } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { Tutorial, TutorialDTO } from '../../shared/model/Tutorial';
import { TutorialDocument, TutorialModel } from '../models/tutorial.model';
import { UserService } from '../user/user.service';

@Injectable()
export class TutorialService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    @InjectModel(TutorialModel)
    private readonly tutorialModel: ReturnModelType<typeof TutorialModel>
  ) {}

  /**
   * Returns all tutorials saved in the database.
   */
  async findAll(): Promise<Tutorial[]> {
    const tutorials: TutorialDocument[] = await this.tutorialModel.find().exec();

    // TODO: Add proper teams!
    return tutorials.map(tutorial => tutorial.toDTO([]));
  }

  /**
   * Creates a new tutorial based on the given information.
   *
   * @param dto Information about the tutorial to create.
   *
   * @throws `NotFoundException` If the tutor or any of the correctors could not be found.
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

  async findById(id: string): Promise<TutorialDocument> {
    throw new NotImplementedException();
  }
}
