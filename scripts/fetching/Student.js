"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var Axios_1 = __importDefault(require("./Axios"));
var Tutorial_1 = require("./Tutorial");
function getAllStudents() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get('student')];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong response code (" + response.status + ").")];
            }
        });
    });
}
function getStudent(studentId) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("student/" + studentId)];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong response code (" + response.status + ").")];
            }
        });
    });
}
exports.getStudent = getStudent;
function getAllStudentsAndFetchTeams() {
    return __awaiter(this, void 0, void 0, function () {
        var students;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllStudents()];
                case 1:
                    students = _a.sent();
                    return [2 /*return*/, fetchTeamsOfStudents(students)];
            }
        });
    });
}
exports.getAllStudentsAndFetchTeams = getAllStudentsAndFetchTeams;
function createStudent(studentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.post('student', studentInfo)];
                case 1:
                    response = _a.sent();
                    if (response.status === 201) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong response code (" + response.status + ").")];
            }
        });
    });
}
exports.createStudent = createStudent;
function createStudentAndFetchTeam(studentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var student;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createStudent(studentInfo)];
                case 1:
                    student = _a.sent();
                    return [2 /*return*/, fetchTeamOfStudent(student)];
            }
        });
    });
}
exports.createStudentAndFetchTeam = createStudentAndFetchTeam;
function editStudent(id, studentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.patch("student/" + id, studentInfo)];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong response code (" + response.status + ").")];
            }
        });
    });
}
exports.editStudent = editStudent;
function editStudentAndFetchTeam(id, studentInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var student;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, editStudent(id, studentInfo)];
                case 1:
                    student = _a.sent();
                    return [2 /*return*/, fetchTeamOfStudent(student)];
            }
        });
    });
}
exports.editStudentAndFetchTeam = editStudentAndFetchTeam;
function deleteStudent(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.delete("student/" + id)];
                case 1:
                    response = _a.sent();
                    if (response.status !== 204) {
                        return [2 /*return*/, Promise.reject("Wrong response code (" + response.status + ").")];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.deleteStudent = deleteStudent;
function setAttendanceOfStudent(id, attendanceInfo) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.put("student/" + id + "/attendance", attendanceInfo)];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong status code (" + response.status + ").")];
            }
        });
    });
}
exports.setAttendanceOfStudent = setAttendanceOfStudent;
function setPointsOfStudent(studentId, points) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.put("student/" + studentId + "/points", points)];
                case 1:
                    response = _a.sent();
                    if (response.status !== 204) {
                        return [2 /*return*/, Promise.reject("Wrong status code (" + response.status + ").")];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.setPointsOfStudent = setPointsOfStudent;
function setPresentationPointsOfStudent(studentId, points) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.put("student/" + studentId + "/presentation", points)];
                case 1:
                    response = _a.sent();
                    if (response.status !== 204) {
                        return [2 /*return*/, Promise.reject("Wrong status code (" + response.status + ").")];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.setPresentationPointsOfStudent = setPresentationPointsOfStudent;
function setExamPointsOfStudent(studentId, points) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.put("student/" + studentId + "/examresult", points)];
                case 1:
                    response = _a.sent();
                    if (response.status !== 204) {
                        return [2 /*return*/, Promise.reject("Wrong response code (" + response.status + ").")];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
exports.setExamPointsOfStudent = setExamPointsOfStudent;
function getTeamOfStudent(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("student/" + id + "/team")];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong status code (" + response.status + ").")];
            }
        });
    });
}
exports.getTeamOfStudent = getTeamOfStudent;
function fetchTeamOfStudent(student) {
    return __awaiter(this, void 0, void 0, function () {
        var team;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTeamOfStudent(student.id)];
                case 1:
                    team = _a.sent();
                    return [2 /*return*/, __assign({}, student, { team: team })];
            }
        });
    });
}
exports.fetchTeamOfStudent = fetchTeamOfStudent;
function fetchTeamsOfStudents(students) {
    return __awaiter(this, void 0, void 0, function () {
        var promises, _loop_1, _i, students_1, student;
        return __generator(this, function (_a) {
            promises = [];
            _loop_1 = function (student) {
                promises.push(getTeamOfStudent(student.id).then(function (team) { return (__assign({}, student, { team: team })); }));
            };
            for (_i = 0, students_1 = students; _i < students_1.length; _i++) {
                student = students_1[_i];
                _loop_1(student);
            }
            return [2 /*return*/, Promise.all(promises)];
        });
    });
}
exports.fetchTeamsOfStudents = fetchTeamsOfStudents;
function getScheinCriteriaResultOfStudent(studentId) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("/student/" + studentId + "/scheincriteria")];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong status code (" + response.status + ").")];
            }
        });
    });
}
exports.getScheinCriteriaResultOfStudent = getScheinCriteriaResultOfStudent;
function getScheinCriteriaResultsOfAllStudents() {
    return __awaiter(this, void 0, void 0, function () {
        var students, criteriaResponses, allResults, criterias;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllStudents()];
                case 1:
                    students = _a.sent();
                    criteriaResponses = [];
                    students.forEach(function (student) {
                        criteriaResponses.push(new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var id, result;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        id = student.id;
                                        return [4 /*yield*/, getScheinCriteriaResultOfStudent(id)];
                                    case 1:
                                        result = _a.sent();
                                        resolve([id, result]);
                                        return [2 /*return*/];
                                }
                            });
                        }); }));
                    });
                    return [4 /*yield*/, Promise.all(criteriaResponses)];
                case 2:
                    allResults = _a.sent();
                    criterias = {};
                    allResults.forEach(function (_a) {
                        var studentId = _a[0], summary = _a[1];
                        return (criterias[studentId] = summary);
                    });
                    return [2 /*return*/, criterias];
            }
        });
    });
}
exports.getScheinCriteriaResultsOfAllStudents = getScheinCriteriaResultsOfAllStudents;
function getScheinCriteriaResultsOfAllStudentsWithTutorialSlots() {
    return __awaiter(this, void 0, void 0, function () {
        var students, tutorials, allResults, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllStudents()];
                case 1:
                    students = _a.sent();
                    return [4 /*yield*/, Tutorial_1.getAllTutorials()];
                case 2:
                    tutorials = _a.sent();
                    return [4 /*yield*/, getScheinCriteriaResultsOfAllStudents()];
                case 3:
                    allResults = _a.sent();
                    result = {};
                    Object.entries(allResults).forEach(function (_a) {
                        var studentId = _a[0], summary = _a[1];
                        var student = students.find(function (s) { return s.id === studentId; });
                        if (!student) {
                            return;
                        }
                        var tutorial = tutorials.find(function (t) { return t.id === student.tutorial; });
                        if (!tutorial) {
                            return;
                        }
                        var prevSummaries = result[tutorial.slot.toString()] || [];
                        result[tutorial.slot.toString()] = prevSummaries.concat([summary]);
                    });
                    return [2 /*return*/, result];
            }
        });
    });
}
exports.getScheinCriteriaResultsOfAllStudentsWithTutorialSlots = getScheinCriteriaResultsOfAllStudentsWithTutorialSlots;
