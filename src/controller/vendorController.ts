import express, { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UUIDV4 } from "sequelize";
import { FoodAtrributes, FoodInstance } from "../model/foodModel";
import { VendorAtrributes, VendorInstance } from "../model/vendorModel";
import {v4 as uuidv4} from "uuid"

/**======================================================   Login   =================================================================**/

import { GenerateSignature, loginSchema, option, updateVendorSchema, validatePassword } from "../utils";

export const VendorLogin = async(req: Request, res: Response) => {
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
        const Vendor = (await VendorInstance.findOne({
          where: { email: email },
        })) as unknown as VendorAtrributes;
    
        if (Vendor) {
          let validation = await validatePassword(
            password,
            Vendor.password,
            Vendor.salt
          );
          // let validation = await bcrypt.compare(password,User.password)
          if (validation) {
            // GENEARTE A NEW SIGNATURE
            let signature = await GenerateSignature({
              id: Vendor.id,
              email: Vendor.email,
              serviceAvailable: Vendor.serviceAvailable,
            });
            return res.status(200).json({
              Message: "You have successfully logged in",
              signature,
              email: Vendor.email,
              serviceAvailable: Vendor.serviceAvailable,
              role:Vendor.role
            });
          }
        }
        return res.status(400).json({
          Error: "Wrong Credentials or not a verified vendor",
        });
      } catch (err) {
        console.log(err);
        res
          .status(500)
          .json({ Error: "Internal Server Error", route: "/user/login" });
      }
}

/**======================================================   VENDOR CREATE FOOD  =================================================================**/

export const CreateFood = async(req:JwtPayload, res:Response) => {
    try{
        const {
            name,
            description,
            category,
            foodType,
            readyTime,
            price,
            image
           } = req.body

           const id = req.vendor.id;

// CHECK IF THE USER IS A REGISTERED USER
const vendor = (await VendorInstance.findOne({
    where: { id: id },
  })) as unknown as VendorAtrributes;
  const foodid = uuidv4()
  if (vendor) {
    let createFood = await FoodInstance.create({
      id: foodid, //This generate the unique Id
      name,
    description,
    category,
     foodType,
    readyTime,
    price,
    rating: 0,
    vendorId: id,
    image:req.file.path
    });
    return res.status(201).json({
        Message:"Food added successfully",
        createFood
    })
  }
} catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/user/create-food" });
  }
}

/**======================================================   GET VENDOR PROFILE  =================================================================**/
//  NOTE: I CAN ADD LIMIT TO AQNY GET REQUEST FOR THE  PURPOSE OF PAGINATION
export const VendorProfile = async(req:JwtPayload, res:Response) => {
    try{ 
        const id = req.vendor.id;
    
        const vendor = (await VendorInstance.findOne({
            where: { id: id },
            
            //  attributes: [ "id", "name", "description", "category", "foodType"], //FOR VENDOR
            include: [   //THIS SHOWS THE RESULT OF LINKED MODELS, IT SHOWS THE DETAILS OF SERVICES PROVIDED BY A PARTICULAR VENDOR
                {
                    model: FoodInstance, 
                    as: "food",
                    //TO AVOID RENDERING OF SOME DETAILS THTA SHOULD NOT BE DISPLAYN TO USER, THE ATTRIBUTE PROPERTY CAN TAKE WHAT IS REQUIRED TO BE DISPLAYED
                    attributes: [ "id", "name", "description", "category", "foodType", "readyTime", "price", "rating", "vendorId"]  //FOR FOOD
                }  
            ]
          })) 
          attributes: [ "id", "name", "description", "category", "foodType"]
          return res.status(200).json({
            vendor,
          })
    } catch (err) {
        console.log(err);
       return res
          .status(500)
          .json({ Error: "Internal Server Error", route: "/vendors/get-profile" });
      }
}

/**======================================================   DELETE VENDOR FOOD  =================================================================**/

//DESTORY IS DONE USING THE UNIQUE ID OF THE FOOD 
 
export const DeleteFood = async(req:JwtPayload, res:Response) => {
    try{
        const id = req.vendor.id;
        const foodid = req.params.foodid

        const vendor = (await VendorInstance.findOne({
            where: { id: id },
          })) as unknown as VendorAtrributes;

          if(vendor) {
              const deletedFood = await FoodInstance.destroy({where: { id: foodid }}) 
              return res.status(200).json({
                Message: "You have succesfsuly deleted food",
                deletedFood
              })
          }


    } catch (err) {
        console.log(err);
        res
          .status(500)
          .json({ Error: "Internal Server Error", route: "/user/delete-food" });
      }

}
/**======================================================   UPDATE VENDOR PROFILE  =================================================================**/


