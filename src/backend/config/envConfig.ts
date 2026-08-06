import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/opportunity_hub?schema=public'),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET should be at least 32 characters long')
    .default('enterprise_access_token_secret_key_32_chars_min'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET should be at least 32 characters long')
    .default('enterprise_refresh_token_secret_key_32_chars_min'),
  CORS_ORIGIN: z.string().default('*'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('Environment variable validation failed:', result.error.format());
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Fatal error: Invalid environment configuration for production.');
    }
  }

  const config = result.success ? result.data : envSchema.parse({});

  if (process.env.NODE_ENV === 'production') {
    if (config.JWT_ACCESS_SECRET.includes('enterprise_access_token_secret_key')) {
      console.warn('SECURITY WARNING: Using default JWT_ACCESS_SECRET in production!');
    }
    if (config.JWT_REFRESH_SECRET.includes('enterprise_refresh_token_secret_key')) {
      console.warn('SECURITY WARNING: Using default JWT_REFRESH_SECRET in production!');
    }
  }

  return config;
}

export const envConfig = validateEnv();
