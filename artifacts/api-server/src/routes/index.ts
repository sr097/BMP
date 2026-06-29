import { Router, type IRouter } from "express";
import healthRouter from "./health";
import llmRouter from "./llm";

const router: IRouter = Router();

router.use(healthRouter);
router.use(llmRouter);

export default router;
