import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/-----------";

const router = express.Router();


// 1. 카드 팩 구매 및 사용
// 1.1. 원하는 카드팩 이름과 갯수를 body에 작성해서 가져오기
// 1.2. 유효성 검증
// 1.2.1 계정이 없는 경우
// 1.2.2 카드팩이름을 잘못 입력한 경우
// 1.2.3 총 필요한 가격
// # 패키지 가격은 100으로 동결
// 1.2.4 캐시가 부족한 경우
// 1.3. playerPool에 저장하기
// 1.4. 캐시에서 해당 금액 뺴고 저장하기
router.post('/DrawCard', authMiddleware, async(req,res,next) => {
    const {id} = req.user.id
    const {purchasePlayer} = req.body;                                                                      //1.1
    
    try {
        const user = await prisma.user.findfirst({where: {id}});                                            //1.2.1
        if(!user) {
            return res.status(400).json({message: "계정의 정보가 유효하지 않습니다. 다시 로그인해주세요"});
        };

        const findPlayer = await prisma.Player.findMany({
            where: {purchasePlayer},
            data: {
                id,
                name
            }
        });
        if (!findPlayer) {
            return res.status(400).json({message: "구입하려는 카드팩이 존재하지 않습니다. 카드팩의 이름은 국가명이므로 정확히 작성해주세요"});
        };

        if (user.cash < 100) {                                                                        //1.2.4
            return res.status(400).json({message: " 보유하고 있는 금액이 부족합니다."});
        };

        const getPlayer = getRandom(findPlayer);

        const savePlayerId = await prisma.PlayerPool.create({
            data: {
                playerid: getPlayer.id,
                playername: getPlayer.name
            }
        });

        await prisma.user.update({                                                                      //1.4
            where:{ id},
            data: { cash: { decrement: totalCost}}
        });
        
        const updateUserData = await prisma.user.findUnique({
            where: {id},
            select: {cash: true}
        });

        return res.status(200).json({message: `${getPlayer.name}선수가 뽑혔습니다.`, data: savePlayerId, cash: updateUserData.cash});
    } catch(error) {
        console.error("패키지 구매 중 에러가 발생했습니다. :", error);
        return res.status(500).json({message: "패키지 구매 중 에러가 발생했습니다."});
    };
});

// 2.선수 뽑기 시스템
// 2.1. 1부터 선수의 총 인원까지의 수 중에 랜덤으로 결정 
// 2.2. 랜덤값에 해당하는 선수 뽑기
const getRandom = (packageName) => {
    let pick = [];

    const randomNumber = Math.floor((Math.random()*(packageName.length))+1);      //2.1

    for (let k=0; k<packageName.length; k++){                                      //2.2
        if (randomNumber===packageName[k]) {
            pick+= packageName[k].name;
        };
    };

    return pick;
};

export default router;