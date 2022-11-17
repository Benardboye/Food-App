import express, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import {
  registerSchema,
  option,
  GeneratePassword,
  GenerateSalt,
  GenerateOTP,
  onRequestOtp,
  mailsent,
  emailHtml,
  GenerateSignature,
  verifySignature,
  loginSchema,
  validatePassword,
} from "../utils";
import { UserAtrributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { string } from "joi";
import { FromAdminMail, userSubject } from "../config/indexDB";
import { JwtPayload } from "jsonwebtoken";

export const Register = async (req: Request, res: Response) => {
  try {
    //RECEIVE USERS DEATAILS AND CONFIRM IF THEY MATCH WITH THE WAY
    // IT SHOULD BE PROVIDED IN THE SCHEMA

    const { email, phone, password, confirm_password } = req.body;
    let uuiduser = uuidv4();
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

    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAtrributes;
    console.log(User);
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
      await onRequestOtp(otp, phone);

      //SEND EMAIL TO USER
      const html = emailHtml(otp);
      await mailsent(FromAdminMail, email, userSubject, html);

      //CHECK IF THE USER EXIST
      const User = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAtrributes;

      //GENERATE SIGNATURE
      let signature = await GenerateSignature({
        id: User.id,
        email: User.email,
        verified: User.verified,
      });

      return res.status(201).json({
        message:
          "User Successfully Registered. Check your email or phonenumber for OTP verification",
        signature,
        verified: User.verified,
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

/**======================================================   Verify Users   =================================================================**/

export const VerifyUser = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    // CHECK IF THE USER IS A REGISTERED USER
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAtrributes;

    if (User) {
      const { otp } = req.body;
      if (User.otp === parseInt(otp) && User.otp_expiry >= new Date()) {
        // 30MINS GREATER THAN THE CURRENT TIME(4:30PM >= 4:15PM)
        const updatedUser = (await UserInstance.update(
          {
            verified: true,
          },
          { where: { email: decode.email } }
        )) as unknown as UserAtrributes; // as unknown as UserAtrributes MEANS I DO NOT KNOW THE
        // INSTANCE OF THE USERINSTANCE, HOWEVER, I KNOW IT SHOULD COME IN AN OBJECT

        // GENEARTE A NEW SIGNATURE
        let signature = await GenerateSignature({
          id: updatedUser.id,
          email: updatedUser.email,
          verified: updatedUser.verified,
        });

        if (updatedUser) {
          const User = (await UserInstance.findOne({
            where: { email: decode.email },
          })) as unknown as UserAtrributes;

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
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/user/verify" });
  }
};

/**======================================================   Login   =================================================================**/

export const Login = async (req: Request, res: Response) => {
  try {
    //RECEIVE USERS DEATAILS AND CONFIRM IF THEY MATCH WITH THE WAY
    // IT SHOULD BE PROVIDED IN THE SCHEMA

    const { email, password } = req.body;
    const validateResult = loginSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }

    //FIND USER BY EMAIL
    const User = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAtrributes;

    if (User) {
      let validation = await validatePassword(
        password,
        User.password,
        User.salt
      );
      // let validation = await bcrypt.compare(password,User.password)
      if (validation) {
        // GENEARTE A NEW SIGNATURE
        let signature = await GenerateSignature({
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
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/user/login" });
  }
};

/**======================================================   Resend OTP   =================================================================**/

export const ResendOtp = async (req: Request, res: Response) => {
  try {
    const token = req.params.signature;
    const decode = await verifySignature(token);

    // CHECK IF THE USER IS A REGISTERED USER
    const User = (await UserInstance.findOne({
      where: { email: decode.email },
    })) as unknown as UserAtrributes;

    if (User) {
      //GENRATE OTP
      const { otp, expiry } = GenerateOTP();
      const updatedUser = (await UserInstance.update(
        {
          otp,
          otp_expiry: expiry,
        },
        {
          where: { email: decode.email },
        }
      )) as unknown as UserAtrributes;

      //SEND OTP
      if (updatedUser) {
        const User = (await UserInstance.findOne({
          where: { email: decode.email },
        })) as unknown as UserAtrributes;
    
        await onRequestOtp(otp, User.phone);

        //SEND EMAIL TO USER
        const html = emailHtml(otp);
        await mailsent(FromAdminMail, User.email, userSubject, html);

        return res.status(200).json({
          message: "OTP resent successfully",
        });
      }
      return res.status(400).json({
        Error: "Error sending OTP",
      });
    }
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({
        Error: "Internal Server Error",
        route: "/user/resend-otp/:signature",
      });
  }
};
