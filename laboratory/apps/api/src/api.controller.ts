import { Controller, Get, Post } from '@nestjs/common';
import { ApiService } from './api.service';

@Controller('reminder-bot')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Get()
  getHello(): string {
    return this.apiService.getHello();
  }

  @Post('chat')
  getReminder(): string {
    return this.apiService.getReminder();
  }
}
