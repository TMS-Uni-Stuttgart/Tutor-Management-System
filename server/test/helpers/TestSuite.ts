import { Test, TestingModule } from '@nestjs/testing';
import { ClassType } from '../../src/helpers/ClassConstructor';
import { ScheinexamService } from '../../src/module/scheinexam/scheinexam.service';
import { SheetService } from '../../src/module/sheet/sheet.service';
import { ShortTestService } from '../../src/module/short-test/short-test.service';
import { GradingService } from '../../src/module/student/grading.service';
import { StudentService } from '../../src/module/student/student.service';
import { TeamService } from '../../src/module/team/team.service';
import { TutorialService } from '../../src/module/tutorial/tutorial.service';
import { UserService } from '../../src/module/user/user.service';
import { TestDatabaseModule } from './test.module';

/**
 * Test suite with helper methods for a specific service.
 *
 * @param S - Type of the service associated with this suite.
 */
export class TestSuite<S> {
    private testModule?: TestingModule;
    private _service?: S;

    /**
     * The service associated with this suite.
     *
     * **Important**: Only call this getter _inside_ any jest test function (like `it()`) because the service is only defined inside the test sequences.
     *
     * @throws `Error` - If the service is undefined.
     */
    get service(): S {
        if (!this._service) {
            throw new Error(`Service of type ${this.serviceClass.name} is not defined.`);
        }
        return this._service;
    }

    /**
     *
     * @param serviceClass Class of the service associated with this test suite.
     */
    constructor(private readonly serviceClass: ClassType<S>) {
        this.configTestSuite();
    }

    /**
     * Configures this test suite using the `serviceClass`.
     * @private
     */
    private configTestSuite(): void {
        beforeAll(async () => {
            this.testModule = await Test.createTestingModule({
                imports: [TestDatabaseModule],
                providers: [
                    TutorialService,
                    UserService,
                    StudentService,
                    TeamService,
                    SheetService,
                    ScheinexamService,
                    ShortTestService,
                    GradingService,
                ],
            }).compile();
        });

        afterAll(async () => {
            await this.testModule?.close();
        });

        beforeEach(async () => {
            await this.testModule?.get<TestDatabaseModule>(TestDatabaseModule).reset();
            this._service = this.testModule?.get<S>(this.serviceClass);
        });

        it('corresponding service should be defined', () => {
            expect(this._service).toBeDefined();
        });
    }
}
