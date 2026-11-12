import type { Request, Response } from "express";
import { z } from "zod";
import { createIncomeService } from "../services/income.services.js";



const createIncomeSchema = z.object({
  title: z.string().trim().min(1).max(150),
  amount: z.number().finite().positive(),
  category: z.string().trim().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  incomeDate: z.iso.date().optional(),
});

export async function createIncome(
  req: Request,
  res: Response
): Promise<void> {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  const result = createIncomeSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      message: "Invalid income data",
      errors: result.error.issues,
    });
    return;
  }

  try {
    const income = await createIncomeService({
      ...result.data,
      userId: req.auth.sub,
    });

    res.status(201).json({
      message: "Income created successfully",
      income,
    });
  } catch (error) {
    console.error("Create income error:", error);

    res.status(500).json({
      message: "Failed to create income",
    });
  }
}


