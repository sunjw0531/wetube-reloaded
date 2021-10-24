import express from "express";
import morgan from "morgan";
import session from "express-session";
import flash from "express-flash";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter.js";
import videoRouter from "./routers/videoRouter.js";
import userRouter from "./routers/userRouter.js";
import {localsMiddleware} from "./middlewares";
import apiRouter from "./routers/apiRouter.js";


const app = express();
const logger = morgan("dev");


app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({extended:true}));
// JSON.parse("") / JSON파일을 다시 자바스크립트 오브젝트로 변환해주는
// 표준 함수로 요청 body 내의 컨텐츠를 디코딩하는 작업을 하는 미들웨어
app.use(express.json());
app.use(
    session({
        secret : process.env.COOKIE_SECRET,
        resave:false,
        saveUninitialized:false,
        // cookie : {
        //     maxAge : 3600000
        // }
        store : MongoStore.create({
            mongoUrl : process.env.DB_URL
        })
    })
);

// flash 미들웨어는 messages라고 하는 locals를 사용할 수 있게 함
app.use(flash());
app.use(localsMiddleware);
// "/uploads"로 간다면 uploads 폴더를 노출 시킨다.
// express한테 사람들이 이 폴더 안에 있는 파일들을 볼 수 있게 해달라고 요청
app.use("/uploads", express.static("uploads"));
// 브라우저 경로에 assets 는 사용 불가능!
app.use("/static", express.static("assets"))

app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);


// const handleHome = (req,res) =>{
//     res.send("I love middlewares");
// };

// app.use(logger);
// app.get("/", logger, handleHome);

export default app;

