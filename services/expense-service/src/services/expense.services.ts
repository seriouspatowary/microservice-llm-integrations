import { pool } from "../config/database.js";

export interface CreateExpenseInput {
  userId: string;
  title: string;
  amount: number;
  category?: string | undefined;
  description?: string | undefined;
  expenseDate?: string | undefined;
}

interface UpdateExpenseInput {
  id: string;
  userId: string;
  title?: string | undefined;
  amount?: number | undefined;
  description?: string | null | undefined;
}


interface DeleteExpenseInput {
  id: string;
  userId: string;
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







export async function updateExpenseService({
  id,
  userId,
  title,
  amount,
  description,
}: UpdateExpenseInput) {
  const query = `
    UPDATE expenses
    SET
      title = COALESCE($1, title),
      amount = COALESCE($2, amount),
      description = CASE
        WHEN $3::boolean THEN $4::text
        ELSE description
      END
    WHERE id = $5
      AND user_id = $6
    RETURNING
      id,
      user_id,
      title,
      amount,
      description,
      expense_date,
      created_at;
  `;

  const values = [
    title ?? null,
    amount ?? null,
    description !== undefined,
    description ?? null,
    id,
    userId,
  ];

  const result = await pool.query(query, values);

  return result.rows[0] ?? null;
}


export async function deleteExpenseService({id, userId}:DeleteExpenseInput) {

  const query = `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id,
      user_id,
      title,
      amount,
      description,
      expense_date,
      created_at;`;

  const result = await pool.query(query,[id, userId]);
  
  return result.rows[0] ?? null;
  

}