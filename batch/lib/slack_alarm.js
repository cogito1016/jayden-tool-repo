/**
 * 
 * 
    message = {
      text: `<@${member.name}>님, 진행중인 프로젝트 목록입니다.`,
      attachments: member.project.map((project) => ({
        text: project,
      })),
    };
 */
export function sendMessageToTestChannel(message) {
  const webhook = process.env.TEST_LOG_WEBHOOK;

  const options = {
    method: "post",
    contentType: "application/json",
    muteHttpExceptions: true,
    body: JSON.stringify(message),
  };

  fetch(webhook, options);
}
