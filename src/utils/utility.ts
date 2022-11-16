import Joi from "joi";
import bcrypt from "bcrypt"

export const registerSchema = Joi.object().keys({
  email: Joi.string().required(),
  phone: Joi.string().required(),
  password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")), //Joi.string().(/[a-zA-Z0-9]{6,30}/),
  confirm_password: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .messages({ "any.only": "{{#label}} does not match" }),
});
// To avoid errors with /phone/, /email/ etc
//Example "\"password\" with value \"123456\" fails to
//match the required pattern: /^[a-zA-Z0-9],{6,30}$/"
export const option = {
  abortEarly: false,
  errors: {
    wrap: {
      label: "",
    },
  },
};

        // HELPER FUNCTION FOR SALT GENERATION
export const GenerateSalt = async() => {
 return await bcrypt.genSalt()
}

export const GeneratePassword = async(password:string,salt:string) => {
    return await bcrypt.hash(password,salt)
   }