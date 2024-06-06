import express from "express";
import { prisma } from "../util/prisma/index.js";
import authMiddleware from "../src/middleware/auths/user.authenticator.js";

const router = express.Router();
//스탯 계수 설정
const LEVEL_VALUE = 3;
const SPEED_VALUE = 0.03;
const PASSING_VALUE = 0.04;
const DRIBBLING_VALUE = 0.03;
const HEADING_VALUE = 0.03;
const SHOOTING_VALUE = 0.04;
const TACKLING_VALUE = 0.03;
const MARKING_VALUE = 0.04;
const STRENGTH_VALUE = 0.03;

async function calculateScoreAndUpdateInjury(squard, isHome) {
  let score = {
    power: 0,
    shootCount: 0,
    deffence: 0,
  };

  for (let i = 0; i < squard.length; i++) {
    score.shootCount +=
      Math.floor(
        squard[i].speed * SPEED_VALUE +
          squard[i].passing * PASSING_VALUE +
          squard[i].dribbling * DRIBBLING_VALUE
      ) +
      (squard[i].playerLevel - 1) * LEVEL_VALUE;

    score.power +=
      squard[i].heading * HEADING_VALUE +
      squard[i].shooting * SHOOTING_VALUE +
      squard[i].dribbling * DRIBBLING_VALUE +
      (squard[i].playerLevel - 1) * LEVEL_VALUE;

    score.deffence +=
      squard[i].tackling * TACKLING_VALUE +
      squard[i].marking * MARKING_VALUE +
      squard[i].strength * STRENGTH_VALUE +
      (squard[i].playerLevel - 1) * LEVEL_VALUE;

    if (!isHome) {
      continue;
    }

    const isSidelined = Math.random() >= 0.9;
    const updatedData = {
      stamina: squard[i].stamina - 10,
    };

    if (isSidelined) {
      updatedData.sidelined = true;
    }

    await prisma.playerPool.update({
      where: {
        id: squard[i].playerPoolId,
      },
      data: updatedData,
    });
  }

  // 길이만큼 나누기
  score.shootCount = Math.floor(score.shootCount / squard.length);

  return score;
}

function calculateGoals(score, opponentDefence) {
  let goals = 0;

  for (let i = 0; i < score.shootCount; i++) {
    // 슈팅 시도
    let attack = Math.random() * (score.power - opponentDefence + 100);
    goals += attack > 50 ? 1 : 0;
  }

  return goals;
}

async function MatchGame(homeSquard, awaySquard) {
  const homeScore = await calculateScoreAndUpdateInjury(homeSquard, true);
  const awayScore = await calculateScoreAndUpdateInjury(awaySquard, false);

  const homeGoal = calculateGoals(homeScore, awayScore.deffence);
  const awayGoal = calculateGoals(awayScore, homeScore.deffence);

  return { homeGoal: homeGoal, awayGoal: awayGoal };
}

async function getPlayerStatsFromSquards(squards) {
  const players = [];

  for (const squard of squards) {
    const playerPool = await prisma.playerPool.findUnique({
      where: {
        id: squard.playerPoolId,
      },
      include: {
        playerIndex: true,
      },
    });

    if (playerPool) {
      players.push({
        speed: playerPool.playerIndex.speed,
        passing: playerPool.playerIndex.passing,
        dribbling: playerPool.playerIndex.dribbling,
        heading: playerPool.playerIndex.heading,
        shooting: playerPool.playerIndex.shooting,
        tackling: playerPool.playerIndex.tackling,
        marking: playerPool.playerIndex.marking,
        strength: playerPool.playerIndex.strength,
        playerLevel: playerPool.playerLevel,
        sidelined: playerPool.sidelined,
        stamina: playerPool.stamina,
      });
    }
  }

  return players;
}

async function updateMmr(userId, value) {
  // 1. 현재 userId에 해당하는 사용자의 mmr 값을 가져오기
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      mmr: true,
    },
  });

  const newMmr = user.mmr + value;

  // 2. mmr 값을 변경하고 업데이트하기
  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      mmr: newMmr,
    },
  });
}

