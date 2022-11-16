import express, { Request, Response, NextFunction } from "express"
import { registerSchema, option, GeneratePassword, GenerateSalt } from "../utils/utility";

export const Register = async(req: Request, res: Response) => {
  try {
    const {email, phone, password, confirm_password} = req.body

    const validateResult = registerSchema.validate(req.body, option)

    if(validateResult.error) {
      return res.status(400).json({Error: validateResult.error.details[0].message})
    }
      //GENERATE SALT
    const salt = await GenerateSalt()
    const userPaaword = await GeneratePassword(password,salt)
    console.log(userPaaword)

    return res.status(200).json({ message: "Registered" });
  } catch (err) {
    res.status(500).json({Error:"Internal Server Error",
  route:"/user/signup"
})
  }
};


