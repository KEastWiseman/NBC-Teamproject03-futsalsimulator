import express from "express";
import { prisma } from "../utils/prisma/index.js";

app.get('/users/toprankings', async (req, res) => {
    try {
        // Prisma를 사용하여 UserTopRankings 모델에서 데이터를 가져옵니다.
        const userRank = await prisma.userTopRankings.findMany();
        if (userRank.length === 0) {
            res.status(404).json({ error: '유저 정보를 불러올 수 없습니다.' });
        }

        // 순위, 유저 아이디, mmr 값을 포함한 객체 배열 생성
        const toprankings = userRank.map((user, index) => ({
            '순위': user.rank,
            '유저 아이디': user.userId,
            'mmr': user.mmr
        }));
        // userTopRankings.sort((a, b) => b.mmr - a.mmr);       # mmr 값으로 내림차순 정렬
        // const top50UserTopRankings = userTopRankings.slice(0, 50);       # 상위 50개의 항목만 추출
        // const toprankings = rankings.map(user => `유저 ${user.userId}의 순위는 ${user.rank}이며, mmr 값은 ${user.mmr}입니다.`);      
        if (toprankings.length === 0) {
            res.status(404).json({ error: '랭킹 데이터를 조회할 수 없습니다.' });
        }        
        res.json(toprankings);
    } catch (error) {
        console.error("Error fetching top rankings:", error);
        res.status(500).json({ error: "서버 오류" });
    }
});

export default router;