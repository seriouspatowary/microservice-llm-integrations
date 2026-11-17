import { pool } from "../config/database.js";

export interface CreateIncomeInput {
  userId: string;
  title: string;
  amount: number;
  category?: string | undefined;
  description?: string | undefined;
  incomeDate?: string | undefined;
}

export interface UpdateIncomeInput {
  id: string;
  userId: string;
   title?: string | undefined;
  amount?: number | undefined;
  description?: string | null | undefined;
}

interface DeleteIncomeInput {
  id: string;
  userId: string;
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




export async function getIncomeService(userId: string) {
  
  const query = `
    SELECT
      id,
      user_id,
      title,
      amount,
      category,
      description,
      income_date,
      created_at
    FROM income
    WHERE user_id = $1
    ORDER BY income_date DESC, created_at DESC
  `;

  const result = await pool.query(query, [userId]);

  return result.rows;
}


export async function updateIncomeService({id, userId, title, amount, description}: UpdateIncomeInput) {

  const query = `
    UPDATE income
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
      category,
      description,
      income_date,
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


  const result = await pool.query(query,values)

  return result.rows[0] ?? null;

}


export async function deleteIncomeService({id, userId}: DeleteIncomeInput) {
  const query = `
    DELETE FROM income
    WHERE id = $1
      AND user_id = $2
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

  const result = await pool.query(query, [id, userId]);

  return result.rows[0] ?? null;
}