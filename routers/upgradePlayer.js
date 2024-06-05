import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/-----------";

const router = express.Router();

// 1. 선수 강화 
// 1.1 강화하려는 선수의 이름 + 선수의 id를 body로 받는다.
// 1.2 유효성 검사
// 1.2.1 강화하려는 선수를 가지고 있지 않은 경우
// 1.2.2 강화하려는 선수의 이름만 작성했는데 동명다인? 이 있는 경우
// 1.2.3 강화하려는 선수의 수가 부족한 경우

router.post ("/upgrade", authMiddleware, async(req, res, next) => {
    const {playrName, playerid} = req.body;                                                                                     //1.1
    const {user} = req.user;

    const findPlayer = await prisma.playerpool.findmany({where: {playrName}});
    if (!findPlayer) {                                                                                                          //1.2.1
        return res.status(400).json({message: "강화하려는 선수가 존재하지 않습니다."});
    };
    if (findPlayer.length>=2) {                                                                                                 //1.2.2
        return res.status(400).json({message: "강화하려는 선수의 id를 다음 내용을 참고하여 추가로 해주세요", data: findPlayer});
    };

    const Targetplayer = await prisma.playerpool.findfirst({where: {playerid}});
    if (Targetplayer.level ===1 && Targetplayer.count < 2) {                                                                    //1.2.3
        return res.status(400).json({message: "강화하려는 선수가 부족하여 강화할 수 없습니다."});
    } else if (Targetplayer.level ===2 && Targetplayer.count < 3) {
        return res.status(400).json({message: "강화하려는 선수가 부족하여 강화할 수 없습니다."});
    } else if (Targetplayer.level ===3 && Targetplayer.count < 4) {
        return res.status(400).json({message: "강화하려는 선수가 부족하여 강화할 수 없습니다."});
    } else if (Targetplayer.level ===4 && Targetplayer.count < 5) {
        return res.status(400).json({message: "강화하려는 선수가 부족하여 강화할 수 없습니다."});
    };

    const changedLevel = upgradePlayer(Targetplayer.name, Targetplayer.level)

    //-------------------------------------------------------------------------------------------------------
    if (changedLevel === Targetplayer.level) {
        
    }
    if (changedLevel > Targetplayer.level) {
        const findUpgradedPlayer = await prisma.player.findfirst({
            where: {
                name: Targetplayer.name,
                level: changedLevel
            },
            select: {
                id: true,
                name: true,
                level: true
            }
        });

        const getplayer = await prisma.playerpool.create({
            data: {
                id: findUpgradedPlayer.id,
                name: findUpgradedPlayer.name,
                count: count +1
            }
        })

        return res.status(200).json({message: "강화에 성공했습니다.", data: findUpgradedPlayer});
    };

    //-------------------------------------------------------------------------------------------------------
    
});

// 2. 선수 강화 함수
// 2.1 랜덤값 생성
// 2.2 확률적 선수 강화
// 1level 이면 확정 / 2level이면 1/2확률 / 3level이면 1/3확률/ 4level이면 1/4확률
// 2.3 playerLevel 출력
const upgradePlayer = (playerName, playerLevel) => {
    let randomNumber = Math.random();           //2.1
    if (randomNumber <= (1/playerLevel)) {      //2.2
        playerLevel = playerLevel+1;
    };
    return playerLevel;                         //2.3
};

export default router;