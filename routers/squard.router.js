import express from 'express';
import { prisma } from '../util/prisma/index.js';

const router = express.Router();

// 스쿼드 생성
router.post('/', async (req, res) => {
  console.log("스쿼드 생성 요청 수신:", req.body);
  const { userId, playerPoolId } = req.body;
  
  if (!playerPoolId) {
    return res.status(400).json({ error: 'playerPoolId가 필요합니다.' });
  }

  try {
    // 기존 playerPool이 존재하는지 확인합니다.
    const existingPlayerPool = await prisma.playerPool.findUnique({
      where: {
        id: playerPoolId
      }
    });

    if (!existingPlayerPool) {
      return res.status(400).json({ error: '유효하지 않은 playerPoolId입니다.' });
    }

    // 해당 playerPool이 이미 다른 Squard와 연결되어 있는지 확인합니다.
    const existingSquard = await prisma.squard.findUnique({
      where: {
        playerPoolId: playerPoolId
      }
    });

    if (existingSquard) {
      return res.status(400).json({ error: '이 playerPool은 이미 다른 Squard와 연결되어 있습니다.' });
    }

    // Squard를 생성합니다.
    const newSquard = await prisma.squard.create({
      data: {
        user: {
          connect: { id: userId }
        },
        playerPool: {
          connect: { id: playerPoolId }
        }
      }
    });

    // 사용자에게 생성된 squardId를 전달합니다.
    res.json({ squardId: newSquard.id });
  } catch (error) {
    console.error("스쿼드 생성 중 오류가 발생했습니다:", error);
    res.status(500).json({ error: '스쿼드 생성 중 오류가 발생했습니다.' });
  }
});

// 스쿼드 수정
router.put('/:squardId', async (req, res) => {
  const { squardId } = req.params;
  const { playerPoolId } = req.body;

  if (!playerPoolId) {
    return res.status(400).json({ error: 'playerPoolId가 필요합니다.' });
  }

  try {
    // 기존 playerPool이 존재하는지 확인합니다.
    const existingPlayerPool = await prisma.playerPool.findUnique({
      where: {
        id: playerPoolId
      }
    });

    if (!existingPlayerPool) {
      return res.status(400).json({ error: '유효하지 않은 playerPoolId입니다.' });
    }

    // 해당 playerPool이 이미 다른 Squard와 연결되어 있는지 확인합니다.
    const existingSquard = await prisma.squard.findUnique({
      where: {
        playerPoolId: playerPoolId
      }
    });

    if (existingSquard) {
      return res.status(400).json({ error: '이 playerPool은 이미 다른 Squard와 연결되어 있습니다.' });
    }

    // Squard를 업데이트합니다.
    const updatedSquard = await prisma.squard.update({
      where: { id: parseInt(squardId) },
      data: {
        playerPool: {
          connect: { id: playerPoolId }
        }
      },
    });

    res.json(updatedSquard);
  } catch (error) {
    console.error('스쿼드 수정 중 오류가 발생했습니다:', error);
    res.status(500).json({ error: '스쿼드 수정 중 오류가 발생했습니다.' });
  }
});

// 스쿼드 삭제
router.delete('/:squardId', async (req, res) => {
  const { squardId } = req.params;
  try {
    // Squard를 삭제합니다.
    await prisma.squard.delete({
      where: { id: parseInt(squardId) }
    });

    res.status(204).end();
  } catch (error) {
    console.error('스쿼드 삭제 중 오류가 발생했습니다:', error);
    res.status(500).json({ error: '스쿼드 삭제 중 오류가 발생했습니다.' });
  }
});

// 스쿼드 조회
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const squard = await prisma.squard.findFirst({
      where: { userId: parseInt(userId) },
      include: { playerPool: true },
    });
    if (squard) {
      res.json(squard);
    } else {
      res.status(404).json({ error: '스쿼드를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('스쿼드 조회 중 오류가 발생했습니다:', error);
    res.status(500).json({ error: '스쿼드 조회 중 오류가 발생했습니다.' });
  }
});

export default router;
