import { DataTypes, Model } from "sequelize";
import { db } from "../config/indexDB";

export interface UserAtrribute {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  salt: string;
  address: string;
  phone: string;
  otp: number;
  otp_expiry: Date;
  lng: number;
  lat: number;
  verified: boolean;
}

export class UserInstance extends Model<UserAtrribute> {}

UserInstance.init(
  {
    id: {
      type: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: {
          msg: "Email Address is required",
        },
        isEmail: {
          msg: "Please provide a valid email",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    salt: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Salt is required",
        },
      },
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Phone number is required",
        },
        notEmpty: {
          msg: "Please provide a phone number",
        },
      },
    },
    otp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Otp is required",
        },
        notEmpty: {
          msg: "Please provide an Otp",
        },
      },
    },
    otp_expiry: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Otp is required",
        },
      },
    },
    lng: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    lat: {
      type: DataTypes.NUMBER,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notNull: {
          msg: "User must be verified",
        },
        notEmpty: {
          msg: "Please provide an Otp",
        },
      },
    },
  },

  {
    sequelize: db,
    tableName: "user",
  }
);
