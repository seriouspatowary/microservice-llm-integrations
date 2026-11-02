import type { Request, Response } from "express";
import { z } from "zod";
import { createExpenseService, getExpensesByUserId } from "../services/expense.services.js";

const createExpenseSchema = z.object({
  title: z.string().trim().min(1).max(150),
  amount: z.number().finite().positive(),
  category: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  expenseDate: z.iso.date().optional(),
});

export async function createExpense(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const result = createExpenseSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid expense data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const expense = await createExpenseService({
      ...result.data,
      userId: req.auth.sub,
    });

    res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    console.error("Create expense error:", error);

    res.status(500).json({
      message: "Failed to create expense",
    });
  }
}


export async function getExpense(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {

    const expenses = await getExpensesByUserId(req.auth.sub);

    res.status(200).json({
      message: "Expenses fetched successfully",
      expenses,
    });
    
  } catch (error) {

    console.error("Get expenses error:", error);

    res.status(500).json({
      message: "Failed to fetch expenses",
    });
    
  }


}