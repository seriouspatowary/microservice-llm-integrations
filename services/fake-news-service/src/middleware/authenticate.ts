import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthUser {
    sub: string;
    email: string;
    roles: string[];
    permissions: string[];
}

declare global {
    namespace Express {
        interface Request {
            auth?: AuthUser;
        }
    }
}

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;


export function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({
            message: "Access token required",
        });
        return;
    }

    const token = authHeader.slice(7);

    try {
        const decoded = jwt.verify(token, JWT_ACCESS_SECRET, {
            issuer: "auth-service",
            audience: "microservices",
            algorithms: ["HS256"],
        });

        if (
            typeof decoded === "string" ||
            typeof decoded.sub !== "string" ||
            typeof decoded.email !== "string" ||
            !Array.isArray(decoded.roles) ||
            !decoded.roles.every((role) => typeof role === "string") ||
            !Array.isArray(decoded.permissions) ||
            !decoded.permissions.every(
                (permission) => typeof permission === "string"
            )
        ) {
            res.status(401).json({
                message: "Invalid access token",
            });
            return;
        }

        req.auth = {
            sub: decoded.sub,
            email: decoded.email,
            roles: decoded.roles,
            permissions: decoded.permissions,
        };

        next();
    } catch {
        res.status(401).json({
            message: "Invalid or expired access token",
        });
    }
}