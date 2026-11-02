import { pool } from "../config/database.js";

export interface CreateExpenseInput {
  userId: string;
  title: string;
  amount: number;
  category?: string | undefined;
  description?: string | undefined;
  expenseDate?: string | undefined;
}

export async function createExpenseService(
  data: CreateExpenseInput
) {
  const {
    userId,
    title,
    amount,
    category,
    description,
    expenseDate,
  } = data;

  const query = `
    INSERT INTO expenses (
      user_id,
      title,
      amount,
      category,
      description,
      expense_date
    )
    VALUES (
      $1, $2, $3, $4, $5,
      COALESCE($6::date, CURRENT_DATE)
    )
    RETURNING
      id,
      user_id,
      title,
      amount,
      category,
      description,
      expense_date,
      created_at;
  `;

  const values = [
    userId,
    title,
    amount,
    category ?? null,
    description ?? null,
    expenseDate ?? null,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
}



export async function getExpensesByUserId(userId: string) {
  const query = `
    SELECT
      id,
      user_id,
      title,
      amount,
      category,
      description,
      expense_date,
      created_at
    FROM expenses
    WHERE user_id = $1
    ORDER BY expense_date DESC, created_at DESC;
  `;

  const { rows } = await pool.query(query, [userId]);

  return rows;
}