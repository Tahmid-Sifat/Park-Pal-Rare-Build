import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    // Paste your PostgreSQL connection string into DATABASE_URL in .env / .env.local
    url: process.env["DATABASE_URL"]
  }
});
