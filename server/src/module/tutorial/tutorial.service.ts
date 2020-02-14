import { Injectable, NotImplementedException } from '@nestjs/common';
import { TutorialDocument } from '../models/tutorial.model';

@Injectable()
export class TutorialService {
  async findById(id: string): Promise<TutorialDocument> {
    throw new NotImplementedException();
  }
}
