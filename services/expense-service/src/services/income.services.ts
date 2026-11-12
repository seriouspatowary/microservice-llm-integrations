import { pool } from "../config/database.js";

export interface CreateIncomeInput {
  userId: string;
  title: string;
  amount: number;
  category?: string | undefined;
  description?: string | undefined;
  incomeDate?: string | undefined;
}

export async function createIncomeService(
  data: CreateIncomeInput
) {
  const {
    userId,
    title,
    amount,
    category,
    description,
    incomeDate,
  } = data;

  const query = `
    INSERT INTO income (
      user_id,
      title,
      amount,
      category,
      description,
      income_date
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
      income_date,
      created_at;
  `;

  const values = [
    userId,
    title,
    amount,
    category ?? null,
    description ?? null,
    incomeDate ?? null,
  ];

  const { rows } = await pool.query(query, values);

  return rows[0];
}

