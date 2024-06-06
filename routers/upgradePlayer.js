import express from "express";
import { prisma } from '../util/prisma/index.js';
import authMiddleware from "../src/middleware/auths/user.authenticator.js";

const router = express.Router();

// 1. 선수 강화 
// 1.1 강화하려는 선수의 이름 + 선수의 id를 body로 받는다.
// 1.2 만약 아무것도 입력하지 않는다면 User가 가지고 있는 player들을 모두 보여줘서 입력하도록 유도한다.
// 1.3 유효성 검사 - 선수 고르기
// 1.3.1 강화하려는 선수를 가지고 있지 않은 경우
// 1.3.2 강화하려는 선수가 동명다인이 있는 경우 보유하고 있는 모든 동명다인 선수의 정보를 보여주고 다시 입력하도록 유도
// 1.3.3 제물 선수를 가지고 있지 않은 경우
// 1.3.4 제물 선수가 동명다인이 있는 경우 보유하고 있는 모든 동명다인 선수의 정보를 보여주고 다시 입력하도록 유도
// 1.4 유효성 검사 - 제물 선수의 정보 오류
// 1.4.1 제물 선수의 level이 조건에 맞지 않는 경우
// 1.4.2 제물 선수의 수가 부족한 경우

router.patch ("/upgrade", authMiddleware, async(req, res, next) => {
    const {upgradePlayerName, upgradePlayerId, sacrificePlayerName, sacrificePlayerId} = req.body;                                                          //1.1                                                                              //1.1
    const user = req.user;

    if(!(upgradePlayerName && upgradePlayerId && sacrificePlayerName && sacrificePlayerId)) {                                                              //1.2
        const myPlayerList = await prisma.playerPool.findMany({where : {userId: user.id}})
        return res.status(400).json({
            message: `다음을 통해 강화하려는 선수와 재료로 쓰일 선수를 선택해주세요 
            data: ${JSON.stringify(myPlayerList)}
            level 1 단계 >>> 2단계 : 강화 확률= 100%    제물선수의 조건 : 1level 선수 1명
            level 2 단계 >>> 3단계 : 강화 확률= 50%     제물선수의 조건 : 2level 선수 2명
            level 3 단계 >>> 4단계 : 강화 확률= 25%     제물선수의 조건 : 3level 선수 3명
            `
        });
    };

    const findTargetPlayer = await prisma.playerPool.findFirst({where: {userId: user.id, playerName: upgradePlayerName}});
    if (!findTargetPlayer) {
        return res.status(400).json({message: "강화하려는 선수가 존재하지 않습니다."});
    };
    
    const chooseTargetPlayer = await checkSameName(findTargetPlayer.playerId);                                                                              //1.3.2
    if (chooseTargetPlayer.length>=2) {
        return res.status(400).json({message: `강화하려는 선수의 id를 다음 내용을 참고하여 추가로 해주세요`, data: chooseTargetPlayer});
    };

    const findSacrificialPlayer = await prisma.playerPool.findMany({where: {userId: user.id, playerName: sacrificePlayerName}});                                                                             //1.3.3
    if (!findSacrificialPlayer) {
        return res.status(400).json({message: "제물로 이용될 선수가 존재하지 않습니다."});
    };

    const chooseSacrificialPlayer = await checkSameName(findSacrificialPlayer.playerId);                                                                    //1.3.4
    if (chooseSacrificialPlayer.length>=2) {
        return res.status(400).json({message: `제물로 이용될 선수의 id를 다음 내용을 참고하여 추가로 해주세요`, data: chooseSacrificialPlayer});
    };
    
    const targetPlayer = await prisma.playerPool.findFirst({where: {playerId:chooseTargetPlayer.id}});
    const sacrificialPlayer = await prisma.playerPool.findFirst({where: {playerId: chooseSacrificialPlayer.id}});

    await checkLevel(targetPlayer, sacrificialPlayer);                                                                                                      //1.4.1
    await checkNumberofPerson(targetPlayer, sacrificialPlayer);                                                                                             //1.4.2

    let randomNumber = Math.random();
    if (randomNumber <= (1/targetPlayer.playerLevel)) {
        targetPlayer.playerLevel += 1;
        await prisma.playerPool.update({
            where: {playerId: targetPlayer.playerId},
            data: {playerLevel:targetPlayer.playerLevel}
        })

        sacrificialPlayer.count -=1;
        if (sacrificialPlayer.count <=0) {
            await prisma.playerPool.delete({where: {playerId: sacrificialPlayer.playerId}})
        } else {
            await prisma.playerPool.update({
                where: {playerId: sacrificialPlayer.playerId},
                data: {count: sacrificialPlayer.count}
            })
        }
        return res.status(200).json({message: `${targetPlayer.playerName}선수의 강화가 성공했습니다.`})
    } else {
        sacrificialPlayer.count -=1;
        if (sacrificialPlayer.count <=0) {
            await prisma.playerPool.delete({where: {playerId: sacrificialPlayer.playerId}})
        } else {
            await prisma.playerPool.update({
                where: {playerId: sacrificialPlayer.playerId},
                data: {count: sacrificialPlayer.count}
            })
        }
        return res.status(200).json({message: `${targetPlayer.playerName}선수의 강화가 실패했습니다.`})
    }
});



// 3. 선수 모두 찾기 함수 (동명다인)
const checkSameName = (player) => {
    const playerInfo = prisma.player.findMany({where: {id: player.id}});
    return playerInfo;
};
// 4. 유효성 검사 함수 1 - 제물 선수의 level이 알맞지 않은 경우
const checkLevel = (targetPlayer, sacrificialPlayer) => {
    for (let i=0; i < sacrificialPlayer.length; i++) {
        if ( targetPlayer.playerLevel !== (sacrificialPlayer[i].playerLevel+1) ) {
            return res.status(400).json({
                message: `${sacrificialPlayer[i].playerName}선수의 level이 알맞지 않습니다.
                level 1 단계 >>> 2단계 : 제물선수의 level : 1lebel
                level 2 단계 >>> 3단계 : 제물선수의 level : 2lebel
                level 3 단계 >>> 4단계 : 제물선수의 level : 3lebel
                `
            });
        }
    }
};
// 5. 유효성 검사 함수 2 - 등록한 제물 선수들의 수가 부족한 경우
const checkNumberofPerson = (targetPlayer, sacrificialPlayer) => {
    if ( (targetPlayer.playerLevel-1) > sacrificialPlayer.length) {
        return res.status(400).json({
            message: `제물로 사용되는 선수들의 수가 부족합니다.
            level 1 단계 >>> 2단계 : 제물선수의 수 : 1lebel 1 명
            level 2 단계 >>> 3단계 : 제물선수의 수 : 2lebel 2 명
            level 3 단계 >>> 4단계 : 제물선수의 수 : 3lebel 3 명
            `
        });
    }
};

export default router;