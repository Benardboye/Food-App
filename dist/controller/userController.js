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
exports.updateUserProfile = exports.getSingleUser = exports.getAllUser = exports.ResendOtp = exports.Login = exports.VerifyUser = exports.Register = void 0;
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
                role: "user"
            });
            //SEND OTP TO USER
            // await onRequestOtp(otp, phone);
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
                Message: "User Successfully Registered. Check your email or phonenumber for OTP verification",
                signature,
                verified: User.verified,
            });
        }
        return res.status(400).json({ Error: "User already exist" });
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
                        Message: "Verification Successful",
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
        if (User && User.verified == true) {
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
                    Message: "You have successfully logged in",
                    signature,
                    email: User.email,
                    verified: User.verified,
                    role: User.role
                });
            }
        }
        return res.status(400).json({
            Error: "Wrong Credentials or not a verified user",
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
                // await onRequestOtp(otp, User.phone);
                //SEND EMAIL TO USER
                const html = (0, utils_1.emailHtml)(otp);
                yield (0, utils_1.mailsent)(indexDB_1.FromAdminMail, User.email, indexDB_1.userSubject, html);
                return res.status(200).json({
                    Message: "OTP resent successfully",
                });
            }
            return res.status(400).json({
                Error: "Error sending OTP",
            });
        }
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            Error: "Internal Server Error",
            route: "/user/resend-otp/:signature",
        });
    }
});
exports.ResendOtp = ResendOtp;
/**======================================================   USER PROFILE   =================================================================**/
const getAllUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const limit = req.query.limit; //LIMIT IS BASICALLY FOR PAGINATION(TO SHOW THE NUMBER OF USERS PER PAGE)
        // const sort = req.query.sort    //FOR SORTING
        const users = yield userModel_1.UserInstance.findAndCountAll({
            limit: limit,
        }); //FINDALL({}) METHOD CAN BE USED TOO BUT IT DOESN'T HAVE THE COUNT AND ROW FEATURE
        return res.status(200).json({
            Message: "You have successfully retrived all users",
            count: users.count,
            users: users.rows,
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            Error: "Internal Server Error",
            route: "/user/get-all-users",
        });
    }
});
exports.getAllUser = getAllUser;
/**======================================================  SINGLE USER   =================================================================**/
const getSingleUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user.id;
        //FIND USER BY ID
        const User = yield userModel_1.UserInstance.findOne({
            where: { id: id },
        });
        if (User) {
            return res.status(200).json({
                User,
            });
        }
        return res.status(400).json({
            Error: "User not found",
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal Server Error",
            route: "/user/get-user",
        });
    }
});
exports.getSingleUser = getSingleUser;
/**======================================================  UPDATE USER PROFILE   =================================================================**/
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user.id;
        const { firstName, lastName, address, phone } = req.body;
        //JOI VALIDATION
        const validateResult = utils_1.updateSchema.validate(req.body, utils_1.option);
        if (validateResult.error) {
            return res
                .status(400)
                .json({ Error: validateResult.error.details[0].message });
        }
        //CHECK IF THE USER IS A REGISTERED USER
        const User = yield userModel_1.UserInstance.findOne({ where: { id: id } });
        if (!User) {
            return res.status(400).json({
                Error: "You are not authorised to update your profile"
            });
        }
        const updatedUser = yield userModel_1.UserInstance.update({
            firstName,
            lastName,
            address,
            phone
        }, { where: { id: id } });
        if (updatedUser) {
            const User = yield userModel_1.UserInstance.findOne({ where: { id: id } });
            return res.status(200).json({
                Message: "You have successfully updated your profile",
                User
            });
        }
        return res.status(400).json({
            Error: "Error Occured"
        });
    }
    catch (err) {
        return res.status(500).json({
            Error: "Internal Server Error",
            route: "/user/update-profile",
        });
    }
});
exports.updateUserProfile = updateUserProfile;
