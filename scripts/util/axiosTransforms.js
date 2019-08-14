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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var date_fns_1 = require("date-fns");
function transformLoggedInUserResponse(responseJSON) {
    // FIXME: Crashed if responseJSON is empty.
    var _a = JSON.parse(responseJSON), substituteTutorials = _a.substituteTutorials, rest = __rest(_a, ["substituteTutorials"]);
    var parsedSubstituteTutorials = [];
    substituteTutorials.forEach(function (tutorial) {
        var dates = tutorial.dates, other = __rest(tutorial, ["dates"]);
        var parsedDates = dates.map(function (d) { return new Date(d); });
        parsedSubstituteTutorials.push(__assign({}, other, { dates: parsedDates }));
    });
    return __assign({}, rest, { substituteTutorials: parsedSubstituteTutorials });
}
exports.transformLoggedInUserResponse = transformLoggedInUserResponse;
function transformMultipleTutorialResponse(responseJSON) {
    if (!responseJSON) {
        return [];
    }
    var response = JSON.parse(responseJSON);
    var tutorials = [];
    response.forEach(function (res) {
        tutorials.push(transformTutorialResponse(JSON.stringify(res)));
    });
    return tutorials;
}
exports.transformMultipleTutorialResponse = transformMultipleTutorialResponse;
function transformTutorialResponse(responseJSON) {
    // FIXME: Crashed if responseJSON is empty.
    var _a = JSON.parse(responseJSON), dateStrings = _a.dates, startTimeString = _a.startTime, endTimeString = _a.endTime, rest = __rest(_a, ["dates", "startTime", "endTime"]);
    var dates = [];
    var startTime = date_fns_1.parse(startTimeString, 'HH:mm:ss', new Date());
    var endTime = date_fns_1.parse(endTimeString, 'HH:mm:ss', new Date());
    dateStrings.forEach(function (date) { return dates.push(new Date(date)); });
    return __assign({}, rest, { dates: dates,
        startTime: startTime,
        endTime: endTime });
}
exports.transformTutorialResponse = transformTutorialResponse;
function transformMultipleScheinExamResponse(responseJSON) {
    if (!responseJSON) {
        return [];
    }
    var response = JSON.parse(responseJSON);
    var exams = [];
    response.forEach(function (res) { return exams.push(transformScheinExamResponse(JSON.stringify(res))); });
    return exams;
}
exports.transformMultipleScheinExamResponse = transformMultipleScheinExamResponse;
function transformScheinExamResponse(responseJSON) {
    // FIXME: Crashed if responseJSON is empty.
    var _a = JSON.parse(responseJSON), date = _a.date, rest = __rest(_a, ["date"]);
    return __assign({}, rest, { date: new Date(date) });
}
exports.transformScheinExamResponse = transformScheinExamResponse;
