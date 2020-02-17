import { Test, TestingModule } from '@nestjs/testing';
import { MongooseMockModelProvider } from '../../../test/helpers/test.provider';
import { MockedModel } from '../../../test/helpers/testdocument';
import { MockedTutorialService } from '../../../test/mocks/tutorial.service.mock';
import { StudentModel } from '../models/student.model';
import { TutorialService } from '../tutorial/tutorial.service';
import { StudentService } from './student.service';

const STUDENT_DOCUMENTS: MockedModel<StudentModel>[] = [];

describe('StudentService', () => {
  let service: StudentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentService,
        { provide: TutorialService, useClass: MockedTutorialService },
        MongooseMockModelProvider.create({
          modelClass: StudentModel,
          documents: STUDENT_DOCUMENTS,
        }),
      ],
    }).compile();

    service = module.get<StudentService>(StudentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
