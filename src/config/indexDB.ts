import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config()


    //connection is declared here
export const db = new Sequelize('app', "", "",{   
    storage: "./food.sqlite",
    dialect: 'sqlite',
    logging: false
}) 

export const accountSid = process.env.ACCOUNTSID
export const authToken = process.env.AUTHTOKEN
export const fromAdminPhone = process.env.fromAdminPhone

export const GmailUser = process.env.GmailUser
export const GmailPass = process.env.GmailPass
export const FromAdminMail = process.env.FromAdminMail as string
export const userSubject = process.env.userSubject as string
export const AppSecret = process.env.AppSecret!      // '!' WORKS JUST LIKE USING AS STRING