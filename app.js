import express from "express";
import dotenv from "dotenv/config";
import CashRouter from './routers/cash.router';
import PlayerGambleRouter from './routers/playerGamble.js'

dotenv.config();


const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.use("/api", [
    CashRouter, PlayerGambleRouter,

  ]);
  

app.use("/", async (req, res, next) => {
    res.send("futsal Online project from NBC 힘순조");
});

app.listen(PORT, () => {
    console.log("Server on port: ", PORT);
  });