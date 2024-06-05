import express from "express";
import dotenv from "dotenv/config";

dotenv.config();

import CashRouter from "./routers/cash.router";
import GameRouter from "./routers/game.router.js";
import PlayerRouter from "./routers/playerGamble.js";


const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.use("/api", [CashRouter, GameRouter, PlayerRouter]);

app.use("/", async (req, res, next) => {
  res.send("futsal Online project from NBC 힘순조");
});

app.listen(PORT, () => {
  console.log("Server on port: ", PORT);
});
