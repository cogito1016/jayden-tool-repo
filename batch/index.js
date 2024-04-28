import { scheduleJob } from "node-schedule";
import { goalReminderProcess } from "./processes/goal-reminder-bot/goal-reminder-bot.js";
import * as dotenv from "dotenv";

process.env.NODE_ENV =
  process.env.NODE_ENV &&
  process.env.NODE_ENV.trim().toLowerCase() == "production"
    ? "production"
    : "development";

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: "./.prod.env" });
} else {
  dotenv.config({ path: "./.dev.env" });
}

const regularExec = scheduleJob("0 0 8 * * *", () => {
  goalReminderProcess();
});
