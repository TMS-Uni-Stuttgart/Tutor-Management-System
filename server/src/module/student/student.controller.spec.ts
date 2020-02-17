import { Test, TestingModule } from '@nestjs/testing';
import { StudentController } from './student.controller';
import { StudentService } from './student.service';
import { MockedStudentService } from '../../../test/mocks/student.service.mock';

describe('Student Controller', () => {
  let controller: StudentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: StudentService, useClass: MockedStudentService }],
      controllers: [StudentController],
    }).compile();

    controller = module.get<StudentController>(StudentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
