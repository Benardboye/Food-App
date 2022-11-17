import express from 'express'
import {Login, Register, ResendOtp, VerifyUser} from '../controller/userController'

const router = express.Router()

router.post('/signup', Register )
router.post('/login', Login )
router.post('/verify/:signature', VerifyUser )
router.get('/resend-otp/:signature', ResendOtp )



export default router