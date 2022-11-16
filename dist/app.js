"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
// db.sync().then(() => {
//     log.info('Db connected succesfully')
// }).catch(err => {
//     log.error(err)
// })
// OR
const dbConnect = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let data = yield indexDB_1.db.sync;
        if (!data) {
            logger_1.default.error("Error connecting");
        }
        else {
            logger_1.default.info("Db connected succesfully");
        }
    }
    catch (err) {
        logger_1.default.error;
    }
});
dbConnect();
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
