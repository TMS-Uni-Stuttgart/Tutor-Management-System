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
var axiosTransforms_1 = require("../util/axiosTransforms");
var Axios_1 = __importDefault(require("./Axios"));
var Student_1 = require("./Student");
function getAllTutorials() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get('tutorial', {
                        transformResponse: axiosTransforms_1.transformMultipleTutorialResponse,
                    })];
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
exports.getAllTutorials = getAllTutorials;
function getAllTutorialsAndFetchTutor() {
    return __awaiter(this, void 0, void 0, function () {
        var tutorials, promises, _loop_1, _i, tutorials_1, tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllTutorials()];
                case 1:
                    tutorials = _a.sent();
                    promises = [];
                    _loop_1 = function (tutorial) {
                        promises.push(getTutorOfTutorial(tutorial.id).then(function (tutor) { return (__assign({}, tutorial, { tutor: tutor })); }));
                    };
                    for (_i = 0, tutorials_1 = tutorials; _i < tutorials_1.length; _i++) {
                        tutorial = tutorials_1[_i];
                        _loop_1(tutorial);
                    }
                    return [2 /*return*/, Promise.all(promises)];
            }
        });
    });
}
exports.getAllTutorialsAndFetchTutor = getAllTutorialsAndFetchTutor;
function getAllTutorialsAndFetchStudents() {
    return __awaiter(this, void 0, void 0, function () {
        var tutorials, promises, _loop_2, _i, tutorials_2, tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllTutorialsAndFetchTutor()];
                case 1:
                    tutorials = _a.sent();
                    promises = [];
                    _loop_2 = function (tutorial) {
                        promises.push(getStudentsOfTutorial(tutorial.id).then(function (students) { return (__assign({}, tutorial, { students: students })); }));
                    };
                    for (_i = 0, tutorials_2 = tutorials; _i < tutorials_2.length; _i++) {
                        tutorial = tutorials_2[_i];
                        _loop_2(tutorial);
                    }
                    return [2 /*return*/, Promise.all(promises)];
            }
        });
    });
}
exports.getAllTutorialsAndFetchStudents = getAllTutorialsAndFetchStudents;
function getAllTutorialsAndFetchCorrectors() {
    return __awaiter(this, void 0, void 0, function () {
        var tutorials, promises, _loop_3, _i, tutorials_3, tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAllTutorialsAndFetchTutor()];
                case 1:
                    tutorials = _a.sent();
                    promises = [];
                    _loop_3 = function (tutorial) {
                        promises.push(getCorrectorsOfTutorial(tutorial.id).then(function (correctors) { return (__assign({}, tutorial, { correctors: correctors })); }));
                    };
                    for (_i = 0, tutorials_3 = tutorials; _i < tutorials_3.length; _i++) {
                        tutorial = tutorials_3[_i];
                        _loop_3(tutorial);
                    }
                    return [2 /*return*/, Promise.all(promises)];
            }
        });
    });
}
exports.getAllTutorialsAndFetchCorrectors = getAllTutorialsAndFetchCorrectors;
function getTutorial(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("tutorial/" + id, {
                        transformResponse: axiosTransforms_1.transformTutorialResponse,
                    })];
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
exports.getTutorial = getTutorial;
function getTutorialAndFetchTutor(id) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTutorial(id)];
                case 1:
                    tutorial = _a.sent();
                    return [2 /*return*/, fetchTutorOfTutorial(tutorial)];
            }
        });
    });
}
exports.getTutorialAndFetchTutor = getTutorialAndFetchTutor;
function getTutorialAndFetchTutorAndStudents(id) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorial, students;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTutorialAndFetchTutor(id)];
                case 1:
                    tutorial = _a.sent();
                    return [4 /*yield*/, getStudentsOfTutorial(tutorial.id)];
                case 2:
                    students = _a.sent();
                    return [2 /*return*/, __assign({}, tutorial, { students: students })];
            }
        });
    });
}
exports.getTutorialAndFetchTutorAndStudents = getTutorialAndFetchTutorAndStudents;
function getTutorialAndFetchCorrectors(id) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTutorialAndFetchTutor(id)];
                case 1:
                    tutorial = _a.sent();
                    return [2 /*return*/, fetchCorrectorsOfTutorial(tutorial)];
            }
        });
    });
}
exports.getTutorialAndFetchCorrectors = getTutorialAndFetchCorrectors;
function createTutorial(tutorialInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.post('tutorial', tutorialInformation, {
                    // transformResponse: transformTutorialResponse,
                    })];
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
exports.createTutorial = createTutorial;
function createTutorialAndFetchTutor(tutorialInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createTutorial(tutorialInformation)];
                case 1:
                    tutorial = _a.sent();
                    return [2 /*return*/, fetchTutorOfTutorial(tutorial)];
            }
        });
    });
}
exports.createTutorialAndFetchTutor = createTutorialAndFetchTutor;
function createTutorialAndFetchCorrectors(tutorialInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createTutorialAndFetchTutor(tutorialInformation)];
                case 1:
                    tutorial = _a.sent();
                    return [2 /*return*/, fetchCorrectorsOfTutorial(tutorial)];
            }
        });
    });
}
exports.createTutorialAndFetchCorrectors = createTutorialAndFetchCorrectors;
function editTutorial(id, tutorialInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.patch("tutorial/" + id, tutorialInformation, {
                        transformResponse: axiosTransforms_1.transformTutorialResponse,
                    })];
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
exports.editTutorial = editTutorial;
function editTutorialAndFetchTutor(id, tutorialInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, editTutorial(id, tutorialInformation)];
                case 1:
                    tutorial = _a.sent();
                    return [2 /*return*/, fetchTutorOfTutorial(tutorial)];
            }
        });
    });
}
exports.editTutorialAndFetchTutor = editTutorialAndFetchTutor;
function editTutorialAndFetchCorrectors(id, tutorialInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var tutorial;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, editTutorialAndFetchTutor(id, tutorialInformation)];
                case 1:
                    tutorial = _a.sent();
                    return [2 /*return*/, fetchCorrectorsOfTutorial(tutorial)];
            }
        });
    });
}
exports.editTutorialAndFetchCorrectors = editTutorialAndFetchCorrectors;
function deleteTutorial(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.delete("tutorial/" + id)];
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
exports.deleteTutorial = deleteTutorial;
function getTutorOfTutorial(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("tutorial/" + id + "/user")];
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
exports.getTutorOfTutorial = getTutorOfTutorial;
function getStudentsOfTutorial(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("tutorial/" + id + "/student")];
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
exports.getStudentsOfTutorial = getStudentsOfTutorial;
function getStudentsOfTutorialAndFetchTeams(id) {
    return __awaiter(this, void 0, void 0, function () {
        var students;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getStudentsOfTutorial(id)];
                case 1:
                    students = _a.sent();
                    return [2 /*return*/, Student_1.fetchTeamsOfStudents(students)];
            }
        });
    });
}
exports.getStudentsOfTutorialAndFetchTeams = getStudentsOfTutorialAndFetchTeams;
function getScheinCriteriaSummariesOfAllStudentsOfTutorial(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("tutorial/" + id + "/student/scheincriteria")];
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
exports.getScheinCriteriaSummariesOfAllStudentsOfTutorial = getScheinCriteriaSummariesOfAllStudentsOfTutorial;
function getCorrectorsOfTutorial(id) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("tutorial/" + id + "/corrector")];
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
exports.getCorrectorsOfTutorial = getCorrectorsOfTutorial;
function setSubstituteTutor(id, substituteDTO) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.post("tutorial/" + id + "/substitute", substituteDTO, {
                        transformResponse: axiosTransforms_1.transformTutorialResponse,
                    })];
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
exports.setSubstituteTutor = setSubstituteTutor;
function fetchTutorOfTutorial(tutorial) {
    return __awaiter(this, void 0, void 0, function () {
        var tutor;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getTutorOfTutorial(tutorial.id)];
                case 1:
                    tutor = _a.sent();
                    return [2 /*return*/, __assign({}, tutorial, { tutor: tutor })];
            }
        });
    });
}
function fetchCorrectorsOfTutorial(tutorial) {
    return __awaiter(this, void 0, void 0, function () {
        var correctors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getCorrectorsOfTutorial(tutorial.id)];
                case 1:
                    correctors = _a.sent();
                    return [2 /*return*/, __assign({}, tutorial, { correctors: correctors })];
            }
        });
    });
}
