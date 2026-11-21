import { pool } from "../config/db.js";
import { generateEmbedding } from "../rag/embedding.service.js";

type CategoryMatch = {
  category_id: string;
  category: string;
  example_text: string;
  similarity: number;
};

export async function predictExpenseCategory(title: string) {
  const embedding = await generateEmbedding(title);

  const { rows } = await pool.query<CategoryMatch>(
    `
    SELECT
      c.id AS category_id,
      c.name AS category,
      e.example_text,
      1 - (e.embedding <=> $1::vector) AS similarity
    FROM expense_category_examples e
    JOIN expense_categories c
      ON c.id = e.category_id
    WHERE e.embedding IS NOT NULL
    ORDER BY e.embedding <=> $1::vector
    LIMIT 1
    `,
    [JSON.stringify(embedding)]
  );

  const bestMatch = rows[0];

  const MIN_SIMILARITY = 0.55;

  if (!bestMatch || bestMatch.similarity < MIN_SIMILARITY) {
    return {
      categoryId: null,
      category: "Uncategorized",
      similarity: bestMatch?.similarity ?? null
    };
  }

  return {
    categoryId: bestMatch.category_id,
    category: bestMatch.category,
    similarity: bestMatch.similarity
  };
}