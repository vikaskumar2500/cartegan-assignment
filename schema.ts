
// User Schema
import * as p from "drizzle-orm/pg-core";
export const users = p.pgTable("users", {
  id: p.uuid().defaultRandom().primaryKey(),
  name:p.text(),
  email: p.text(),
  password: p.text(),
  updated_at: p.timestamp(),
  created_at: p.timestamp().defaultNow().notNull(),
});
