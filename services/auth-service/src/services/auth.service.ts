
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { pool } from "../config/database.js";
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/tokens.js";

const SALT_ROUNDS = 12;

type UserAccess = {
  roles: string[];
  permissions: string[];
};

async function getUserAccess(userId: string): Promise<UserAccess> {
  const result = await pool.query(
    `
    SELECT
      COALESCE(
        array_agg(DISTINCT r.name)
          FILTER (WHERE r.name IS NOT NULL),
        ARRAY[]::text[]
      ) AS roles,
      COALESCE(
        array_agg(DISTINCT p.name)
          FILTER (WHERE p.name IS NOT NULL),
        ARRAY[]::text[]
      ) AS permissions
    FROM users u
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    LEFT JOIN role_permissions rp ON rp.role_id = r.id
    LEFT JOIN permissions p ON p.id = rp.permission_id
    WHERE u.id = $1
    `,
    [userId]
  );

  return result.rows[0];
}

// Registration: create user and assign role, without issuing tokens.
export async function registerUser(
  name: string,
  email: string,
  password: string,
  requestedRole: "EXPENSE_USER" | "FAKE_NEWS_USER"
): Promise<void> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rowCount) {
      throw new Error("EMAIL_ALREADY_EXISTS");
    }

    const roleResult = await client.query(
      "SELECT id FROM roles WHERE name = $1",
      [requestedRole]
    );

    if (!roleResult.rowCount) {
      throw new Error("ROLE_NOT_FOUND");
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const userResult = await client.query(
      `
      INSERT INTO users (name, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [name, email, passwordHash]
    );

    const user = userResult.rows[0];

    await client.query(
      `
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      `,
      [user.id, roleResult.rows[0].id]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Login: verify credentials, issue access token,
// and persist a hash of the refresh token.
export async function loginUser(email: string, password: string) {
  const result = await pool.query(
    `
    SELECT id, name, email, password_hash, is_active
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.is_active) {
    throw new Error("ACCOUNT_DISABLED");
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatches) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const access = await getUserAccess(user.id);

  const accessToken = generateAccessToken({
    sub: user.id,
    email: user.email,
    roles: access.roles,
    permissions: access.permissions,
  });

  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const familyId = randomUUID();

  await pool.query(
    `
    INSERT INTO refresh_tokens (
      user_id,
      token_hash,
      family_id,
      expires_at
    )
    VALUES (
      $1,
      $2,
      $3,
      NOW() + INTERVAL '7 days'
    )
    `,
    [user.id, tokenHash, familyId]
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: access.roles,
      permissions: access.permissions,
    },
    accessToken,
    refreshToken,
  };
}



export async function refreshUser(refreshToken: string) {

  const client = await pool.connect();

  try {


    await client.query("BEGIN");
    // Atomically consume the old refresh token.
    // A token can be consumed only once, even with concurrent requests.

    const tokenHash = hashRefreshToken(refreshToken);

    const tokenResult = await client.query(
      `DELETE FROM refresh_tokens
       WHERE token_hash = $1
         AND expires_at > NOW()
       RETURNING user_id, family_id`,
      [tokenHash]
    );

    if (tokenResult.rowCount !== 1) {
      throw new Error("INVALID_REFRESH_TOKEN");
    }

    const { user_id: userId, family_id: familyId } = tokenResult.rows[0];

    const userResult = await client.query(
      `SELECT id, email, is_active
       FROM users
       WHERE id = $1`,
      [userId]
    );

    const user = userResult.rows[0];

    if (!user || !user.is_active) {
      // Commit the consumed token so it cannot be reused.
      await client.query("COMMIT");
      throw new Error("ACCOUNT_DISABLED");
    }

    // Read the current roles and permissions from the database.
    const accessResult = await client.query(
      `
      SELECT
        COALESCE(
          array_agg(DISTINCT r.name)
            FILTER (WHERE r.name IS NOT NULL),
          ARRAY[]::text[]
        ) AS roles,
        COALESCE(
          array_agg(DISTINCT p.name)
            FILTER (WHERE p.name IS NOT NULL),
          ARRAY[]::text[]
        ) AS permissions
      FROM users u
      LEFT JOIN user_roles ur ON ur.user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      LEFT JOIN role_permissions rp ON rp.role_id = r.id
      LEFT JOIN permissions p ON p.id = rp.permission_id
      WHERE u.id = $1
      `,
      [userId]
    );

    const { roles, permissions } = accessResult.rows[0];

    const accessToken = generateAccessToken({
      sub: user.id,
      email: user.email,
      roles,
      permissions,
    });

    // Rotate the refresh token, preserving its family.
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    await client.query(
      `INSERT INTO refresh_tokens (
         user_id, token_hash, family_id, expires_at
       )
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      [user.id, newTokenHash, familyId]
    );


    await client.query("COMMIT");

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}



export async function logoutUser(
  refreshToken: string
): Promise<void> {
  const tokenHash = hashRefreshToken(refreshToken);

  await pool.query(
    `DELETE FROM refresh_tokens
     WHERE token_hash = $1`,
    [tokenHash]
  );
}
