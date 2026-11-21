import type { Request, Response } from "express";
import { categorizeExpenseBatch } from "../services/expense-ai.service.js";

export const categorizeExpenses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { expenses } = req.body;

    if (
      !Array.isArray(expenses) ||
      expenses.length === 0 ||
      expenses.length > 500 ||
      !expenses.every(
        (expense) =>
          expense !== null &&
          typeof expense === "object" &&
          typeof expense.id === "string" &&
          expense.id.trim().length > 0 &&
          typeof expense.title === "string" &&
          expense.title.trim().length > 0 &&
          expense.title.length <= 500
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Provide 1 to 500 valid expenses"
      });
      return;
    }

    const results = await categorizeExpenseBatch(expenses);

    res.status(200).json({
      success: true,
      results
    });

  } catch (error) {
    console.error("Expense categorization error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to categorize expenses"
    });
  }
};