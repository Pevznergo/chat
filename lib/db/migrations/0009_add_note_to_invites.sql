import { text } from "drizzle-orm/pg-core";

export default {
  up: "ALTER TABLE invites ADD COLUMN note text",
  down: "ALTER TABLE invites DROP COLUMN note",
};
