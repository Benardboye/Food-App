import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {
  adminSchema,
  GenerateOTP,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  option,
  vendorSchema,
} from "../utils";
import { UserAtrributes, UserInstance } from "../model/userModel";
import { v4 as uuidv4 } from "uuid";
import { VendorAtrributes, VendorInstance } from "../model/vendorModel";

export const AdminRegister = async (req: JwtPayload, res: Response) => {
  try {
    const id = req.user.id
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

    const Admin = await UserInstance.findOne({ where: { email: email } }) as unknown as UserAtrributes
    const authorizer = await UserInstance.findOne({where:{id:id}})  as unknown as UserAtrributes
//CREATE USER
if (!Admin) {
    if(authorizer.role != "superadmin") {
        return res.status(400).json({
            Error: "Unauthorised"
        })
    }
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


/**======================================================  CREATE VENDOR   =================================================================**/

export const CreateVendor = async(req:JwtPayload, res:Response) => {
    try{
        const {
            name,
            restaurantName, 
            pinCode,
            phone,
            address,
            email,
            password,
           } = req.body

           const id = req.user.id;
           const uuidvendor = uuidv4();

 //JOI VALIDATION
  const validateResult = vendorSchema.validate(req.body, option) 
  if (validateResult.error) {
    return res
      .status(400)
      .json({ Error: validateResult.error.details[0].message });
      
  }
      //GENERATE SALT
    const salt = await GenerateSalt();
    const vendorPassword = await GeneratePassword(password, salt);

  //CHECK IF THE ADMIN EXIST

  const vendor = (await VendorInstance.findOne({
    where: { email: email },
  })) as unknown as VendorAtrributes;

  const authorizer = (await UserInstance.findOne({
    where: { id: id },
  })) as unknown as UserAtrributes;

  if(authorizer.role === "admin" || authorizer.role === "superadmin") {


  if(!vendor) {

    //ACCESS THE ADMIN OR SUPERADMIN
    

    const createVendor = await VendorInstance.create({
        id: uuidvendor,
        name,
        restaurantName,
        pinCode,
        phone,
        address,
        email,
        password: vendorPassword,
        salt,
        role:"Vendor",
        serviceAvailable: false,
        rating: 0,
        coverImage: ""
    })
    return res.status(201).json({
        Message:"Vendor created successfully",
        createVendor
    })
  }
  return res.status(400).json({
    Error:"Vendor already exist"
  })
}
return res.status(400).json({
    Error:"Unauthorised"
 })

    } catch (err) {
        console.log(err);
        res
          .status(500)
          .json({ Error: "Internal Server Error", route: "/create-vendors" });
      }
}
