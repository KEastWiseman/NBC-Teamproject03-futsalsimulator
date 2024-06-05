import express from "express";
import { prisma } from "../util/prisma/index.js";
import authMiddleware from "../src/middleware/auths/user.authenticator.js";

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

router.post(
  "/games/play",
  authMiddleware, async (req, res, next) => {
    try {
      const userId = res.user.userId;
      // 1. Squard 테이블에서 userId에 맞는 정보 찾기
      const homeSquards = await prisma.squard.findMany({
        where: {
          userId: userId,
        },
      });

      if (!homeSquards || homeSquards.length === 0) {
        return res
          .status(404)
          .json({ message: "사용자의 스쿼드를 찾을 수 없습니다" });
      }

      // 2. PlayerPool 테이블에서 playerPoolId에 맞는 정보 찾기
      const homePlayers = [];
      for (const homeSquard of homeSquards) {
        const homePlayerPool = await prisma.playerPool.findUnique({
          where: {
            id: homeSquard.playerPoolId,
          },
          include: {
            playerIndex: true,
          },
        });

        if (homePlayerPool) {
          // Player들의 스탯 정보 가져오기
          homePlayers.push({
            speed: homePlayerPool.playerIndex.speed,
            passing: homePlayerPool.playerIndex.passing,
            dribbling: homePlayerPool.playerIndex.dribbling,
            heading: homePlayerPool.playerIndex.heading,
            shooting: homePlayerPool.playerIndex.shooting,
            tackling: homePlayerPool.playerIndex.tackling,
            marking: homePlayerPool.playerIndex.marking,
            strength: homePlayerPool.playerIndex.strength,
          });
        }
      }

      if (homePlayers.length === 0) {
        return res
          .status(404)
          .json({ message: "PlayerPool을 찾을 수 없습니다." });
      }

      // 홈 Squard를 제외한 나머지 Squard를 조회
      const allSquardsExceptHome = await prisma.squard.findMany({
        where: {
          NOT: {
            userId: userId,
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
      const awayUserId = allSquardsExceptHome[randomSquardIndex].userId;

      // 선택된 유저의 모든 스쿼드 조회
      const awaySquards = await prisma.squard.findMany({
        where: {
          userId: awayUserId,
        },
      });

      // 선택된 유저의 모든 PlayerPool 정보 가져오기
      const awayPlayers = [];
      for (const awaySquard of awaySquards) {
        const awayPlayerPool = await prisma.playerPool.findUnique({
          where: {
            id: awaySquard.playerPoolId,
          },
          include: {
            playerIndex: true,
          },
        });

        if (awayPlayerPool) {
          awayPlayers.push({
            speed: awayPlayerPool.playerIndex.speed,
            passing: awayPlayerPool.playerIndex.passing,
            dribbling: awayPlayerPool.playerIndex.dribbling,
            heading: awayPlayerPool.playerIndex.heading,
            shooting: awayPlayerPool.playerIndex.shooting,
            tackling: awayPlayerPool.playerIndex.tackling,
            marking: awayPlayerPool.playerIndex.marking,
            strength: awayPlayerPool.playerIndex.strength,
          });
        }
      }

      if (awayPlayers.length === 0) {
        return res
          .status(404)
          .json({ message: "Away PlayerPool을 찾을 수 없습니다." });
      }

      const result = MatchGame(homePlayers, awayPlayers);

      // Match 테이블에 결과 입력
      const matchResult = await prisma.matching.create({
        data: {
          userHomeId: userId, // 홈 팀 유저 ID
          userAwayId: awayUserId, // 어웨이 팀 유저 ID
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
  }
);

export default router;
