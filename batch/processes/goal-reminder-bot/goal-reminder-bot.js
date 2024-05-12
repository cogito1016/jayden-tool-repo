import { sendMessageToTestChannel } from "../../lib/slack_alarm.js";
import { MemberObjectList } from "./MemberObjectList.js";

export function goalReminderProcess() {
  sendMessageToTestChannel({
    text: `리마인더봇 배치시간이되어 작동합니다`,
  });
  const webhook = process.env.GOAL_STUDY_SLACK_WEBHOOK;
  console.log(webhook);

  const members = MemberObjectList;

  members.forEach((member) => {
    const message = {
      text: `<@${member.slackId}>님, 진행중인 프로젝트 목록입니다.`,
      attachments: member.project.map((project) => ({
        text: project,
      })),
    };

    const options = {
      method: "post",
      contentType: "application/json",
      muteHttpExceptions: true,
      body: JSON.stringify(message),
    };

    fetch(webhook, options);
  });
}
