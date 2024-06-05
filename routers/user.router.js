import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { futsalPrisma } from '../util/prisma/index.js';

const app = express();
const SECRET_KEY = 'supersecretkey';

app.use(bodyParser.json());

// 회원가입 API
app.post('/api/sign-up', async (req, res) => {
    const { userId, password } = req.body;

    // userId와 password가 모두 전달되었는지 확인
    if (!userId || !password) {
        return res.status(400).json({ message: "userId 또는 password를 입력하세요" });
    }

    // 1. ID 조건 체크 추가 (영소문자 + 숫자로만 구성하기)
    // 2. 비밀번호 조건 체크 추가 (6자리이상)

    // userID 중복 체크
    const userExistChecker = await futsalPrisma.user.findFirst({
        where:{
            userId,
        }
    })

    if(userExistChecker){
        return res.status(409).json({message:"이미 존재하는 사용자ID 입니다"})
    }

    try {
        // 사용자 생성
        const newUser = await futsalPrisma.user.create({
            data: {
                userId,
                password,
                cash: 10000, // 캐시 초기값
            },
        });
        res.status(201).json({ message: `${userId}로 가입되었습니다`, createdAt: new Date() });
    } catch (error) {
        console.error('회원가입 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 로그인 API
app.post('/api/sign-in', async (req, res) => {
    const { userId, password } = req.body;

    // userId와 password가 모두 전달되었는지 확인
    if (!userId || !password) {
        return res.status(400).json({ message: "userId 또는 password를 입력하세요" });
    }

    try {
        // 사용자 조회
        const user = await futsalPrisma.user.findUnique({
            where: {
                userId,
            },
        });

        // 사용자가 존재하고 비밀번호가 일치하는 경우
        if (user && user.password === password) {
            const token = jwt.sign({ userId: user.userId }, /* 3. dotenv > .env 특수 값*/);
            // 4. 생성된 token > res headers ['authorization']에 넣어서 보내야된다
            res.status(200).json({ message: `${userId}님 환영합니다`, cash: user.cash, createdAt: new Date(), token });
        } else {
            res.status(401).json({ message: '인증 실패' });
        }
    } catch (error) {
        console.error('로그인 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});