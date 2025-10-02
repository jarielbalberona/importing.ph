import { z } from "zod";

import { validateEnum, validateString } from "@/validators/commonRules";


export const envSchema = z.object({
	DATABASE_URL: validateString("DATABASE_URL"),
	PORT: validateString("PORT").refine(value => !isNaN(Number(value)), "PORT must be a number"),
	NODE_ENV: validateEnum("NODE_ENV", ["development", "production"]),
	SECRET: validateString("SECRET"),
	JWT_COOKIE_NAME: validateString("JWT_COOKIE_NAME"),
	SESSION_COOKIE_NAME: validateString("SESSION_COOKIE_NAME"),
	ORIGIN_URL: validateString("ORIGIN_URL"),
	APP_URL: validateString("APP_URL"),
	API_URL: validateString("API_URL"),
	RESEND_EMAIL_KEY: validateString("RESEND_EMAIL_KEY"),
	RESEND_EMAIL_FROM: validateString("RESEND_EMAIL_FROM"),
});

const Env = envSchema.safeParse(process.env);

if (!Env.success) {
	const errorMessages = Env.error.errors.map(e => e.message).join("\n");
	console.error(`Environment validation failed:\n${errorMessages}`);
	process.exit(1);
}

export type EnvType = z.infer<typeof envSchema>;

declare global {
	namespace NodeJS {
		interface ProcessEnv extends EnvType {}
	}
}
