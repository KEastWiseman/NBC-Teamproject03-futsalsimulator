import express from "express";
import { prisma } from "../util/prisma/index.js";

const router = express.Router();

function MatchGame(homeSquard, awaySquard) {
  let homeScore = {
    power: 0,
    shootCount: 0,
    deffence: 0,
  };

  let awayScore = {
    power: 0,
    shootCount: 0,
    deffence: 0,
  };

  for (let i = 0; i < homeSquard.length; i++) {
    homeScore.shootCount += Math.floor(
      homeSquard[i].speed * 0.03 +
        homeSquard[i].passing * 0.04 +
        homeSquard[i].dribbling * 0.03
    );

    homeScore.power +=
      homeSquard[i].heading * 0.03 +
      homeSquard[i].shooting * 0.04 +
      homeSquard[i].dribbling * 0.03;

    homeScore.deffence +=
      homeSquard[i].tackling * 0.03 +
      homeSquard[i].marking * 0.04 +
      homeSquard[i].strength * 0.03;
  }

  for (let i = 0; i < awaySquard.length; i++) {
    awayScore.shootCount += Math.floor(
      awaySquard[i].speed * 0.03 +
        awaySquard[i].passing * 0.04 +
        awaySquard[i].dribbling * 0.03
    );

    awayScore.power +=
      awaySquard[i].heading * 0.03 +
      awaySquard[i].shooting * 0.04 +
      awaySquard[i].dribbling * 0.03;

    awayScore.deffence +=
      awaySquard[i].tackling * 0.03 +
      awaySquard[i].marking * 0.04 +
      awaySquard[i].strength * 0.03;
  }

  // 길이만큼 나누기
  homeScore.shootCount = Math.floor(homeScore.shootCount / homeSquard.length);
  awayScore.shootCount = Math.floor(awayScore.shootCount / awaySquard.length);

  // home팀 공격
  let homeGoal = 0;

  for (let i = 0; i < homeScore.shootCount; i++) {
    //슈팅 시도
    let homeAttack =
      Math.random() * (homeScore.power - awayScore.deffence + 100);
    homeGoal += homeAttack > 50 ? 1 : 0;
  }

  // away팀 공격
  let awayGoal = 0;

  for (let i = 0; i < awayScore.shootCount; i++) {
    //슈팅 시도
    let awayAttack =
      Math.random() * (awayScore.power - homeScore.deffence + 100);
    awayGoal += awayAttack > 50 ? 1 : 0;
  }
  return { homeGoal: homeGoal, awayGoal: awayGoal };
}

router.post("/games/play", async (req, res, next) => {
  try {
    const userId = 2;

    // 1. Squard 테이블에서 userId에 맞는 정보 찾기
    const homeSquard = await prisma.squard.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!homeSquard) {
      return res.status(404).json({ message: "User를 찾을 수 없습니다" });
    }

    // 2. 해당 Squard의 playerPoolId를 사용하여 PlayerPool 테이블에서 정보 찾기
    const playerPoolId = homeSquard.playerPoolId;

    // 3. PlayerPool 테이블에서 playerPoolId에 맞는 정보 찾기
    const playerPool = await prisma.playerPool.findFirst({
      where: {
        id: playerPoolId,
      },
    });

    if (!playerPool) {
      return res
        .status(404)
        .json({ message: "PlayerPool을 찾을 수 없습니다." });
    }

    // 4. PlayerPool 테이블에서 userId에 맞는 모든 Player의 스탯 가져오기
    const userPlayerPools = await prisma.playerPool.findMany({
      where: {
        userId: playerPool.userId,
      },
      include: {
        playerIndex: true,
      },
    });

    // Player들의 스탯 정보 가져오기
    const homePlayers = userPlayerPools.map((pool) => ({
      speed: pool.playerIndex.speed,
      passing: pool.playerIndex.passing,
      dribbling: pool.playerIndex.dribbling,
      heading: pool.playerIndex.heading,
      shooting: pool.playerIndex.shooting,
      tackling: pool.playerIndex.tackling,
      marking: pool.playerIndex.marking,
      strength: pool.playerIndex.strength,
    }));

    //console.log(homePlayers);

    // 홈 Squard를 제외한 나머지 Squard를 조회
    const allSquardsExceptHome = await prisma.squard.findMany({
      where: {
        NOT: {
          id: homeSquard.id,
        },
      },
      include: {
        playerPool: {
          include: {
            playerIndex: true,
          },
        },
      },
    });

    if (allSquardsExceptHome.length === 0) {
      return res
        .status(404)
        .json({ message: "다른 Squard를 찾을 수 없습니다" });
    }

    // 나머지 Squard 중 무작위로 하나 선택
    const randomSquardIndex = Math.floor(
      Math.random() * allSquardsExceptHome.length
    );
    const awaySquard = allSquardsExceptHome[randomSquardIndex];

    const awayPlayerPoolId = awaySquard.playerPoolId;

    const awayPlayerPool = await prisma.playerPool.findFirst({
      where: {
        id: awayPlayerPoolId,
      },
    });

    if (!awayPlayerPool) {
      return res
        .status(404)
        .json({ message: "Away PlayerPool을 찾을 수 없습니다." });
    }

    const awayUserPlayerPools = await prisma.playerPool.findMany({
      where: {
        userId: awayPlayerPool.userId,
      },
      include: {
        playerIndex: true,
      },
    });

    const awayPlayers = awayUserPlayerPools.map((pool) => ({
      speed: pool.playerIndex.speed,
      passing: pool.playerIndex.passing,
      dribbling: pool.playerIndex.dribbling,
      heading: pool.playerIndex.heading,
      shooting: pool.playerIndex.shooting,
      tackling: pool.playerIndex.tackling,
      marking: pool.playerIndex.marking,
      strength: pool.playerIndex.strength,
    }));

    //console.log(awayPlayers);

    const result = MatchGame(homePlayers, awayPlayers);

    // Match 테이블에 결과 입력
    const matchResult = await prisma.matching.create({
      data: {
        userHomeId: homeSquard.userId, // 홈 팀 유저 ID
        userAwayId: awaySquard.userId, // 어웨이 팀 유저 ID
        result: `${result.homeGoal} : ${result.awayGoal}`, // 결과 문자열 생성
      },
    });

    // 경기 결과에 따라 응답 반환
    if (result.homeGoal > result.awayGoal) {
      return res.status(201).json({
        message: `${result.homeGoal} : ${result.awayGoal}로 승리!`,
      });
    } else if (result.homeGoal === result.awayGoal) {
      return res.status(201).json({
        message: `${result.homeGoal} : ${result.awayGoal}로 무승부!`,
      });
    } else {
      return res.status(201).json({
        message: `${result.homeGoal} : ${result.awayGoal}로 패배!`,
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
