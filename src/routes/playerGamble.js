import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/-----------";

const router = express.Router();

// 카드 팩 구매 및 사용
// 1. 원하는 카드팩 이름과 갯수를 body에 작성해서 가져오기
// 2. 유효성 검증
// 2.1 계정이 없는 경우
// 2.2 카드팩이름을 잘못 입력한 경우
// 2.3 캐시가 부족한 경우
// 3. playerPool에 저장하기
// 4. 캐시에서 해당 금액 뺴고 저장하기
router.post('/DrawCard', authMiddleware, async(req,res,next) => {
    const {userId} = req.user.id
    const {purchasePlayer} = req.body;                                                                      //1
    
    try {
        const user = await prisma.user.findfirst({where: {userId}});                                        //2.1
        if(!user) {
            return res.status(400).json({message: "계정의 정보가 유효하지 않습니다. 다시 로그인해주세요"});
        };

        let totalCost = 0;
        for (const purchaseList of purchasePlayer) {
            const { packageName, count} = purchaseList;
            const PlayerPackage = await prisma.Player.findfirst({ where: packageName})                     //2.2
            if (!PlayerPackage){
                return res.status(400).json({message: "구입하려는 카드팩이 존재하지 않습니다."});
            };
            totalCost += PlayerPackage.price * count;
        };

        if (user.cash < totalCost) {                                                                        //2.3
            return res.status(400).json({message: " 보유하고 있는 금액이 부족합니다."});
        };

        await prisma.$transaction(async (prisma) => {                                                       //3
            for (const purchaseList of purchasePlayer) {
                const { packageName, count} = purchaseList;
                const pickedPlayer = getRandom(packageName, count);
                const getPlayer = await prisma.Player.findMany({ 
                    where: {
                        playername : {
                            in: pickedPlayer
                        }}
                });

                await prisma.playerPool.createMany({
                    data: getPlayer.id
                });
            };

            await prisma.user.update({                                                                      //4
                where:{ userId},
                data: { cash: { decrement: totalCost}}
            });
        });
        
        const updateUserData = await prisma.user.findUnique({
            where: {userId},
            select: {cash: true}
        });

        return res.status(200).json({message: `${getPlayer.playername}선수가 뽑혔습니다.`, data: getPlayer, cash: updateUserData.cash});
    } catch(error) {
        console.error("패키지 구매 중 에러가 발생했습니다. :", error);
        return res.status(500).json({message: "패키지 구매 중 에러가 발생했습니다."})
    };
});

// 가중치에 따른 선수 뽑기 시스템
// 1. 1 ~ 100 사이 값을 랜덤으로 결정
// 2. 패키지에 있는 선수들 이름으로 배열 만들기
// 3. 선수별 가중치을 배열에 작성하기
// ex) A선수 가중치 = 0.1, B선수 가중치 = 0.35, C선수 가중치 = 0.1, D선수 가중치 = 0.45 이면 [10, 45, 55, 100]
// 4. 랜덤값에 해당하는 선수 뽑기
const getRandom = (playerpackage, count) => {
    let pick = [];
    for (let j = 0; j< count-1; j++) {
        const randomNumber = Math.floor((Math.random()*99)+1);                          //1
        const playerNameTable = []; 
        const percentTable = []; 
        for (let i=0; i<playerpackage.length; i++){
            playerNameTable.push(playerpackage[i].playername);                          //2
            if (percentTable[i-1] === undefined) {                                      //3
                percentTable.push(playerpackage[i].weight*100);
            } else if(percentTable[i-1] !== undefined) {
                percentTable.push((playerpackage[i].weight*100) +  percentTable[i-1]);
            }
        };
        for (let k=0; k<percentTable.length; k++){                                      //4
            if (randomNumber<=percentTable[k]) {
                pick+= playerNameTable[k];
            };
        };
    };
    return pick;
}

export default router;