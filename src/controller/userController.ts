import express, { Request, Response, NextFunction } from "express";
import {
  registerSchema,
  option,
  GeneratePassword,
  GenerateSalt,
  GenerateOTP,
  onRequestOtp,
  mailsent,
  emailHtml,
  GenerateSignature
} from "../utils";
import { UserAtrributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { string } from "joi";
import { FromAdminMail, userSubject, } from "../config/indexDB";

export const Register = async (req: Request, res: Response) => {
  try {
    const { email, phone, password, confirm_password } = req.body;
   let  uuiduser = uuidv4();
    const validateResult = registerSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }
    //GENERATE SALT
    const salt = await GenerateSalt();
    const userPassword = await GeneratePassword(password, salt);

    //GENERATE OTP
    const { otp, expiry } = GenerateOTP();

    //CHECK IF THE USER EXIST

    const User = await UserInstance.findOne({ where: { email: email } }) as unknown as UserAtrributes
     console.log(User)
    //CREATE USER
    if (!User) {
      let user = await UserInstance.create({
        id: uuiduser, //This generate the unique Id
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
      await onRequestOtp(otp,phone)

      //SEND EMAIL TO USER 
      const html = emailHtml(otp)
      await mailsent(FromAdminMail, email, userSubject, html )

      //CHECK IF THE USER EXIST
      const User = await UserInstance.findOne({ where: { email: email } }) as unknown as UserAtrributes

       //GENERATE SIGNATURE
        let signature = await GenerateSignature({
          id:User.id,
          email:User.email,
          verified:User.verified
        })


      return res.status(201).json({
        message: "User Successfully Registered",
        signature,
      });
    }
    return res.status(400).json({ message: "User already exist" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/user/signup" });
  }
};
