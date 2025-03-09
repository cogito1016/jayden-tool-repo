import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiService } from './api.service';
import { SlackWebhookEvent } from 'libs/slack/types/slack-webhook-message';

@Controller('reminder-bot')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }

  @Post('chat')
  processUserResponse(@Body() webhookData: SlackWebhookEvent): void | string {
    // 일반 메시지 이벤트 처리
    this.apiService.processUserReponse(webhookData);
  }
}
