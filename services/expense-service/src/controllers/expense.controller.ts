import type { Request, Response } from "express";
import { z } from "zod";
import { createExpenseService, getExpensesByUserId,updateExpenseService, deleteExpenseService } from "../services/expense.services.js";

const createExpenseSchema = z.object({
  title: z.string().trim().min(1).max(150),
  amount: z.number().finite().positive(),
  category: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  expenseDate: z.iso.date().optional(),
});

const updateExpenseSchema = z
  .object({
    title: z.string().trim().min(1).max(150).optional(),
    amount: z.number().finite().positive().optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field is required" }
  );

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





export async function updateExpense(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  // Validate and extract UUID
  const parsedId = z.uuid().safeParse(req.params.id);

  if (!parsedId.success) {
    res.status(400).json({
      message: "Invalid expense ID",
    });
    return;
  }

  const id = parsedId.data;

  const result = updateExpenseSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid expense data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const expense = await updateExpenseService({
      id,
      userId: req.auth.sub,
      ...result.data,
    });

    if (!expense) {
      res.status(404).json({
        message: "Expense not found",
      });
      return;
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    console.error("Update expense error:", error);

    res.status(500).json({
      message: "Failed to update expense",
    });
  }
}


export async function deleteExpense(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  // Validate and extract UUID
  const parsedId = z.uuid().safeParse(req.params.id);

  if (!parsedId.success) {
    res.status(400).json({
      message: "Invalid expense ID",
    });
    return;
  }

  const id = parsedId.data;
  try {
    const expense = await deleteExpenseService({
      id,
      userId: req.auth.sub,
    });

    if (!expense) {
      res.status(404).json({
        message: "Expense not found",
      });
      return;
    }

    res.status(200).json({
      message: "Expense Deleted successfully",
      expense,
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      message: "Failed to delete expense",
    });
  }
}