import type { Request, Response, NextFunction } from "express";
import { timingSafeEqual } from "node:crypto";

export const verifyServiceKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const expectedKey = process.env.INTERNAL_SERVICE_KEY;
  const providedKey = req.header("x-service-key");

  if (!expectedKey) {
    res.status(500).json({
      success: false,
      message: "Internal service authentication is not configured"
    });
    return;
  }

  if (!providedKey) {
    res.status(401).json({
      success: false,
      message: "Missing service authentication key"
    });
    return;
  }

  const expected = Buffer.from(expectedKey);
  const provided = Buffer.from(providedKey);

  if (
    expected.length !== provided.length ||
    !timingSafeEqual(expected, provided)
  ) {
    res.status(403).json({
      success: false,
      message: "Invalid service authentication key"
    });
    return;
  }

  next();
};