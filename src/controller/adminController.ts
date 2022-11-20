import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  adminSchema,
  GenerateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  option,
} from "../utils";
import { UserAtrributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { Authorizer1 } from "../config/indexDB";

export const AdminRegister = async (req: Request, res: Response) => {
  try {
    //RECEIVE USERS DEATAILS AND CONFIRM IF THEY MATCH WITH THE WAY
    // IT SHOULD BE PROVIDED IN THE SCHEMA

    const { email, phone, password, firstName, lastName, address } = req.body;
    let uuidadmin = uuidv4();
    const validateResult = adminSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }
    //GENERATE SALT
    const salt = await GenerateSalt();
    const adminPassword = await GeneratePassword(password, salt);

    //GENERATE OTP
    const { otp, expiry } = GenerateOTP();

    //CHECK IF THE ADMIN EXIST

    const Admin = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAtrributes;

    if (!Admin) {
      const superAdmin = (await UserInstance.findOne({
        where: { email: Authorizer1 },
      })) as unknown as UserAtrributes;

      // ACCESS THE SUPERADMIN
      if (superAdmin.role == "superadmin") {

        //CREATE USER
        let user = await UserInstance.create({
          id: uuidadmin, //This generate the unique Id
          email,
          password: adminPassword,
          firstName: firstName,
          lastName: lastName,
          salt,
          address: address,
          phone,
          otp,
          otp_expiry: expiry,
          lng: 0,
          lat: 0,
          verified: true,
          role: "admin",
        });
      }
      //CHECK IF THE ADMIN EXIST
      const Admin = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAtrributes;

      //GENERATE SIGNATURE
      let signature = await GenerateSignature({
        id: Admin.id,
        email: Admin.email,
        verified: Admin.verified,
      });

      return res.status(201).json({
        message: "Admin Successfully Registered.",
        signature,
        verified: Admin.verified,
      });
    }
    return res.status(400).json({ message: "Admin already exist" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/create-admin" });
  }
};

/**======================================================  CREATE SUPERADMIN   =================================================================**/

export const SuperAdminRegister = async (req: JwtPayload, res: Response) => {
  try {
    //RECEIVE USERS DEATAILS AND CONFIRM IF THEY MATCH WITH THE WAY
    // IT SHOULD BE PROVIDED IN THE SCHEMA

    const { email, phone, password, firstName, lastName, address } = req.body;
    let uuidadmin = uuidv4();
    const validateResult = adminSchema.validate(req.body, option);

    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }
    //GENERATE SALT
    const salt = await GenerateSalt();
    const adminPassword = await GeneratePassword(password, salt);

    //GENERATE OTP
    const { otp, expiry } = GenerateOTP();

    //CHECK IF THE ADMIN EXIST

    const Admin = (await UserInstance.findOne({
      where: { email: email },
    })) as unknown as UserAtrributes;

    //CREATE USER
    if (!Admin) {
      let user = await UserInstance.create({
        id: uuidadmin, //This generate the unique Id
        email,
        password: adminPassword,
        firstName: firstName,
        lastName: lastName,
        salt,
        address: address,
        phone,
        otp,
        otp_expiry: expiry,
        lng: 0,
        lat: 0,
        verified: true,
        role: "superadmin",
      });

      //CHECK IF THE ADMIN EXIST
      const Admin = (await UserInstance.findOne({
        where: { email: email },
      })) as unknown as UserAtrributes;

      //GENERATE SIGNATURE
      let signature = await GenerateSignature({
        id: Admin.id,
        email: Admin.email,
        verified: Admin.verified,
      });

      return res.status(201).json({
        message: "Admin Successfully Registered.",
        signature,
        verified: Admin.verified,
      });
    }
    return res.status(400).json({ message: "Admin already exist" });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/create-superadmin" });
  }
};
