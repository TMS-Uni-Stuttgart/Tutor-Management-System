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
function getUsers() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get('user')];
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
exports.getUsers = getUsers;
function getUsersWithRole(role) {
    return __awaiter(this, void 0, void 0, function () {
        var allUsers;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUsers()];
                case 1:
                    allUsers = _a.sent();
                    return [2 /*return*/, allUsers.filter(function (u) { return u.roles.indexOf(role) !== -1; })];
            }
        });
    });
}
exports.getUsersWithRole = getUsersWithRole;
function getUsersAndFetchTutorials() {
    return __awaiter(this, void 0, void 0, function () {
        var users, promises, _loop_1, _i, users_1, user;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getUsers()];
                case 1:
                    users = _a.sent();
                    promises = [];
                    _loop_1 = function (user) {
                        promises.push(getTutorialsOfUser(user.id).then(function (tutorials) { return (__assign({}, user, { tutorials: tutorials })); }));
                    };
                    for (_i = 0, users_1 = users; _i < users_1.length; _i++) {
                        user = users_1[_i];
                        _loop_1(user);
                    }
                    return [2 /*return*/, Promise.all(promises)];
            }
        });
    });
}
exports.getUsersAndFetchTutorials = getUsersAndFetchTutorials;
function createUser(userInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.post('user', userInformation)];
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
exports.createUser = createUser;
function createUserAndFetchTutorials(userInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var user, tutorials;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, createUser(userInformation)];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, getTutorialsOfUser(user.id)];
                case 2:
                    tutorials = _a.sent();
                    return [2 /*return*/, __assign({}, user, { tutorials: tutorials })];
            }
        });
    });
}
exports.createUserAndFetchTutorials = createUserAndFetchTutorials;
function editUser(userid, userInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.patch("user/" + userid, userInformation)];
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
exports.editUser = editUser;
function editUserAndFetchTutorials(userid, userInformation) {
    return __awaiter(this, void 0, void 0, function () {
        var user, tutorials;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, editUser(userid, userInformation)];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, getTutorialsOfUser(user.id)];
                case 2:
                    tutorials = _a.sent();
                    return [2 /*return*/, __assign({}, user, { tutorials: tutorials })];
            }
        });
    });
}
exports.editUserAndFetchTutorials = editUserAndFetchTutorials;
function getTutorialsOfUser(userid) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.get("user/" + userid + "/tutorial", {
                        transformResponse: axiosTransforms_1.transformMultipleTutorialResponse,
                    })];
                case 1:
                    response = _a.sent();
                    if (response.status === 200) {
                        return [2 /*return*/, response.data];
                    }
                    return [2 /*return*/, Promise.reject("Wrong response code (" + response.status + ")")];
            }
        });
    });
}
exports.getTutorialsOfUser = getTutorialsOfUser;
function deleteUser(userid) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.delete("user/" + userid)];
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
exports.deleteUser = deleteUser;
function setTemporaryPassword(userid, password) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Axios_1.default.post("user/" + userid + "/temporarypassword", password)];
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
exports.setTemporaryPassword = setTemporaryPassword;
