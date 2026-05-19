import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import gameRouter from "./game.js";
import leaderboardRouter from "./leaderboard.js";
import userRouter from "./user.js";

const router: IRouter = Router();
router.use(healthRouter);
router.use(authRouter);
router.use(gameRouter);
router.use(leaderboardRouter);
router.use(userRouter);
export default router;
