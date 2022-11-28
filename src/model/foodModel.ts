import { DataTypes, Model } from "sequelize";
import { db } from "../config/indexDB";

export interface FoodAtrributes {
  id: string;
  name: string,
  description: string,
  category: string,
  foodType: string;
  readyTime: number;
  price: number;
  rating:number,
  image:string,
  vendorId: string
  
}

export class FoodInstance extends Model<FoodAtrributes> {}

FoodInstance.init(
  {
    id: {
        type: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
    name:{
        type:DataTypes.STRING,
        allowNull:false
    },
    description:{
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      foodType:{
        type: DataTypes.STRING,
        allowNull: false,
      },
      readyTime:{
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      price:{
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      rating:{
        type: DataTypes.NUMBER,
        allowNull: true,
      },
      vendorId:{
        type: DataTypes.UUIDV4,
        allowNull: false,
      },
      image:{
        type: DataTypes.UUIDV4,
        allowNull: false,
      },

      
  },
{
    sequelize:db,
    tableName:"food"
}
);