export const updateVendorProfile = async(req:JwtPayload, res: Response) => {
  try{
    const id = req.vendor.id;
    const { name,
      phone,
      address,
      restaurantName,
      coverImage } = req.body
  
    // //JOI VALIDATION
    const validateResult = updateVendorSchema.validate(req.body, option) 
    if (validateResult.error) {
      return res
        .status(400)
        .json({ Error: validateResult.error.details[0].message });
    }
  
    //CHECK IF THE USER IS A REGISTERED USER
    const Vendor = await VendorInstance.findOne({where:{id:id}}) as unknown as VendorAtrributes
    if(!Vendor) {
      return res.status(400).json({
        Error:"You are not authorised to update your profile"
      })
    }
    const updatedVendor = await VendorInstance.update({
      name,
      phone,
      restaurantName,
      address,
      coverImage:req.file.path
    }, {where:{id:id}}) as unknown as VendorAtrributes
    if(updatedVendor) {
      const Vendor = await VendorInstance.findOne({where:{id:id}}) as unknown as VendorAtrributes
  return res.status(200).json({
    Message:"You have successfully updated your profile",
    Vendor
  })
    }
    return res.status(400).json({
      Error:"Error Occured"
    })
  } catch (err) {
    return res.status(500).json({
      Error: "Internal Server Error",
      route: "/vendors/update-profile",
    });
  }
  }

  /**======================================================  ALL VENDOR PROFILE  =================================================================**/
//  NOTE: I CAN ADD LIMIT TO AQNY GET REQUEST FOR THE  PURPOSE OF PAGINATION
export const AllVendorProfile = async(req:Request, res:Response) => {
  try{ 
      
      const vendor = (await VendorInstance.findAll({
          
          
          //  attributes: [ "id", "name", "description", "category", "foodType"], //FOR VENDOR
          include: [   //THIS SHOWS THE RESULT OF LINKED MODELS, IT SHOWS THE DETAILS OF SERVICES PROVIDED BY A PARTICULAR VENDOR
              {
                  model: FoodInstance, 
                  as: "food",
                  //TO AVOID RENDERING OF SOME DETAILS THTA SHOULD NOT BE DISPLAYN TO USER, THE ATTRIBUTE PROPERTY CAN TAKE WHAT IS REQUIRED TO BE DISPLAYED
                  attributes: [ "id", "name", "description", "category", "foodType", "readyTime", "price", "rating", "vendorId"]  //FOR FOOD
              }  
          ]
        }))
        return res.status(200).json({
          vendor
        })
  } catch (err) {
      console.log(err);
     return res
        .status(500)
        .json({ Error: "Internal Server Error", route: "/vendors/get-all-profile" });
    }
}


/**======================================================   DISPLAY VENDOR AND FOOD  =================================================================**/

//DESTORY IS DONE USING THE UNIQUE ID OF THE FOOD 
 
export const DisplayVendorAndFood = async(req:Request, res:Response) => {
  try{
      const id = req.params.id;

      const vendor = (await VendorInstance.findOne({
        where: { id: id },
        
        //  attributes: [ "id", "name", "description", "category", "foodType"], //FOR VENDOR
        include: [   //THIS SHOWS THE RESULT OF LINKED MODELS, IT SHOWS THE DETAILS OF SERVICES PROVIDED BY A PARTICULAR VENDOR
            {
                model: FoodInstance, 
                as: "food",
                //TO AVOID RENDERING OF SOME DETAILS THTA SHOULD NOT BE DISPLAYN TO USER, THE ATTRIBUTE PROPERTY CAN TAKE WHAT IS REQUIRED TO BE DISPLAYED
                attributes: [ "id", "name", "description", "category", "foodType", "readyTime", "image", "price", "rating", "vendorId"]  //FOR FOOD
            }  
        ]
      })) 
      attributes: [ "id", "name", "description", "category", "foodType"]
      return res.status(200).json({
        vendor,
      })
} catch (err) {
    console.log(err);
   return res
      .status(500)
      .json({ Error: "Internal Server Error", route: "/vendors/get-vendor-and-food/:id" });
  }

}