"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var axios = axios_1.default.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
    headers: {
        // This header prevents the spring backend to add a header which will make a popup appear if the credentials are wrong.
        'X-Requested-With': 'XMLHttpRequest',
    },
    // Configure to use auth every time bc node can not save cookies.
    auth: {
        username: 'admin',
        password: 'admin',
    },
});
exports.default = axios;
