import express from "express";
import dotenv from "dotenv";
import CashRouter from './routers/cash.router.js';
import UserRouter from './routers/user.router.js';
import SquardRouter from './routers/squard.router.js';

dotenv.config();
console.log("Database URL:", process.env.DATABASE_URL); //squard 테스트용 코드 수정

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

// 각 라우터를 개별적으로 등록, squard 테스트 용
app.use("/api/squards", SquardRouter);  // 스쿼드 라우터
app.use("/api/cash", CashRouter);  // 캐쉬 라우터
app.use("/api/users", UserRouter);  // 유저 라우터

app.use("/", (req, res) => {
    res.send("futsal Online project from NBC 힘순조");
});

app.listen(PORT, () => {
    console.log(`Server on port: ${PORT}`);
});