async function findUserWithinMMRRanges(userId) {
  const selectedUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    include: {
      squard: true,
    },
  });

  const selectedMMR = selectedUser.mmr;

  const range = 50;
  let minMMR = selectedMMR - range;
  let maxMMR = selectedMMR + range;

  let foundUser = null;

  while (!foundUser && maxMMR <= 1050) {
    foundUser = await prisma.user.findFirst({
      where: {
        mmr: {
          gte: minMMR, // Greater Than or Equal 줄임말. Prisma 쿼리
          lte: maxMMR, // Less Than or Equal 줄임말. Prisma 쿼리
        },
      },
    });

    if (!foundUser || foundUser.id === userId) {
      minMMR -= range;
      maxMMR += range;
      foundUser = null;
    }
  }

  return foundUser;
}

async function resetPlayerPoolData(userId, homeSquards) {
  // PlayerPool 테이블에서 userId에 해당하는 모든 playerPoolId 가져오기
  const userPlayerPoolIds = await prisma.playerPool.findMany({
    where: {
      userId: +userId,
    },
    select: {
      id: true,
    },
  });

  // Squard의 playerPoolId 가져오기
  const squardPlayerPoolIds = homeSquards.map((squard) => squard.playerPoolId);

  // Squard의 playerPoolId를 제외한 다른 playerPoolId 초기화
  const playerPoolIdsToReset = userPlayerPoolIds.filter(
    (playerPool) => !squardPlayerPoolIds.includes(playerPool.id)
  );

  if (playerPoolIdsToReset.length > 0) {
    // PlayerPoolId에 해당하는 값 초기화
    await prisma.playerPool.updateMany({
      where: {
        id: {
          in: playerPoolIdsToReset.map((pool) => pool.id),
        },
      },
      data: {
        stamina: 100,
        sidelined: false,
      },
    });
  }
}

router.post("/games/play", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;

    // 1. Squard 테이블에서 userId에 맞는 정보 찾기
    const homeSquards = await prisma.squard.findMany({
      where: {
        userId: +userId,
      },
    });

    if (!homeSquards || homeSquards.length <= 2) {
      return res
        .status(404)
        .json({ message: "사용자의 스쿼드가 올바르지 않습니다" });
    }

    // 2. PlayerPool 테이블에서 playerPoolId에 맞는 정보 찾기
    const homePlayers = await getPlayerStatsFromSquards(homeSquards);

    if (homePlayers.length === 0) {
      return res
        .status(404)
        .json({ message: "PlayerPool을 찾을 수 없습니다." });
    }

    for (let i = 0; i < homePlayers.length; i++) {
      if (homePlayers[i].stamina <= 0 || homePlayers[i].sidelined) {
        return res
          .status(400)
          .json({ message: "스쿼드에 경기를 뛸 수 없는 선수가 있습니다" });
      }
    }

    const foundUser = await findUserWithinMMRRanges(userId);

    if (!foundUser) {
      return res.status(400).json({ message: "매칭 상대를 찾을 수 없습니다." });
    }
    const awayUserId = foundUser.id;

    // 선택된 유저의 모든 스쿼드 조회
    const awaySquards = await prisma.squard.findMany({
      where: {
        userId: awayUserId,
      },
    });

    // 선택된 유저의 모든 PlayerPool 정보 가져오기
    const awayPlayers = await getPlayerStatsFromSquards(awaySquards);

    if (awayPlayers.length === 0) {
      return res
        .status(404)
        .json({ message: "Away PlayerPool을 찾을 수 없습니다." });
    }

    // homePlayer stamina 감소
    const result = await MatchGame(homePlayers, awayPlayers);

    //내가 가진 다른 선수들의 stamina 초기화
    resetPlayerPoolData(userId, homeSquards);

    // Match 테이블에 결과 입력
    const matchResult = await prisma.matching.create({
      data: {
        userHomeId: userId, // 홈 팀 유저 ID
        userAwayId: awayUserId, // 어웨이 팀 유저 ID
        result: `${result.homeGoal} : ${result.awayGoal}`, // 결과 문자열 생성
      },
    });

    const responseMessage = "";
    // 경기 결과에 따라 응답 반환
    if (result.homeGoal > result.awayGoal) {
      responseMessage = `${result.homeGoal} : ${result.awayGoal}로 승리!`;

      updateMmr(userId, 10);
      updateMmr(awayUserId, -10);
    } else if (result.homeGoal === result.awayGoal) {
      responseMessage = `${result.homeGoal} : ${result.awayGoal}로 무승부!`;
    } else {
      responseMessage = `${result.homeGoal} : ${result.awayGoal}로 패배!`;

      updateMmr(userId, -10);
      updateMmr(awayUserId, 10);
    }

    return res.status(201).json({
      message: responseMessage,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
