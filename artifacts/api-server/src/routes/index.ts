import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statsRouter from "./stats";
import leaderboardRouter from "./leaderboard";
import activityRouter from "./activity";
import marketRouter from "./market";
import burnsRouter from "./burns";
import guildsRouter from "./guilds";
import playersRouter from "./players";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/stats", statsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/activity", activityRouter);
router.use("/market", marketRouter);
router.use("/burns", burnsRouter);
router.use("/guilds", guildsRouter);
router.use("/players", playersRouter);

export default router;
