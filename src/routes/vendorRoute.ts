import express from 'express'
import {  } from '../controller/adminController'
import {} from '../controller/userController'
import { CreateFood, DeleteFood, VendorLogin, VendorProfile } from '../controller/vendorController'
import { auth, authVendor } from '../middleware/auth'

const router = express.Router()

router.post('/login', VendorLogin )
router.post('/create-food', authVendor, CreateFood )
router.get('/get-profile', authVendor, VendorProfile )
router.delete('/delete-food/:foodid', authVendor, DeleteFood)







export default router