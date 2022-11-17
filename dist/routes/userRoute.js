"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const router = express_1.default.Router();
router.post('/signup', userController_1.Register);
router.post('/login', userController_1.Login);
router.post('/verify/:signature', userController_1.VerifyUser);
router.get('/resend-otp/:signature', userController_1.ResendOtp);
exports.default = router;
