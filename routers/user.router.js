import express from 'express';
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import { prisma } from '../util/prisma/index.js';
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();
const accountNameRegex = /^[a-z0-9]+$/;
const passwordRegex = /^[a-zA-Z\d\W]{6,}$/
const jwtSecret = process.env.USER_TOKEN_KEY;

// 회원가입 API
router.post('/sign-up', async (req, res) => {
    const { accountName, password } = req.body;

    // accountName와 password가 모두 전달되었는지 확인
    if (!accountName || !password) {
        return res.status(400).json({ message: "accountName 또는 password를 입력하세요" });
        }  
        // ID 조건 (영소문자 + 숫자로만 구성하기)   
        if (!accountNameRegex.test(accountName)) {
            return res.status(400).json({ message: "영소문자와 숫자로만 입력하세요" });
    }
    // 비밀번호 조건 (6자리이상) 
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: "6자 이상으로 입력하세요" });
    }
    // accountName 중복 체크
    const userExistChecker = await prisma.user.findFirst({
        where:{
            accountName,
        }
    })

    if(userExistChecker){
        return res.status(409).json({message:"이미 존재하는 사용자ID 입니다"})
    }

    try {
        // 사용자 생성
        const newUser = await prisma.user.create({
            data: {
                accountName,
                password,
                cash: 10000, // 캐시 초기값
            },
        });
        res.status(201).json({ message: `${accountName}로 가입되었습니다`, createdAt: new Date() });
    } catch (error) {
        console.error('회원가입 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});

// 로그인 API
router.post('/sign-in', async (req, res) => {
    const { accountName, password } = req.body;

    // accountName password가 모두 전달되었는지 확인
    if (!accountName || !password) {
        return res.status(400).json({ message: "accountName 또는 password를 입력하세요" });
    }

    // ID 조건 (영소문자 + 숫자로만 구성하기)   
    if (!accountNameRegex.test(accountName)) { // 아이디 영어 소문자 구별
        return res.status(400).json({ message: "accountName을 확인해 주세요" });
    }

    try {
    // 사용자 조회
    const user = await prisma.user.findUnique({
        where: {
            accountName,
        },
    });

    // 사용자가 존재하고 비밀번호가 일치하는 경우
    if (user && user.password === password) {
        const token = jwt.sign({ accountName: user.accountName }, jwtSecret);
        res.header('Authorization', `Bearer ${token}`).status(200).json({ 
            message: `${accountName}님 환영합니다`, 
            cash: user.cash, 
            createdAt: new Date(), 
            token 
        });
    } else {
        res.status(401).json({ message: 'accountName 또는 password를 확인해 주세요' });
    }
    } catch (error) {
        console.error('로그인 중 오류 발생:', error);
        res.status(500).json({ message: '서버 오류' });
    }
});


export default router;

