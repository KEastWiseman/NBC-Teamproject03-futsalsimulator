import express from 'express';
import { prisma } from '../util/prisma/index.js';

const router = express.Router();

// 선수 정보 로드
router.get('/players', async (req, res) => {
  try {
    const players = await prisma.player.findMany();
    res.json(players);
  } catch (error) {
    console.error('선수 정보를 불러오는 중 오류 발생:', error);
    res.status(500).json({ error: '선수 정보를 불러오는 중 오류 발생' });
  }
});

// 스쿼드 생성
router.post('/', async (req, res) => {
  console.log("스쿼드 생성 요청 수신:", req.body);
  const { userId, playerIds } = req.body;
  try {
    const squardId = await createSquard(userId, playerIds);
    res.json({ squardId });
  } catch (error) {
    console.error("스쿼드 생성 중 오류 발생:", error);
    res.status(500).json({ error: '스쿼드 생성 중 오류 발생' });
  }
});

// 스쿼드 조회
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const squard = await getSquard(parseInt(userId));
    if (squard) {
      res.json(squard);
    } else {
      res.status(404).json({ error: '스쿼드를 찾을 수 없음' });
    }
  } catch (error) {
    console.error("스쿼드 조회 중 오류 발생:", error);
    res.status(500).json({ error: '스쿼드 조회 중 오류 발생' });
  }
});

// 스쿼드 수정
router.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { newPlayerIds, removePlayerIds } = req.body;
  try {
    const squard = await updateSquard(parseInt(userId), newPlayerIds, removePlayerIds);
    res.json(squard);
  } catch (error) {
    console.error("스쿼드 수정 중 오류 발생:", error);
    res.status(500).json({ error: '스쿼드 수정 중 오류 발생' });
  }
});

// 스쿼드 삭제
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    await deleteSquard(parseInt(userId));
    res.json({ message: '스쿼드 삭제 완료' });
  } catch (error) {
    console.error("스쿼드 삭제 중 오류 발생:", error);
    res.status(500).json({ error: '스쿼드 삭제 중 오류 발생' });
  }
});

async function createSquard(userId, playerIds) {
  console.log("스쿼드 생성 중 userId:", userId, "및 playerIds:", playerIds);
  const playerPools = [];
  try {
    // 기존 스쿼드가 있는지 확인하고 삭제
    const existingSquard = await prisma.squard.findUnique({
      where: { userId: userId }
    });

    if (existingSquard) {
      await prisma.squard.delete({
        where: { userId: userId }
      });
    }

    for (const playerId of playerIds) {
      console.log("플레이어 풀 생성 중 playerId:", playerId);
      const playerPool = await prisma.playerPool.create({
        data: {
          userId: userId,
          playerId: playerId,
        }
      });
      playerPools.push(playerPool);
    }

    console.log("데이터베이스에 스쿼드 레코드 생성 중");
    const squard = await prisma.squard.create({
      data: {
        userId: userId,
        playerPoolId: playerPools[0].id
      }
    });

    console.log("새 스쿼드 ID로 사용자 레코드 업데이트 중");
    await prisma.user.update({
      where: { id: userId },
      data: {
        squard: {
          connect: { id: squard.id }
        }
      }
    });

    return squard.id;
  } catch (error) {
    console.error("createSquard 함수 오류 발생:", error);
    throw error;
  }
}

async function getSquard(userId) {
  console.log("스쿼드 조회 중 userId:", userId);
  try {
    const squard = await prisma.squard.findUnique({
      where: { userId: userId },
      include: {
        playerPool: {
          include: { playerIndex: true }
        }
      }
    });

    console.log("조회된 스쿼드:", JSON.stringify(squard, null, 2));

    if (squard && !Array.isArray(squard.playerPool)) {
      squard.playerPool = [squard.playerPool];
    }

    const players = await prisma.player.findMany({
      where: {
        id: {
          in: squard.playerPool.map(pool => pool.playerId)
        }
      }
    });

    return {
      ...squard,
      players: players
    };
  } catch (error) {
    console.error("getSquard 함수 오류 발생:", error);
    throw error;
  }
}

async function updateSquard(userId, newPlayerIds = [], removePlayerIds = []) {
  console.log("스쿼드 수정 중 userId:", userId, "with newPlayerIds:", newPlayerIds, "및 removePlayerIds:", removePlayerIds);
  try {
    const squard = await prisma.squard.findUnique({
      where: { userId: userId },
      include: { playerPool: true }
    });

    console.log("수정을 위한 조회된 스쿼드:", JSON.stringify(squard, null, 2));

    if (!squard) {
      throw new Error("스쿼드가 존재하지 않습니다.");
    }

    if (!Array.isArray(squard.playerPool)) {
      squard.playerPool = [squard.playerPool];
    }

    // 기존 플레이어 풀에서 삭제할 플레이어를 제외한 ID 목록
    const updatedPlayerPoolIds = squard.playerPool
      .filter(pool => !removePlayerIds.includes(pool.playerId))
      .map(pool => pool.id);

    // 새로운 플레이어 풀 추가
    for (const playerId of newPlayerIds) {
      const playerPool = await prisma.playerPool.create({
        data: {
          userId: userId,
          playerId: playerId,
        }
      });
      updatedPlayerPoolIds.push(playerPool.id);
    }

    // 스쿼드 업데이트
    const updatedSquard = await prisma.squard.update({
      where: { userId: userId },
      data: {
        playerPoolId: updatedPlayerPoolIds[0] // 하나의 ID로 대표
      }
    });

    // 업데이트된 스쿼드 객체 다시 조회
    const fullUpdatedSquard = await prisma.squard.findUnique({
      where: { userId: userId },
      include: {
        playerPool: {
          include: { playerIndex: true }
        }
      }
    });

    return fullUpdatedSquard;
  } catch (error) {
    console.error("updateSquard 함수 오류 발생:", error);
    throw error;
  }
}

async function deleteSquard(userId) {
  console.log("스쿼드 삭제 중 userId:", userId);
  try {
    // 스쿼드 삭제
    await prisma.squard.deleteMany({
      where: { userId: userId }
    });

    // 사용자 레코드 업데이트
    await prisma.user.update({
      where: { id: userId },
      data: { squard: { disconnect: true } }
    });

    console.log("스쿼드 삭제 완료");
  } catch (error) {
    console.error("deleteSquard 함수 오류 발생:", error);
    throw error;
  }
}

export default router;
