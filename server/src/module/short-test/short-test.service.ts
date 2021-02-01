import { Injectable, NotFoundException } from '@nestjs/common';
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
        const shortTest = await this.shortTestModel.findById(id).exec();

        if (!shortTest) {
            throw new NotFoundException(
                `Short test document with the ID "${id}" could not be found.`
            );
        }

        return shortTest;
    }

    async create(dto: ShortTestDTO): Promise<IShortTest> {
        const shortTest = ShortTestModel.fromDTO(dto);
        const created = await this.shortTestModel.create(shortTest);

        return created.toDTO();
    }

    async update(id: string, dto: ShortTestDTO): Promise<IShortTest> {
        const shortTest = await this.findById(id);
        const updated = await shortTest.updateFromDTO(dto).save();

        return updated.toDTO();
    }

    async delete(id: string): Promise<ShortTestDocument> {
        const shortTest = await this.findById(id);

        return shortTest.remove();
    }
}
