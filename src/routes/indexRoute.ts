import express,{Request, Response, NextFunction} from 'express'

const router = express.Router()

router.get('/index', (req:Request, res:Response) => {
    return res.status(200).send("Welcome to BOYE's world")
})

export default router