"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authorizer1 = exports.AppSecret = exports.userSubject = exports.FromAdminMail = exports.GmailPass = exports.GmailUser = exports.fromAdminPhone = exports.authToken = exports.accountSid = exports.db = void 0;
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
//connection is declared here
exports.db = new sequelize_1.Sequelize('app', "", "", {
    storage: "./food.sqlite",
    dialect: 'sqlite',
    logging: false
});
exports.accountSid = process.env.ACCOUNTSID;
exports.authToken = process.env.AUTHTOKEN;
exports.fromAdminPhone = process.env.fromAdminPhone;
exports.GmailUser = process.env.GmailUser;
exports.GmailPass = process.env.GmailPass;
exports.FromAdminMail = process.env.FromAdminMail;
exports.userSubject = process.env.userSubject;
exports.AppSecret = process.env.AppSecret; // '!' WORKS JUST LIKE USING AS STRING
exports.Authorizer1 = process.env.Authorizer1;
