import { Router } from "express";
import { verifyServiceKey } from "../../../middleware/service-key.js";
import { categorizeExpenses } from "../controller/expense-ai.controller.js";


const router = Router();


router.post(
  "/categorize",
  verifyServiceKey,
  categorizeExpenses
);



export default router;