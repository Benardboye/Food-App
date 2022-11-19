import express from 'express'
import {getAllUser, getSingleUser, Login, Register, ResendOtp, VerifyUser} from '../controller/userController'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/signup', Register )
router.post('/login', Login )
router.post('/verify/:signature', VerifyUser )
router.get('/resend-otp/:signature', ResendOtp )
router.get('/get-all-user', getAllUser )
router.get('/get-user', auth, getSingleUser )





export default router