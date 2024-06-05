import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const SECRET_KEY = 'supersecretkey';

app.use(bodyParser.json());

// 회원가입 API
app.post('/api/sign-up', async (req, res) => {
    const { userId, password } = req.body;

    // userId와 password가 모두 전달되었는지 확인
    if (!userId || !password) {
        return res.status(400).json({ message: "userId 또는 password를 입력하세요" });
    }

    try {
        // 사용자 생성
        const newUser = await prisma.user.create({
            data: {
                userId,
                password,
                cash: 0, // 캐시 초기값
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
        const user = await prisma.user.findUnique({
            where: {
                userId,
            },
        });

        // 사용자가 존재하고 비밀번호가 일치하는 경우
        if (user && user.password === password) {
            const token = jwt.sign({ userId: user.userId }, 'supersecretkey');
            res.status(200).json({ message: `${userId}님 환영합니다`, cash: user.cash, createdAt: new Date(), token });
        } else {
            res.status(401).json({ message: '인증 실패' });
        }
    } catch (error) {
        console.error('로그인 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});


function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/protected', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});
