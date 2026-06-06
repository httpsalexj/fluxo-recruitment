@'
import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.js";

export type CandidateTokenPayload = {
  type: "candidate";
  id: string;
  discordId: string;
  email?: string;
  username?: string;
};

export type AdminTokenPayload = {
  type: "admin";
  id: string;
  email: string;
  name: string;
  role: string;
};

export function signToken(payload: CandidateTokenPayload | AdminTokenPayload) {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
}

export function verifyToken<T>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET as Secret) as T;
}
'@ | Set-Content -Path apps\api\src\utils\tokens.ts -Encoding UTF8