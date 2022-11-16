import { Sequelize } from "sequelize";


    //connection is declared here
export const db = new Sequelize('app', "", "",{   
    storage: "./food.sqlite",
    dialect: 'sqlite',
    logging: false
}) 