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
  updateSchema,
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
        role:"user"
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

    if (User && User.verified == true) {
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
          message: "You have successfully logged in",
          signature,
          email: User.email,
          verified: User.verified,
          role:User.role
        });
      }
    }
    return res.status(400).json({
      Error: "Wrong Credentials or not a verified user",
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
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/resend-otp/:signature",
    });
  }
};

/**======================================================   USER PROFILE   =================================================================**/

export const getAllUser = async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit as number | undefined; //LIMIT IS BASICALLY FOR PAGINATION(TO SHOW THE NUMBER OF USERS PER PAGE)
    // const sort = req.query.sort    //FOR SORTING
    const users = await UserInstance.findAndCountAll({
      limit: limit,
    }); //FINDALL({}) METHOD CAN BE USED TOO BUT IT DOESN'T HAVE THE COUNT AND ROW FEATURE
    return res.status(200).json({
      message: "You have successfully retrived all users",
      count: users.count,
      users: users.rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/get-all-users",
    });
  }
};

/**======================================================  SINGLE USER   =================================================================**/

export const getSingleUser = async (
  req: JwtPayload,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.id;

    //FIND USER BY ID
    const User = await UserInstance.findOne({
      where: { id: id },
    });
    if (User) {
      return res.status(200).json({
        User,
      });
    }
      return res.status(400).json({
        message: "User not found",
      });
    
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/user/get-user",
    });
  }
};

/**======================================================  UPDATE USER PROFILE   =================================================================**/

export const updateUserProfile = async(req:JwtPayload, res: Response) => {
try{
  const id = req.user.id;
  const {firstName,lastName,address,phone } = req.body

  //JOI VALIDATION
  const validateResult = updateSchema.validate(req.body, option) 
  if (validateResult.error) {
    return res
      .status(400)
      .json({ Error: validateResult.error.details[0].message });
  }

  //CHECK IF THE USER IS A REGISTERED USER
  const User = await UserInstance.findOne({where:{id:id}}) as unknown as UserAtrributes
  if(!User) {
    return res.status(400).json({
      Error:"You are not authorised to update your profile"
    })
  }
  const updatedUser = await UserInstance.update({
    firstName,
    lastName,
    address,
    phone
  }, {where:{id:id}}) as unknown as UserAtrributes
  if(updatedUser) {
    const User = await UserInstance.findOne({where:{id:id}}) as unknown as UserAtrributes
return res.status(200).json({
  message:"You have successfully updated your profile",
  User
})
  }
  return res.status(400).json({
    message:"Error Occured"
  })
} catch (err) {
  return res.status(500).json({
    Error: "Internal Server Error",
    route: "/user/update-profile",
  });
}
}
