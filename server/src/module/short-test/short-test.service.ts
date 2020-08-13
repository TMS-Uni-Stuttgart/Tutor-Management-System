import { Injectable } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ShortTestModel } from '../../database/models/shortTest.model';
import { CRUD, CRUDModelType } from '../../helpers/CRUDService';
import { IShortTest } from '../../shared/model/ShortTest';
import { ShortTestDTO } from '../scheinexam/scheinexam.dto';

@Injectable()
export class ShortTestService extends CRUD<ShortTestDTO, IShortTest, ShortTestModel> {
  constructor(
    @InjectModel(ShortTestModel)
    shortTestModel: CRUDModelType<ShortTestDTO, IShortTest, ShortTestModel>
  ) {
    super(shortTestModel);
  }
}
