import express from 'express';
import { prisma } from '../util/prisma/index.js'

const router = express.Router();

router.get('/rank', async(req,res,next)=>{
    try{
        const rank = await prisma.userTopRankings.findMany({
            orderBy:[
                {
                    rank : 'asc'
                }
            ]
        });

        return res.status(200).json({message:'랭킹이 조회되었습니다', data:rank})
    } catch (err){
        console.error('랭킹 조회 중 에러 발생:', err);
        res.status(500).json({ message: '서버 오류' });
    }
})

export default router;
