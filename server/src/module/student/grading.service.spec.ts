import { Test, TestingModule } from '@nestjs/testing';
import { ScheinexamService } from '../scheinexam/scheinexam.service';
import { SheetService } from '../sheet/sheet.service';
import { ShortTestService } from '../short-test/short-test.service';
import { GradingService } from './grading.service';
import { StudentService } from './student.service';

describe('GradingService', () => {
  let service: GradingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradingService,
        StudentService,
        SheetService,
        ShortTestService,
        ScheinexamService,
      ],
    }).compile();

    service = module.get<GradingService>(GradingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
