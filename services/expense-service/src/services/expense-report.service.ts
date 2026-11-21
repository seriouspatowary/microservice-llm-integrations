import { pool } from "../config/database.js";

type Expense = {
  id: string;
  title: string;
  amount: string;
};

type Prediction = {
  expenseId: string;
  categoryId: string | null;
  category: string;
  similarity: number | null;
};

type CategoryTotal = {
  category: string;
  totalAmount: number;
};

export const generateMonthlyReport = async (
  userId: string,
  month: string
) => {
        const startDate = `${month}-01`;

        const date = new Date(`${startDate}T00:00:00Z`);

        date.setUTCMonth(date.getUTCMonth() + 1);

        const endDate = date.toISOString().slice(0, 10);
        // Step 1: Fetch monthly expenses
        const { rows: expenses } = await pool.query<Expense>(
            `
            SELECT id, title, amount
            FROM expenses
            WHERE user_id = $1
            AND expense_date >= $2::date
            AND expense_date < $3::date
            ORDER BY expense_date ASC
            `,
            [userId, startDate, endDate]
        );


        console.log("expenses:",expenses)

        if (expenses.length === 0) {
            return {
            month,
            totalExpense: 0,
            categories: []
            };
        }

        // Step 2: Call Fake News Service
        const aiServiceUrl = process.env.AI_SERVICE_URL;

        if (!aiServiceUrl) {
            throw new Error("AI_SERVICE_URL is not configured");
        }

        const response = await fetch(
            `${aiServiceUrl}/internal/ai/categorize`,
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-service-key": process.env.INTERNAL_SERVICE_KEY ?? ""
            },
            body: JSON.stringify({
                expenses: expenses.map((expense) => ({
                id: expense.id,
                title: expense.title
                }))
            }),
           signal: AbortSignal.timeout(200000)
            }
        );

        if (!response.ok) {
            throw new Error(
            `AI categorization failed: ${response.status}`
            );
        }

        const data = await response.json() as {
            success: boolean;
            results: Prediction[];
        };

        // console.log(
        //     "AI RESPONSE:",
        //     JSON.stringify(data, null, 2)
        //     );
        

        if (!data.success || !Array.isArray(data.results)) {
            throw new Error("Invalid AI service response");
        }

        // Step 3: Map predictions by expense ID
        const predictionMap = new Map(
            data.results.map((item) => [item.expenseId, item])
        );

        // Step 4: Calculate category totals
        const categoryTotals = new Map<string, number>();

        let totalExpense = 0;

        for (const expense of expenses) {
            const amount = Number(expense.amount);

            if (!Number.isFinite(amount)) {
            throw new Error("Invalid expense amount");
            }

            const prediction = predictionMap.get(expense.id);

            const category = prediction?.category || "Uncategorized";

            categoryTotals.set(
            category,
            (categoryTotals.get(category) ?? 0) + amount
            );

            totalExpense += amount;
        }

        const categories: CategoryTotal[] = Array.from(
            categoryTotals.entries()
        ).map(([category, totalAmount]) => ({
            category,
            totalAmount: Number(totalAmount.toFixed(2))
        }));

        categories.sort(
            (a, b) => b.totalAmount - a.totalAmount
        );

        return {
            month,
            totalExpense: Number(totalExpense.toFixed(2)),
            categories
        };
        };