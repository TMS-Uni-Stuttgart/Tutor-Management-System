"use strict";
/* tslint:disable */
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
var AttendanceState;
(function (AttendanceState) {
    AttendanceState["PRESENT"] = "PRESENT";
    AttendanceState["EXCUSED"] = "EXCUSED";
    AttendanceState["UNEXCUSED"] = "UNEXCUSED";
})(AttendanceState = exports.AttendanceState || (exports.AttendanceState = {}));
var PassedState;
(function (PassedState) {
    PassedState["PASSED"] = "PASSED";
    PassedState["NOTPASSED"] = "NOTPASSED";
    PassedState["IGNORE"] = "IGNORE";
})(PassedState = exports.PassedState || (exports.PassedState = {}));
var Role;
(function (Role) {
    Role["ADMIN"] = "ADMIN";
    Role["CORRECTOR"] = "CORRECTOR";
    Role["EMPLOYEE"] = "EMPLOYEE";
    Role["TUTOR"] = "TUTOR";
})(Role = exports.Role || (exports.Role = {}));
var ScheinCriteriaUnit;
(function (ScheinCriteriaUnit) {
    ScheinCriteriaUnit["SHEET"] = "SHEET";
    ScheinCriteriaUnit["POINT"] = "POINT";
    ScheinCriteriaUnit["EXAM"] = "EXAM";
    ScheinCriteriaUnit["PRESENTATION"] = "PRESENTATION";
    ScheinCriteriaUnit["DATE"] = "DATE";
})(ScheinCriteriaUnit = exports.ScheinCriteriaUnit || (exports.ScheinCriteriaUnit = {}));
