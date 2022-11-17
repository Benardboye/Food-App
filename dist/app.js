"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = __importDefault(require("./utils/logger"));
const userRoute_1 = __importDefault(require("./routes/userRoute"));
const indexRoute_1 = __importDefault(require("./routes/indexRoute"));
const indexDB_1 = require("./config/indexDB");
//Sequulize conncetion
indexDB_1.db.sync().then(() => {
    logger_1.default.info('Db connected succesfully');
}).catch(err => {
    logger_1.default.error(err);
});
// OR
// const dbConnect = async () => {
//   try {
//     let data = await db.sync;
//     if (!data) {
//       log.error("Error connecting");
//     } else {
//       log.info("Db connected succesfully");
//     }
//   } catch (err) {
//     log.error;
//   }
// };
// dbConnect()
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
//ROUTER
app.use("/api/user", userRoute_1.default);
app.use("/", indexRoute_1.default);
const port = 3000;
// app.get('/', (req:Request, res:Response) => {
//     res.status(200).json({message: 'Welcome to greatness'}
//     )
// })
app.listen(port, () => {
    logger_1.default.info(`Server is listening at port: ${port}`);
});
exports.default = app;
