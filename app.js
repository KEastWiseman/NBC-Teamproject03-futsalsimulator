import express from "express";
import dotenv from "dotenv/config";
import UserRouter from './routers/user.router.js';
import CashRouter from "./routers/cash.router.js";
import GameRouter from "./routers/game.router.js";
import PlayerRouter from "./routers/playerGamble.js";
import SquardRouter from './routers/squard.router.js';
import UpgradeRouter from './routers/upgradePlayer.js';
import startRankBoardUpdater from './src/updateRanking.js';
import RankRouter from './routers/rank.router.js'

const app = express();
const PORT = process.env.PORT || 8081;
app.use(express.json());

startRankBoardUpdater();

app.use("/api", [
  UserRouter,
  CashRouter, 
  GameRouter,
  SquardRouter,
  UpgradeRouter,
  PlayerRouter,
  RankRouter]);


app.use("/", async (req, res, next) => {
  res.send("futsal Online project from NBC 힘순조");
});

app.listen(PORT, () => {
  console.log("Server on port: ", PORT);
});
