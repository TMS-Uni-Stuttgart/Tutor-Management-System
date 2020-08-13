import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ShortTestModel } from '../../database/models/shortTest.model';
import { CRUDModelType, CRUDService } from '../../helpers/CRUDService';
import { IShortTest } from '../../shared/model/ShortTest';
import { ShortTestDTO } from '../scheinexam/scheinexam.dto';

@Injectable()
export class ShortTestService extends CRUDService<ShortTestDTO, IShortTest, ShortTestModel> {
  constructor(
    @InjectModel(ShortTestModel)
    shortTestModel: CRUDModelType<ShortTestDTO, IShortTest, ShortTestModel>
  ) {
    super(shortTestModel);
  }
}
