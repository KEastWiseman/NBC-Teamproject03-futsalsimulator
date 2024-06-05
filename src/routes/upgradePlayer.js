import express from "express";
import { prisma } from "../utils/prisma/index.js";
import authMiddleware from "../middlewares/-----------";

const router = express.Router();

// 1. 선수 강화 
router.post ("/upgrade", authMiddleware, async(req, res, next) => {
    const {playrName, playerid} = req.body;
    const {user} = req.user;

    const findPlayer = await prisma.playerpool.finsfirst({where: {playrName}})

});


export default router;