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

        return res.status(200).json({message:'입금 완료되었습니다', data:updatedUser})
    } catch (err){
        next(err);
    }
})

export default router;
