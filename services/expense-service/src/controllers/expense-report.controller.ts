import type { Request, Response } from "express";
import { generateMonthlyReport } from "../services/expense-report.service.js";

export const getMonthlyExpenseReport = async (
  req: Request,
  res: Response
): Promise<void> => {

    if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  try {
    const { month } = req.query;

    const userId = req.auth?.sub;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
      return;
    }

    if (
      typeof month !== "string" ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
    ) {
      res.status(400).json({
        success: false,
        message: "Month must be in YYYY-MM format"
      });
      return;
    }

    const report = await generateMonthlyReport(
      userId,
      month
    );

    res.status(200).json({
      success: true,
      ...report
    });

  } catch (error) {
    console.error("Monthly report error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate monthly expense report"
    });
  }
};