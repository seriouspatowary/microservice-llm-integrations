import { pool } from "../config/db.js";
import { predictExpenseCategory } from "../services/expense-category.service.js";


async function main() {
//   const title = "sabji kharidne ka kharcha"; // Example expense title

 const title = "petrol"; // Example expense title

  const matches = await predictExpenseCategory(title);

  console.table(matches);

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});