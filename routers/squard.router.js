import express from 'express';
import { prisma } from '../util/prisma/index.js';
import ua from '../src/middleware/auths/user.authenticator.js'

const router = express.Router();

// 스쿼드 생성
router.post('/users/squard', ua ,async (req, res) => {
  const userId = req.user.id;
  const { playerPoolId } = req.body;
  const {user}=req;
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

    // 스쿼드 생성 시 부상여부 확인, 데이터 칼럼 확인하고 수정필요
    if (existingPlayerPool.sidelined) {
      return res.status(400).json({ error : "부상중인 선수는 스쿼드에 포함시킬 수 없습니다."})
    }

    //스태니마 상태 확인, 데이터 컬럼 확인하고 수정필요
    if (existingPlayerPool.stamina <= 0) {
      return res.status(400).json({ error : "선수의 스태미나가 부족하여 스쿼드에 포함시킬 수 없습니다."})
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

    const squardPlayerCount = await prisma.squard.findMany({
      where : { userId: user.id},
    });

    if (squardPlayerCount.length >= 3) {
      return res.status(400).json({ error: "스쿼드는 2명의 선수까지만 구성이 가능합니다"});
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
router.put('/users/squard/:squardId', ua, async (req, res) => {
  const { squardId } = req.params;
  const { playerPoolId } = req.body;
  const { user } = req;

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

    // //스쿼드 수정 시 부상여부 확인, 데이터 칼럼 확인하고 수정필요
    if (existingPlayerPool.sidelined) {
      return res.status(400).json({ error : "부상중인 선수는 스쿼드에 포함시킬 수 없습니다."})
    }

    // //스태니마 상태 확인, 데이터 컬럼 확인하고 수정필요
    if (existingPlayerPool.stamina <= 0) {
      return res.status(400).json({ error : "선수의 스태미나가 부족하여 스쿼드에 포함시킬 수 없습니다."})
    }


    // 해당 스쿼드에 playerpool이 3명 이상일 경우 에러 출력

    const squardPlayerCount = await prisma.squard.findMany({
      where : { userId: user.id},
      include : {playerPool : true}
    });

    if (squardPlayerCount.length > 3) {
      return res.status(400).json({ error: "스쿼드는 2명의 선수까지만 구성이 가능합니다"});
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

// 스쿼드에서 선수(playerpool id) 제거
// router.put('/users/squard/remove/:squardId', async (req, res) => {
//   const { squardId } = req.params;
//   const { playerPoolId } = req.body;

//   if (!playerPoolId) {
//     return res.status(400).json({ error: 'playerPoolId가 필요합니다.' });
//   }

//   try {
//     // 특정 스쿼드에 제거하려는 playerPoolId가 있는지 확인
//     const squad = await prisma.squard.findUnique({
//       where: { id: parseInt(squardId) },
//       include: { playerPool: true }
//     });

//     const playerExists = squad.playerPool.some(player => player.id === playerPoolId);
//     if (!playerExists) {
//       return res.status(400).json({ error: '해당 선수는 squard 내에 존재하지 않습니다' });
//     }

//     // 스쿼드에서 playerPoolId 제거
//     const updatedSquard = await prisma.squard.update({
//       where: { id: parseInt(squardId) },
//       data: {
//         playerPool: {
//           disconnect: { id: playerPoolId }
//         }
//       }
//     });

//     res.json(updatedSquard);
//   } catch (error) {
//     console.error('스쿼드 수정 중 오류가 발생했습니다:', error);
//     res.status(500).json({ error: '스쿼드 수정 중 오류가 발생했습니다.'});
//   }
// });

// 스쿼드 삭제
router.delete('/users/squard/:squardId', async (req, res) => {
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
router.get('/users/squard/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const squard = await prisma.squard.findMany({
      where: { userId: +userId },
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
