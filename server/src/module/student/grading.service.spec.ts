import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from '../../../test/helpers/test.module';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { TeamService } from '../team/team.service';
import { TutorialService } from '../tutorial/tutorial.service';
import { UserService } from '../user/user.service';
import { GradingService } from './grading.service';
import { StudentService } from './student.service';

describe('GradingService', () => {
  let service: GradingService;
  let testModule: TestingModule | undefined;

  beforeEach(async () => {
    testModule = await Test.createTestingModule({
      imports: [TestModule.forRootAsync()],
      providers: [
        GradingService,
        StudentService,
        SheetService,
        ShortTestService,
        ScheinexamService,
        TutorialService,
        TeamService,
        UserService,
      ],
    }).compile();

    service = testModule.get<GradingService>(GradingService);
  });

  afterAll(async () => {
    await testModule?.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
