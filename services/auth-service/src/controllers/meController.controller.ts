
import type { Request, Response } from "express";

export function meController(req: Request, res: Response): void {
  if (!req.auth) {
    res.status(401).json({
      message: "Authentication required",
    });
    return;
  }

  res.status(200).json({
    message: "User profile fetched successfully",
    user: {
      id: req.auth.sub,
      email: req.auth.email,
      roles: req.auth.roles,
      permissions: req.auth.permissions,
    },
  });
}
