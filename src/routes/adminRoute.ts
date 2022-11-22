import express from 'express'
import { AdminRegister, CreateVendor, SuperAdminRegister} from '../controller/adminController'
import {} from '../controller/userController'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/create-admin', auth, AdminRegister )
router.post('/create-superadmin', SuperAdminRegister )
router.post('/create-vendors', auth, CreateVendor )






export default router