import dotenv from "dotenv";

dotenv.config();

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: process.env.PORT || "5000",
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

  EDITORS: process.env.EDITORS || "Gariik Gutman, Chris Justice",
  JWT_SECRET: process.env.JWT_SECRET || "default_secret",

  DATABASE_URL: process.env.DATABASE_URL,

  AWS_REGION: process.env.AWS_REGION || "ap-southeast-1",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
};