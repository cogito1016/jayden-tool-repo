import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiService } from './api.service';
import { SlackWebhookEvent } from 'libs/slack/types/slack-webhook-message';
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('reminder-bot')
@Controller('reminder-bot')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @ApiOperation({
    summary: '상태 확인 API',
    description: '서버 상태를 확인합니다.',
  })
  @ApiResponse({ status: 200, description: '서버가 정상적으로 응답합니다.' })
  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }

  @ApiOperation({
    summary: '슬랙 웹훅 이벤트 처리',
    description:
      '슬랙에서 보낸 웹훅 이벤트를 처리합니다. 사용자의 응답을 로깅합니다.',
  })
  @ApiResponse({ status: 200, description: '이벤트 처리 성공' })
  @ApiBody({
    description: '슬랙 웹훅 이벤트 데이터',
    type: Object,
  })
  @Post('chat')
  async processUserResponse(
    @Body() webhookData: SlackWebhookEvent,
  ): Promise<{ success: boolean }> {
    // 일반 메시지 이벤트 처리
    await this.apiService.processUserReponse(webhookData);
    return { success: true };
  }
}
