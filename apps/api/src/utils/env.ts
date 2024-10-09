import { z } from "@hono/zod-openapi";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

export const env = z
  .object({
    DB_URL: z.string().optional(),
    ServerOrigin: z.string().optional().default("http://localhost:3001"),
  })
  .parse(process.env);
