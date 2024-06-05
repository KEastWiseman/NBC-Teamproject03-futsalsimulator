import express from 'express';
import userAuth from '../src/middleware/auths/user.authenticator.js';
import { prisma } from '../util/prisma/index.js'

const router = express.Router();

router.patch('/users/cash', userAuth, async(req,res,next)=>{
    try{
        const { deposit } = req.body;
        const user = req.user;
        const updatedUser = await prisma.user.update({
            where : { id: +user.id },
            data :{
                cash:{
                    increment : +deposit,
                },
            },
        });

        return res.status(200).json({message:'캐쉬 충전되었습니다', data:updatedUser})
    } catch (err){
        console.error('캐쉬 충전 중 에러 발생:', err);
        res.status(500).json({ message: '서버 오류' });
    }
})

export default router;
