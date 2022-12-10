import express from 'express'
import {  } from '../controller/adminController'
import {} from '../controller/userController'
import { CreateFood, DeleteFood, updateVendorProfile, VendorLogin, VendorProfile, AllVendorProfile, DisplayVendorAndFood } from '../controller/vendorController'
import { auth, authVendor } from '../middleware/auth'
import { upload } from '../utils/multer'

const router = express.Router()

router.post('/login', VendorLogin )
router.post('/create-food', authVendor, upload.single("image"), CreateFood )
router.get('/get-profile', authVendor, VendorProfile )
router.get('/get-all-profile', AllVendorProfile )
router.get('/get-vendor-and-food/:id', DisplayVendorAndFood )
router.delete('/delete-food/:foodid', authVendor, DeleteFood)
router.patch('/update-profile', authVendor, upload.single("coverImage"), updateVendorProfile)

//IF A SINGLE IMAGE IS TO BE UPLAODED, IT 






export default router