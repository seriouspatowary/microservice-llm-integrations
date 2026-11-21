import { predictExpenseCategory } from "../../../services/expense-category.service.js";

type ExpenseInput = {
  id: string;
  title: string;
};

export const categorizeExpenseBatch = async (
  expenses: ExpenseInput[]
) => {
  const results = [];

  for (const expense of expenses) {
    const prediction = await predictExpenseCategory(
      expense.title.trim()
    );

    results.push({
      expenseId: expense.id,
      title: expense.title,
      ...prediction
    });
  }

  return results;
};