import {
  accountSid,
  authToken,
  fromAdminPhone,
  GmailUser,
  GmailPass,
  FromAdminMail,
  userSubject
} from "../config/indexDB";
import nodemailer from "nodemailer";
import { string } from "joi";
import { transport } from "pino";
import { response } from "express";


export const GenerateOTP = () => {
  const otp = Math.floor(100000 + Math.random() * 9000); //CHANGE 100000 TO 1000 TO HAVE 4 DIGITS OTP
  const expiry = new Date();
  expiry.setTime(new Date().getTime() + 30 * 60 * 1000);
  return { otp, expiry };
};

export const onRequestOtp = async (otp: number, toPhoneNumber: number) => {
  const client = require("twilio")(accountSid, authToken);
  const response = await client.messages.create({
    body: `Your OTP is ${otp}. DO NOT DISCLOSE. Expiration is 30mins`,
    to: toPhoneNumber,
    from: fromAdminPhone,
  });
  return response;
};

export const transporter = nodemailer.createTransport({
  service: "gmail", // SAME AS HOST
  auth: {
    user: GmailUser,
    pass: GmailPass,
  },
  tls: {
    rejectUnauthorized: false, //TELLING THE NODEMAILER TO ENSURE THAT
    //THE MAIL IS SENT TO THE USER AND SEND RESPONSE IF IT COULD NOT DELIVER PROBABLY DUE TO WRONG EMAIL ADDRESS
  },
});
    // sender address. // list of receivers // Subject line // text:string, // plain text body // html body
export const mailsent = async(
    from:string, 
    to:string, 
    subject:string, 
    html:string, 
) => {
    try{
        //THE ARRANGEMENT BELOW IS IMPORTANT. FROM-TO-SUBJECT-HTML
        const response = await transporter.sendMail({
            from: FromAdminMail, 
            to,
            subject: userSubject,
            html
        })
        return response
    } catch(err){
        console.log(err)
    }
}
  //EMAIL TEMPLATE
export const emailHtml = (otp:number):string => {
    let response = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2;font-size:110%;padding:50px 20px;border:10px solid #ddd">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">BOYE store</a>
    </div>
    <p style="font-size:1.1em">Hi,</p>
    <p>Thank you for creating an account with BOYE Store. Use the following OTP to complete your Sign Up procedures. OTP is valid for 30 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">324457</h2>
    <p style="font-size:0.9em;">Regards,<br />BOYE store</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>BOYE Store Inc</p>
      <p>42, Toyin street, Ikeja Lagos</p>
      <p>Nigeria</p>
    </div>
  </div>
</div>
    `
    return response
}
