import { pool } from "../config/db.js";
import { generateEmbedding } from "../rag/embedding.service.js";


async function generateCategoryEmbeddings() {
  try {
    // 1. Fetch examples without embeddings
    const { rows } = await pool.query(`
      SELECT id, example_text
      FROM expense_category_examples
      WHERE embedding IS NULL
    `);

    console.log(`Found ${rows.length} examples`);

    // 2. Generate embeddings for each example
    for (const example of rows) {
      const embedding = await generateEmbedding(
        example.example_text
      );

      // 3. Store embedding in PostgreSQL
      await pool.query(
        `
        UPDATE expense_category_examples
        SET embedding = $1::vector
        WHERE id = $2
        `,
        [JSON.stringify(embedding), example.id]
      );

      console.log(`Embedded: ${example.example_text}`);
    }

    console.log("All category embeddings generated!");

  } catch (error) {
    console.error("Embedding generation failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

generateCategoryEmbeddings();