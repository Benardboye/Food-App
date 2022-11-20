import express from 'express'
import {getAllUser, getSingleUser, Login, Register, ResendOtp, updateUserProfile, VerifyUser} from '../controller/userController'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/signup', Register )
router.post('/login', Login )
router.post('/verify/:signature', VerifyUser )
router.get('/resend-otp/:signature', ResendOtp )
router.get('/get-all-user', getAllUser )
router.get('/get-user', auth, getSingleUser)
router.patch('/update-profile', auth, updateUserProfile)






export default router