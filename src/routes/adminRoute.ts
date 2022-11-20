import express from 'express'
import { AdminRegister, SuperAdminRegister} from '../controller/adminController'
import {} from '../controller/userController'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/create-admin', auth, AdminRegister )
router.post('/create-superadmin', SuperAdminRegister )






export default router