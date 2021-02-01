import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { assertExercise, assertExerciseDTOs } from '../../../test/helpers/test.assertExercises';
import { generateObjectId } from '../../../test/helpers/test.helpers';
import { TestModule } from '../../../test/helpers/test.module';
import { MockedSheetModel, SHEET_DOCUMENTS } from '../../../test/mocks/documents.mock';
import { ISheet } from '../../shared/model/Sheet';
import { SheetDTO } from './sheet.dto';
import { SheetService } from './sheet.service';

interface AssertSheetParams {
    expected: MockedSheetModel;
    actual: ISheet;
}

interface AssertSheetListParams {
    expected: MockedSheetModel[];
    actual: ISheet[];
}

interface AssertSheetDTOParams {
    expected: SheetDTO;
    actual: ISheet;
}

/**
 * Checks if the actual Sheet matches the expected one.
 *
 * Equality is defined as:
 * - `actual.id` is equal to `expected._id`.
 * - The exercise arrays match as defined by {@link assertExercise}
 * - All other properties match.
 *
 * @param params Must contain an actual and an expected Sheet.
 */
function assertSheet({ expected, actual }: AssertSheetParams) {
    const { _id, exercises, totalPoints, sheetNoAsString, ...restExpected } = expected;
    const { exercises: actualExercises, id, ...restActual } = actual;

    expect(id).toEqual(_id);
    expect(restActual).toEqual(restExpected);

    expect(totalPoints.total).toEqual(exercises.reduce((sum, ex) => sum + ex.maxPoints, 0));
    expect(sheetNoAsString).toEqual(restActual.sheetNo.toString(10).padStart(2, '0'));

    expect(actualExercises.length).toEqual(exercises.length);

    for (let i = 0; i < actualExercises.length; i++) {
        assertExercise({ expected: exercises[i], actual: actualExercises[i] });
    }
}

/**
 * Checks if the actual list of sheets matches the expected one.
 *
 * Equality is defined as:
 * - All elements in the arrays must be equal as defined by {@link assertSheet}.
 *
 * @param params Must contain a list of actual Sheets and expected SheetDocuments.
 */
function assertSheetList({ expected, actual }: AssertSheetListParams) {
    expect(actual.length).toEqual(expected.length);

    for (let i = 0; i < actual.length; i++) {
        assertSheet({ expected: expected[i], actual: actual[i] });
    }
}

/**
 * Checks if the actual sheet matches the expected DTO.
 *
 * Equality is defined by:
 * - `actual.id` is defined.
 * - `actual.exercises` match `expected.exercise`.
 * - All other properties are equal.
 *
 * @param params Must contain an actual Sheet and the expected SheetDTO.
 */
function assertSheetDTO({ expected, actual }: AssertSheetDTOParams) {
    const { exercises, ...restExpected } = expected;
    const { id, exercises: actualExercises, ...restActual } = actual;

    expect(id).toBeDefined();
    expect(restActual).toEqual(restExpected);

    assertExerciseDTOs({ expected: exercises, actual: actualExercises });
}

describe('SheetService', () => {
    let testModule: TestingModule;
    let service: SheetService;

    beforeAll(async () => {
        testModule = await Test.createTestingModule({
            imports: [TestModule.forRootAsync()],
            providers: [SheetService],
        }).compile();
    });

    afterAll(async () => {
        await testModule.close();
    });

    beforeEach(async () => {
        await testModule.get<TestModule>(TestModule).reset();

        service = testModule.get<SheetService>(SheetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('find all sheets', async () => {
        const sheets = await service.findAll();

        assertSheetList({
            expected: SHEET_DOCUMENTS,
            actual: sheets.map((sheet) => sheet.toDTO()),
        });
    });

    it('find sheet by ID', async () => {
        const expected = SHEET_DOCUMENTS[0];
        const sheet = await service.findById(expected._id);

        assertSheet({ expected, actual: sheet.toDTO() });
    });

    it('fail on finding a non-existing sheet', async () => {
        const nonExisting = generateObjectId();

        await expect(service.findById(nonExisting)).rejects.toThrow(NotFoundException);
    });

    it('create a new sheet', async () => {
        const dto = getDTO();
        const created = await service.create(dto);

        assertSheetDTO({ expected: dto, actual: created });
    });

    it('update basic information of a sheet', async () => {
        const updateDTO = getDTO();
        const createDTO: SheetDTO = {
            ...updateDTO,
            sheetNo: 2,
            bonusSheet: true,
        };

        const oldSheet = await service.create(createDTO);
        const updated = await service.update(oldSheet.id, updateDTO);

        assertSheetDTO({ expected: updateDTO, actual: updated });
    });

    it('update exercises of a sheet', async () => {
        const updateDTO = getDTO();
        const createDTO: SheetDTO = {
            ...updateDTO,
            exercises: [
                {
                    exName: '7',
                    maxPoints: 13.37,
                    bonus: false,
                },
            ],
        };

        const oldSheet = await service.create(createDTO);
        const updated = await service.update(oldSheet.id, updateDTO);

        assertSheetDTO({ expected: updateDTO, actual: updated });
    });

    it('update subexercise of a sheet', async () => {
        const updateDTO: SheetDTO = {
            ...getDTO(),
            exercises: [
                {
                    exName: '7',
                    maxPoints: 13.37,
                    bonus: false,
                    subexercises: [
                        {
                            id: '5e559160ed91238f8762e8aa',
                            exName: '(b)',
                            bonus: false,
                            maxPoints: 15,
                        },
                    ],
                },
            ],
        };
        const createDTO: SheetDTO = {
            ...updateDTO,
            exercises: [
                {
                    exName: '7',
                    maxPoints: 13.37,
                    bonus: false,
                    subexercises: [
                        {
                            id: '5e559160ed91238f8762e8aa',
                            exName: '(a)',
                            bonus: false,
                            maxPoints: 10,
                        },
                    ],
                },
            ],
        };

        const oldSheet = await service.create(createDTO);
        const updated = await service.update(oldSheet.id, updateDTO);

        assertSheetDTO({ expected: updateDTO, actual: updated });
    });

    it('fail on updating a non-existing sheet', async () => {
        const nonExisting = generateObjectId();
        const dto = getDTO();

        await expect(service.update(nonExisting, dto)).rejects.toThrow(NotFoundException);
    });

    it('delete a sheet', async () => {
        const dto = getDTO();

        const sheet = await service.create(dto);
        const deletedSheet = await service.delete(sheet.id);

        expect(deletedSheet.id).toEqual(sheet.id);
        await expect(service.findById(sheet.id)).rejects.toThrow(NotFoundException);
    });

    it('fail on deleting a non-existing sheet', async () => {
        const nonExisting = generateObjectId();

        await expect(service.delete(nonExisting)).rejects.toThrow(NotFoundException);
    });
});

/**
 * Helper functions just returning a SheetDTO so the test functions don't get blown up.
 *
 * @returns SheetDTO to use.
 */
function getDTO(): SheetDTO {
    return {
        sheetNo: 17,
        bonusSheet: false,
        exercises: [
            {
                exName: '1',
                maxPoints: 0,
                bonus: false,
                subexercises: [
                    {
                        exName: 'a',
                        maxPoints: 13.37,
                        bonus: false,
                    },
                    {
                        exName: 'b',
                        maxPoints: 42,
                        bonus: false,
                    },
                ],
            },
            {
                exName: '2',
                maxPoints: 13.37,
                bonus: false,
            },
            {
                exName: '4',
                maxPoints: 42,
                bonus: true,
            },
        ],
    };
}
