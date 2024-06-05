import express from 'express';


const router = express.Router();

router.patch('/users/cash', async(req,res,next)=>{
    try{
        const { deposit } = req.body;
        const updatedUser = await userPrisma.user.update({
            where : { userId: req.body.user.userId },
            data :{
                cash:{
                    increment : deposit,
                },
            },
        });

        return res.status(200).json({message:'캐쉬 충전되었습니다', data:updatedUser})
    } catch (err){
        console.error('캐쉬 충전 중 에러 발생:', error);
        res.status(500).json({ message: '서버 오류' });
    }
})

export default router;
