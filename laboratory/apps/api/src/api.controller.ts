import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiService } from './api.service';
import { SlackWebhookResponse } from 'libs/slack/types/slack-webhook.type';
import { URL_VERIFICATION } from 'libs/slack/constants/slack-message-type';

@Controller('reminder-bot')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }

  @Post('chat')
  processUserReponse(@Body() webhookData: SlackWebhookResponse): void | string {
    if (webhookData.type === URL_VERIFICATION) {
      return webhookData.challenge;
    }
    this.apiService.processUserReponse(webhookData);
  }
}
