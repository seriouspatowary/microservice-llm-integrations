import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorizePermissions } from "../middleware/authorize.js";
import { createExpense, getExpense } from "../controllers/expense.controller.js";
import { createIncome } from "../controllers/income.controller.js";


const router = Router();

router.post(
  "/",
  authenticate,
  authorizePermissions("expenses:create"),
  createExpense
);

router.get(
  "/",
  authenticate,
  authorizePermissions("expenses:read"),
  getExpense
);


router.post(
  "/income",
  authenticate,
  authorizePermissions("income:add"),
  createIncome
);




export default router;