import { Router } from "express";

import { authenticate } from "../middleware/authenticate.js";
import { authorizePermissions } from "../middleware/authorize.js";
import { createExpense, getExpense, updateExpense, deleteExpense } from "../controllers/expense.controller.js";
import { createIncome, getIncome, updateIncome , deleteIncome} from "../controllers/income.controller.js";
import { getMonthlyExpenseReport } from "../controllers/expense-report.controller.js";


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


router.patch(
  "/:id",
  authenticate,
  authorizePermissions("expenses:update"),
  updateExpense
);


router.delete(
  "/:id",
  authenticate,
  authorizePermissions("expenses:delete"),
  deleteExpense
);

router.post(
  "/income",
  authenticate,
  authorizePermissions("income:add"),
  createIncome
);

router.get(
  "/income",
  authenticate,
  authorizePermissions("income:read"),
  getIncome,
);

router.patch(
  "/income/:id",
  authenticate,
  authorizePermissions("income:edit"),
  updateIncome,
);

router.delete(
  "/income/:id",
  authenticate,
  authorizePermissions("income:delete"),
  deleteIncome,
);

router.get(
  "/report",
  authenticate,
  authorizePermissions("expenses:read"),
  getMonthlyExpenseReport
);





export default router;