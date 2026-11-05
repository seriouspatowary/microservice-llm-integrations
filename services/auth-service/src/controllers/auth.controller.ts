
import type { Request, Response } from "express";
import {
  loginSchema,
  registerSchema,
} from "../validators/auth.schema.js";
import {
  loginUser,
  logoutUser,
  refreshUser,
  registerUser,
  
} from "../services/auth.service.js";

export async function register(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid registration data",
      errors: parsed.error.issues,
    });
    return;
  }

  const { name, email, password, role } = parsed.data;
  const emailLower = email.toLowerCase();

  try {
    await registerUser(name, emailLower, password, role);

    res.status(201).json({
      message: "Registered successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "EMAIL_ALREADY_EXISTS") {
        res.status(409).json({
          message: "Email is already registered",
        });
        return;
      }

      if (error.message === "ROLE_NOT_FOUND") {
        res.status(400).json({
          message: "Requested role is unavailable",
        });
        return;
      }
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      res.status(409).json({
        message: "Email is already registered",
      });
      return;
    }

    console.error("Registration failed:", error);

    res.status(500).json({
      message: "Unable to register user",
    });
  }
}

export async function login(
  req: Request,
  res: Response
): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid login data",
      errors: parsed.error.issues,
    });
    return;
  }

  const email = parsed.data.email.toLowerCase();

  try {
    const result = await loginUser(email, parsed.data.password);

    const { refreshToken, ...loginResponse } = result;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      ...loginResponse,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INVALID_CREDENTIALS") {
        res.status(401).json({
          message: "Invalid email or password",
        });
        return;
      }

      if (error.message === "ACCOUNT_DISABLED") {
        res.status(403).json({
          message: "Account is disabled",
        });
        return;
      }
    }

    console.error("Login failed:", error);

    res.status(500).json({
      message: "Unable to log in",
    });
  }
}


export async function refreshController(req:Request,res: Response):Promise<void>{

  const refreshToken = req.cookies?.refreshToken;


  if (!refreshToken || typeof refreshToken !== "string") {
    res.status(401).json({
      message: "Refresh token required",
    });
    return;
  }
  try {

    const result = await refreshUser(refreshToken);

    res.cookie("refreshToken", result.refreshToken,{
      httpOnly:true,
      secure:process.env.NODE_ENV === "production",
      sameSite:'lax',
      path:'/api/auth',
      maxAge: 7 * 24 * 60 * 60 * 1000,

    })

    res.status(200).json({
      message: "Token refreshed successfully",
      accessToken: result.accessToken,
    })
    
  } catch (error) {
    
  }
  
}


export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  const refreshToken = req.cookies?.refreshToken;

  try {
    if (typeof refreshToken === "string" && refreshToken.length > 0) {
      await logoutUser(refreshToken);
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
    });

    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch {
    res.status(500).json({
      message: "Unable to complete logout",
    });
  }
}
