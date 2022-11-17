"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendOtp = exports.Login = exports.VerifyUser = exports.Register = void 0;
const utils_1 = require("../utils");
const userModel_1 = require("../model/userModel");
const uuid_1 = require("uuid");
const indexDB_1 = require("../config/indexDB");
const Register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //RECEIVE USERS DEATAILS AND CONFIRM IF THEY MATCH WITH THE WAY
        // IT SHOULD BE PROVIDED IN THE SCHEMA
        const { email, phone, password, confirm_password } = req.body;
        let uuiduser = (0, uuid_1.v4)();
        const validateResult = utils_1.registerSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res
                .status(400)
                .json({ Error: validateResult.error.details[0].message });
        }
        //GENERATE SALT
        const salt = yield (0, utils_1.GenerateSalt)();
        const userPassword = yield (0, utils_1.GeneratePassword)(password, salt);
        //GENERATE OTP
        const { otp, expiry } = (0, utils_1.GenerateOTP)();
        //CHECK IF THE USER EXIST
        const User = (yield userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        console.log(User);
        //CREATE USER
        if (!User) {
            let user = yield userModel_1.UserInstance.create({
                id: uuiduser,
                email,
                password: userPassword,
                firstName: "",
                lastName: "",
                salt,
                address: "",
                phone,
                otp,
                otp_expiry: expiry,
                lng: 0,
                lat: 0,
                verified: false,
            });
            //SEND OTP TO USER
            yield (0, utils_1.onRequestOtp)(otp, phone);
            //SEND EMAIL TO USER
            const html = (0, utils_1.emailHtml)(otp);
            yield (0, utils_1.mailsent)(indexDB_1.FromAdminMail, email, indexDB_1.userSubject, html);
            //CHECK IF THE USER EXIST
            const User = (yield userModel_1.UserInstance.findOne({
                where: { email: email },
            }));
            //GENERATE SIGNATURE
            let signature = yield (0, utils_1.GenerateSignature)({
                id: User.id,
                email: User.email,
                verified: User.verified,
            });
            return res.status(201).json({
                message: "User Successfully Registered. Check your email or phonenumber for OTP verification",
                signature,
                verified: User.verified,
            });
        }
        return res.status(400).json({ message: "User already exist" });
    }
    catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ Error: "Internal Server Error", route: "/user/signup" });
    }
});
exports.Register = Register;
/**======================================================   Verify Users   =================================================================**/
const VerifyUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.signature;
        const decode = yield (0, utils_1.verifySignature)(token);
        // CHECK IF THE USER IS A REGISTERED USER
        const User = (yield userModel_1.UserInstance.findOne({
            where: { email: decode.email },
        }));
        if (User) {
            const { otp } = req.body;
            if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
                // 30MINS GREATER THAN THE CURRENT TIME(4:30PM >= 4:15PM)
                const updatedUser = (yield userModel_1.UserInstance.update({
                    verified: true,
                }, { where: { email: decode.email } })); // as unknown as UserAtrributes MEANS I DO NOT KNOW THE
                // INSTANCE OF THE USERINSTANCE, HOWEVER, I KNOW IT SHOULD COME IN AN OBJECT
                // GENEARTE A NEW SIGNATURE
                let signature = yield (0, utils_1.GenerateSignature)({
                    id: updatedUser.id,
                    email: updatedUser.email,
                    verified: updatedUser.verified,
                });
                if (updatedUser) {
                    const User = (yield userModel_1.UserInstance.findOne({
                        where: { email: decode.email },
                    }));
                    return res.status(200).json({
                        message: "Verification Successful",
                        signature,
                        verified: User.verified,
                    });
                }
            }
        }
        return res.status(400).json({
            Error: "Invalid Credentials or OTP is already expired",
        });
    }
    catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ Error: "Internal Server Error", route: "/user/verify" });
    }
});
exports.VerifyUser = VerifyUser;
/**======================================================   Login   =================================================================**/
const Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //RECEIVE USERS DEATAILS AND CONFIRM IF THEY MATCH WITH THE WAY
        // IT SHOULD BE PROVIDED IN THE SCHEMA
        const { email, password } = req.body;
        const validateResult = utils_1.loginSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res
                .status(400)
                .json({ Error: validateResult.error.details[0].message });
        }
        //FIND USER BY EMAIL
        const User = (yield userModel_1.UserInstance.findOne({
            where: { email: email },
        }));
        if (User) {
            let validation = yield (0, utils_1.validatePassword)(password, User.password, User.salt);
            // let validation = await bcrypt.compare(password,User.password)
            if (validation) {
                // GENEARTE A NEW SIGNATURE
                let signature = yield (0, utils_1.GenerateSignature)({
                    id: User.id,
                    email: User.email,
                    verified: User.verified,
                });
                return res.status(200).json({
                    message: "You hve successfully logged in",
                    signature,
                    email: User.email,
                    verified: User.verified,
                });
            }
        }
        return res.status(400).json({
            Error: "Wrong Credentials",
        });
    }
    catch (err) {
        console.log(err);
        res
            .status(500)
            .json({ Error: "Internal Server Error", route: "/user/login" });
    }
});
exports.Login = Login;
/**======================================================   Resend OTP   =================================================================**/
const ResendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.signature;
        const decode = yield (0, utils_1.verifySignature)(token);
        // CHECK IF THE USER IS A REGISTERED USER
        const User = (yield userModel_1.UserInstance.findOne({
            where: { email: decode.email },
        }));
        if (User) {
            //GENRATE OTP
            const { otp, expiry } = (0, utils_1.GenerateOTP)();
            const updatedUser = (yield userModel_1.UserInstance.update({
                otp,
                otp_expiry: expiry,
            }, {
                where: { email: decode.email },
            }));
            //SEND OTP
            if (updatedUser) {
                const User = (yield userModel_1.UserInstance.findOne({
                    where: { email: decode.email },
                }));
                yield (0, utils_1.onRequestOtp)(otp, User.phone);
                //SEND EMAIL TO USER
                const html = (0, utils_1.emailHtml)(otp);
                yield (0, utils_1.mailsent)(indexDB_1.FromAdminMail, User.email, indexDB_1.userSubject, html);
                return res.status(200).json({
                    message: "OTP resent successfully",
                });
            }
            return res.status(400).json({
                Error: "Error sending OTP",
            });
        }
    }
    catch (err) {
        console.log(err);
        res
            .status(500)
            .json({
            Error: "Internal Server Error",
            route: "/user/resend-otp/:signature",
        });
    }
});
exports.ResendOtp = ResendOtp;
