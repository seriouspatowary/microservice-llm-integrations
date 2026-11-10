import type { Request, Response, NextFunction } from "express";

export function authorizePermissions(...requiredPermissions: string[]) {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        if (!req.auth) {
            res.status(401).json({
                message: "Authentication required",
            });
            return;
        }

        const hasPermissions = requiredPermissions.every(
            (permission) => req.auth!.permissions.includes(permission)
        );

        if (!hasPermissions) {
            res.status(403).json({
                message: "Insufficient permissions",
            });
            return;
        }

        next();
    };
}