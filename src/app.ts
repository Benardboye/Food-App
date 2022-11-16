import express, { Request, Response, NextFunction } from "express";
import logger from "morgan";
import cookieParser from "cookie-parser";
import colors from "colors";
import log from "./utils/logger";
import userRouter from "./routes/userRoute";
import indexRouter from "./routes/indexRoute";
import { db } from "./config/indexDB";

//Sequulize conncetion
// db.sync().then(() => {
//     log.info('Db connected succesfully')
// }).catch(err => {
//     log.error(err)
// })

        // OR

const dbConnect = async () => {
  try {
    let data = await db.sync;
    if (!data) {
      log.error("Error connecting");
    } else {
      log.info("Db connected succesfully");
    }
  } catch (err) {
    log.error;
  }
};

dbConnect()

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(cookieParser());

//ROUTER
app.use("/api/user", userRouter);
app.use("/", indexRouter);

const port = 3000;

// app.get('/', (req:Request, res:Response) => {
//     res.status(200).json({message: 'Welcome to greatness'}
//     )
// })

app.listen(port, () => {
  log.info(`Server is listening at port: ${port}`);
});

export default app;