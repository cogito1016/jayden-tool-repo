import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  GenerativeModel,
  GenerateContentResult,
} from '@google/generative-ai';
import { ConversationLog } from '../domains/conversation-log/entities/conversation-log.entity';
import { aiApiKey } from 'env/Token';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    this.genAI = new GoogleGenerativeAI(aiApiKey || '');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  async generateText(prompt: string): Promise<string> {
    const result: GenerateContentResult =
      await this.model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * 리마인더 스레드에 대한 동기부여 메시지를 생성합니다.
   * @param conversationLogs 스레드의 대화 기록
   * @returns 동기부여 메시지
   */
  async generateMotivationalMessage(
    conversationLogs: ConversationLog[],
  ): Promise<string> {
    // AI가 이해하기 쉬운 형태로 대화 기록 변환
    const formattedLogs = conversationLogs.map((log) => ({
      timestamp: log.message_ts,
      user: log.slack_member_id,
      message: log.message,
      isReminderBot: log.parent_user_id === process.env.REMINDER_BOT_ID,
      isTargetUser: log.is_reminder_target,
    }));

    const prompt = `
당신은 동기부여 전문가입니다. 다음 대화 기록을 바탕으로 100자 이내의 짧고 강력한 동기부여 메시지를 생성해주세요.

대화 기록:
${JSON.stringify(formattedLogs, null, 2)}

요구사항:
1. 메시지는 100자 이내로 작성
2. 긍정적이고 동기부여가 되는 톤 사용
3. 구체적인 목표나 성과를 언급
4. 한국어로 작성
5. 이모지 1-2개 적절히 사용

동기부여 메시지:`;

    return this.generateText(prompt);
  }
}
