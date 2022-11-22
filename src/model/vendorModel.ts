import { DataTypes, Model } from "sequelize";
import { db } from "../config/indexDB";
import { FoodInstance } from "./foodModel";

export interface VendorAtrributes {
  id: string;
  name: string;
  ownerName: string;
  pinCode: string;
  phone: string;
  address: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailable: boolean;
  rating: number;
  role: string;
}

export class VendorInstance extends Model<VendorAtrributes> {}

VendorInstance.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    ownerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pinCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Phone number is required",
        },
        notEmpty: {
          msg: "provide a phone number",
        },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Email address is required",
        },
        isEmail: {
          msg: "please provide a valid email",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "password is required",
        },
        notEmpty: {
          msg: "provide a password",
        },
      },
    },

    salt: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    serviceAvailable: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },

    rating: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    tableName: "vendor",
  }
);


VendorInstance.hasMany(FoodInstance, {foreignKey: "vendorId", as: "food"})

FoodInstance.belongsTo(VendorInstance, {foreignKey:"vendorId", as: "vendor" })