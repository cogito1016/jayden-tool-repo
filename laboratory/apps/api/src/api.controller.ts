import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiService } from './api.service';
import { SlackWebhookResponse } from 'libs/slack/types/slack-webhook.type';

@Controller('reminder-bot')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }

  @Post('chat')
  processUserReponse(@Body() webhookData: SlackWebhookResponse): void {
    this.apiService.processUserReponse(webhookData);
  }
}
