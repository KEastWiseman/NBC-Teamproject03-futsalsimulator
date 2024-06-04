import express from "express";
import { prisma } from "../util/prisma/index.js";

const router = express.Router();

function MatchGame(homeSquard, awaySquard) {
  let homeShootCount = Math.floor(
    homeSquard.mid.speed * 0.03 +
      homeSquard.mid.passing * 0.04 +
      homeSquard.mid.dribbling * 0.03
  );

  let homePower =
    homeSquard.str.heading * 0.03 +
    homeSquard.str.shooting * 0.04 +
    homeSquard.str.dribbling * 0.03;

  let homeDeffence =
    homeSquard.def.tackling * 0.03 +
    homeSquard.def.marking * 0.04 +
    homeSquard.def.strength * 0.03;

  let awayShootCount =
    awaySquard.mid.speed * 0.03 +
    awaySquard.mid.passing * 0.04 +
    awaySquard.mid.dribbling * 0.03;

  let awayPower =
    awaySquard.str.heading * 0.03 +
    awaySquard.str.shooting * 0.04 +
    awaySquard.str.dribbling * 0.03;

  let awayDeffence =
    awaySquard.def.tackling * 0.03 +
    awaySquard.def.marking * 0.04 +
    awaySquard.def.strength * 0.03;

  let homeScore = {
    power: homePower,
    shootCount: homeShootCount,
    deffence: homeDeffence,
  };

  let awayScore = {
    power: awayPower,
    shootCount: awayShootCount,
    deffence: awayDeffence,
  };

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
    // // 헤더에서 accessToken 추출
    // const token = req.headers.authorization.split(' ')[1];

    // // 토큰 검증 및 해석 (비밀키는 환경 변수로 관리)
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // // 토큰에서 유저 ID 추출
    // const userId = decoded.id;
    const userId = 0;

    const homeSquard = await prisma.squard.findFirst({
      where: {
        userId: userId,
      },
    });

    if (!homeSquard) {
      return res.status(404).json({ message: "User를 찾을 수 없습니다" });
    }

    // homeSquard를 제외한 나머지 Squard를 조회
    const allSquardsExceptHome = await prisma.squard.findMany({
      where: {
        NOT: {
          id: homeSquard.id,
        },
      },
    });

    // 나머지 Squard 중 무작위로 하나 선택
    const randomSquardIndex = Math.floor(
      Math.random() * allSquardsExceptHome.length
    );
    const awaySquard = allSquardsExceptHome[randomSquardIndex];

    const result = MatchGame(homeSquard, awaySquard);

    // Match 테이블에 결과 입력
    const matchResult = await prisma.matching.create({
      data: {
        userHomeId: homeSquard.userId, // 홈 팀 유저 ID
        userAwayId: awaySquard.userId, // 어웨이 팀 유저 ID
        result: `${result.homeGoal} : ${result.awayGoal}`, // 결과 문자열 생성
      },
    });

    //경기 결과
    if (result.homeGoal > result.awayGoal) {
      return res
        .status(201)
        .json({ message: `${matchResult.result}로 승리!` });
    } else if (homeGoal === awayGoal) {
      return res
        .status(201)
        .json({ message: `${matchResult.result}로 무승부!` });
    } else {
      return res
        .status(201)
        .json({ message: `${matchResult.result}로 패배!` });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
