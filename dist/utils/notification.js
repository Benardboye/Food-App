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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailHtml = exports.mailsent = exports.transporter = exports.onRequestOtp = exports.GenerateOTP = void 0;
const indexDB_1 = require("../config/indexDB");
const nodemailer_1 = __importDefault(require("nodemailer"));
const GenerateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 9000); //CHANGE 100000 TO 1000 TO HAVE 4 DIGITS OTP
    const expiry = new Date();
    expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
    return { otp, expiry };
};
exports.GenerateOTP = GenerateOTP;
const onRequestOtp = (otp, toPhoneNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const client = require("twilio")(indexDB_1.accountSid, indexDB_1.authToken);
    const response = yield client.messages.create({
        body: `Your OTP is ${otp}. DO NOT DISCLOSE. Expiration is 30mins`,
        to: toPhoneNumber,
        from: indexDB_1.fromAdminPhone,
    });
    return response;
});
exports.onRequestOtp = onRequestOtp;
exports.transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: indexDB_1.GmailUser,
        pass: indexDB_1.GmailPass,
    },
    tls: {
        rejectUnauthorized: false, //TELLING THE NODEMAILER TO ENSURE THAT
        //THE MAIL IS SENT TO THE USER AND SEND RESPONSE IF IT COULD NOT DELIVER PROBABLY DUE TO WRONG EMAIL ADDRESS
    },
});
// sender address. // list of receivers // Subject line // text:string, // plain text body // html body
const mailsent = (from, to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //THE ARRANGEMENT BELOW IS IMPORTANT. FROM-TO-SUBJECT-HTML
        const response = yield exports.transporter.sendMail({
            from: indexDB_1.FromAdminMail,
            to,
            subject: indexDB_1.userSubject,
            html
        });
        return response;
    }
    catch (err) {
        console.log(err);
    }
});
exports.mailsent = mailsent;
//FUNCTION FOR HTML TEMPLATE
const emailHtml = (otp) => {
    let response = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2;font-size:110%;padding:50px 20px;border:10px solid #ddd">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BOYE store</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for creating an account with BOYE Store. Use the following OTP to complete your Sign Up procedures. OTP is valid for 30 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
    <p style="font-size:0.9em;">Regards,<br />BOYE store</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>BOYE Store Inc</p>
      <p>42, Toyin street, Ikeja Lagos</p>
      <p>Nigeria</p>
    </div>
  </div>
</div>
    `;
    return response;
};
exports.emailHtml = emailHtml;
