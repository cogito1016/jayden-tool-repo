import { scheduleJob } from "node-schedule";
import { goalReminderProcess } from "./processes/goal-reminder-bot/goal-reminder-bot.js";
import * as dotenv from "dotenv";
import { sendMessageToTestChannel } from "./lib/slack_alarm.js";

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

sendMessageToTestChannel({
  text: `Process is started | ENV IS : ${process.env.NODE_ENV} | WebhookURL : ${process.env.GOAL_STUDY_SLACK_WEBHOOK}`,
});

const regularExec = scheduleJob("6 14 * * *", () => {
  goalReminderProcess();
});
