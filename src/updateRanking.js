import {prisma} from '../util/prisma/index.js'

const updateRankBoard = async ()=>{
    try{
        const users = await prisma.user.findMany({
            orderBy:[
                {
                    mmr : 'desc'
                }
            ]
        });
        const newRanker = users.slice(0,50).map((ele,index)=>{
            return {
                userId : ele.id,
                rank : index+1,
                mmr : ele.mmr,
            }
        });
        await prisma.userTopRankings.deleteMany({});
        await prisma.userTopRankings.createMany({
            data:newRanker
        });
        console.log('리더보드 업데이트 완료');
    }
    catch (err){
        console.log('랭킹 보드 업데이트 에러 발생 :', err);
    }
}

const startRankBoardUpdater = ()=>{
    setInterval(updateRankBoard, 30000);
}

export default startRankBoardUpdater;