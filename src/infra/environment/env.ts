import { z } from "zod";

export const envSchema = z.object({
  APP_VERSION: z.string().default("1"),

  //DATABASE_URL: z.string().url(),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().optional().default(3000),
  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_NAME: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),

  JWT_AUTH_TOKEN_KEY: z.string(),
  JWT_REFRESH_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),

  CLOUDFLARE_ACCOUNT_ID: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_SECRET_KEY_ID: z.string(),
  CLOUDNARY_API_SECRET: z.string(),
  CLOUDNARY_API_KEY: z.string(),
  CLOUDINARY_NAME: z.string(),
  STORAGE_URL: z.string(),

  SEND_GRID_KEY: z.string(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),

  BACKOFFICE_URL: z.string(),
  SWAGGER_PASSWORD: z.string(),
});

export type Env = z.infer<typeof envSchema>;
