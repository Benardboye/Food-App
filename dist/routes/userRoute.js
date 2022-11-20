"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controller/userController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/signup', userController_1.Register);
router.post('/login', userController_1.Login);
router.post('/verify/:signature', userController_1.VerifyUser);
router.get('/resend-otp/:signature', userController_1.ResendOtp);
router.get('/get-all-user', userController_1.getAllUser);
router.get('/get-user', auth_1.auth, userController_1.getSingleUser);
router.patch('/update-profile', auth_1.auth, userController_1.updateUserProfile);
exports.default = router;
