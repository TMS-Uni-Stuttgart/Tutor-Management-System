import { Injectable } from '@nestjs/common';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectModel } from 'nestjs-typegoose';
import { ShortTestDocument, ShortTestModel } from '../../database/models/shortTest.model';
import { CRUDService } from '../../helpers/CRUDService';
import { IShortTest } from '../../shared/model/ShortTest';
import { ShortTestDTO } from '../scheinexam/scheinexam.dto';

@Injectable()
export class ShortTestService implements CRUDService<IShortTest, ShortTestDTO, ShortTestDocument> {
  constructor(
    @InjectModel(ShortTestModel)
    private readonly shortTestModel: ReturnModelType<typeof ShortTestModel>
  ) {}

  async findAll(): Promise<ShortTestDocument[]> {
    return await this.shortTestModel.find().exec();
  }

  async findById(id: string): Promise<ShortTestDocument> {
    throw new Error('Method not implemented.');
  }

  async create(dto: ShortTestDTO): Promise<IShortTest> {
    throw new Error('Method not implemented.');
  }

  async update(id: string, dto: ShortTestDTO): Promise<IShortTest> {
    throw new Error('Method not implemented.');
  }

  async delete(id: string): Promise<ShortTestDocument> {
    throw new Error('Method not implemented.');
  }
}
