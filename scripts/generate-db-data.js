"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var faker_1 = __importDefault(require("faker"));
var Tutorial_1 = require("./fetching/Tutorial");
var ServerResponses_1 = require("./typings/ServerResponses");
var User_1 = require("./fetching/User");
var Student_1 = require("./fetching/Student");
var date_fns_1 = require("date-fns");
var Sheet_1 = require("./fetching/Sheet");
var ScheinExam_1 = require("./fetching/ScheinExam");
faker_1.default.locale = 'de';
var TUTORIAL_COUNT = 25;
var STUDENT_COUNT_PER_TUTORIAL = {
    min: 20,
    max: 24,
};
var SHEET_COUNT = 11;
var EXERCISE_COUNT_PER_SHEET = {
    min: 3,
    max: 7,
};
var SCHEIN_EXAM_COUNT = 2;
var EXERCISE_COUNT_PER_EXAM = {
    min: 5,
    max: 10,
};
var MATR_NO = [];
for (var i = 1000000; i <= 9999999; i++) {
    MATR_NO.push(i.toString().padStart(7, '0'));
}
function createTutorials(tutorialCount) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorials, i, startTime, endTime, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.group("Creating " + tutorialCount + " tutorials...");
                    tutorials = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < tutorialCount)) return [3 /*break*/, 4];
                    console.log("Creating tutorial with slot " + (i + 1) + "...");
                    startTime = new Date(Date.now());
                    endTime = date_fns_1.addMinutes(startTime, 90);
                    _b = (_a = tutorials).push;
                    return [4 /*yield*/, Tutorial_1.createTutorial({
                            slot: i + 1,
                            tutorId: null,
                            dates: [new Date(Date.now()).toISOString()],
                            startTime: date_fns_1.format(startTime, 'hh:mm:ss'),
                            endTime: date_fns_1.format(endTime, 'hh:mm:ss'),
                            correctorIds: [],
                        })];
                case 2:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('Finished creating tutorials.');
                    console.groupEnd();
                    return [2 /*return*/, tutorials];
            }
        });
    });
}
function addTutorToTutorial(tutorial) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("Adding user to tutorial #" + tutorial.slot.toString().padStart(2, '0'));
            return [2 /*return*/, User_1.createUser({
                    firstname: "first-" + tutorial.slot,
                    lastname: "last-" + tutorial.slot,
                    password: 'generatedUser',
                    username: "user" + tutorial.slot.toString().padStart(2, '0'),
                    roles: [ServerResponses_1.Role.TUTOR],
                    tutorials: [tutorial.id],
                })];
        });
    });
}
function addStudentsToTutorial(tutorial) {
    return __awaiter(this, void 0, void 0, function () {
        var min, max, count, promises, i, idx, matriculationNo;
        return __generator(this, function (_a) {
            min = STUDENT_COUNT_PER_TUTORIAL.min, max = STUDENT_COUNT_PER_TUTORIAL.max;
            count = Math.floor(randomNumberBetween(min, max));
            console.group("Creating " + count + " students for tutorial #" + tutorial.slot.toString().padStart(2, '0'));
            promises = [];
            for (i = 0; i < count; i++) {
                idx = Math.random() * MATR_NO.length;
                matriculationNo = MATR_NO.splice(idx, 1)[0];
                console.log("Queing student number " + i
                    .toString()
                    .padStart(2, '0') + " with matriculation number " + matriculationNo + ".");
                promises.push(Student_1.createStudent({
                    firstname: "student-" + i + "-" + tutorial.slot,
                    lastname: "student-" + i + "-" + tutorial.slot,
                    courseOfStudies: 'Informatik',
                    email: 'some@mail.sth',
                    matriculationNo: matriculationNo,
                    team: null,
                    tutorial: tutorial.id,
                }));
            }
            console.groupEnd();
            return [2 /*return*/, Promise.all(promises)];
        });
    });
}
function createSheets(sheetCount) {
    return __awaiter(this, void 0, void 0, function () {
        var min, max, promises, sheetNo, exercises, exCount, exNo;
        return __generator(this, function (_a) {
            console.group("Creating " + sheetCount + " sheets...");
            min = EXERCISE_COUNT_PER_SHEET.min, max = EXERCISE_COUNT_PER_SHEET.max;
            promises = [];
            for (sheetNo = 0; sheetNo < sheetCount; sheetNo++) {
                exercises = [];
                exCount = Math.floor(randomNumberBetween(min, max));
                for (exNo = 1; exNo <= exCount; exNo++) {
                    exercises.push({
                        exNo: exNo,
                        maxPoints: Math.floor(randomNumberBetween(4, 20)),
                        bonus: Math.random() < 0.1,
                    });
                }
                console.log("Queing sheet #" + sheetNo.toString().padStart(2, '0') + " with " + exCount + " exercises.");
                promises.push(Sheet_1.createSheet({
                    sheetNo: sheetNo,
                    exercises: exercises,
                    bonusSheet: Math.random() < 0.05,
                }));
            }
            console.groupEnd();
            return [2 /*return*/, Promise.all(promises)];
        });
    });
}
function createScheinExams(examCount) {
    return __awaiter(this, void 0, void 0, function () {
        var min, max, promises, scheinExamNo, exercises, exCount, exNo;
        return __generator(this, function (_a) {
            console.group("Creating " + examCount + " schein exams...");
            min = EXERCISE_COUNT_PER_EXAM.min, max = EXERCISE_COUNT_PER_EXAM.max;
            promises = [];
            for (scheinExamNo = 1; scheinExamNo <= examCount; scheinExamNo++) {
                exercises = [];
                exCount = Math.floor(randomNumberBetween(min, max));
                for (exNo = 1; exNo <= exCount; exNo++) {
                    exercises.push({
                        exNo: exNo,
                        maxPoints: Math.floor(randomNumberBetween(4, 40)),
                        bonus: false,
                    });
                }
                console.log("Queing schein exam #" + scheinExamNo.toString().padStart(2, '0') + " with " + exCount + " exercises.");
                promises.push(ScheinExam_1.createScheinExam({
                    scheinExamNo: scheinExamNo,
                    exercises: exercises,
                    date: new Date(Date.now()).toISOString(),
                    percentageNeeded: 0.5,
                }));
            }
            return [2 /*return*/, Promise.all(promises)];
        });
    });
}
function initDB() {
    return __awaiter(this, void 0, void 0, function () {
        var tutorials, studentPromises, _i, tutorials_1, tutorial, students, sheets, scheinExams;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createTutorials(TUTORIAL_COUNT)];
                case 1:
                    tutorials = _a.sent();
                    studentPromises = [];
                    for (_i = 0, tutorials_1 = tutorials; _i < tutorials_1.length; _i++) {
                        tutorial = tutorials_1[_i];
                        addTutorToTutorial(tutorial);
                        studentPromises.push(addStudentsToTutorial(tutorial));
                    }
                    console.log('Waiting on all student requests to finish...');
                    return [4 /*yield*/, Promise.all(studentPromises)];
                case 2:
                    students = (_a.sent()).flat();
                    return [4 /*yield*/, createSheets(SHEET_COUNT)];
                case 3:
                    sheets = _a.sent();
                    return [4 /*yield*/, createScheinExams(SCHEIN_EXAM_COUNT)];
                case 4:
                    scheinExams = _a.sent();
                    console.group("DB initialization finished with:");
                    console.log(tutorials.length + " tutorials");
                    console.log(students.length + " students");
                    console.log(sheets.length + " sheets");
                    console.log(scheinExams.length + " schein exams\u0152");
                    console.groupEnd();
                    return [2 /*return*/];
            }
        });
    });
}
initDB().catch(function (e) {
    console.error('Something on initializing the DB went wrong.');
    console.log(e);
});
function randomNumberBetween(min, max) {
    return Math.random() * (max - min) + min;
}
