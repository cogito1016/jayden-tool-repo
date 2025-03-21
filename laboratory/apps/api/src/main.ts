import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule);

  // 전역 예외 필터 등록
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 전역 파이프 추가 (DTO 유효성 검증)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger 문서화 설정
  const config = new DocumentBuilder()
    .setTitle('Laboratory API')
    .setDescription('Laboratory 프로젝트 API 문서')
    .setVersion('1.0')
    .addTag('reminder-bot', 'Slack 리마인더 봇 관련 API')
    .addTag('slack', 'Slack 이벤트 관련 API')
    .addTag('member', '멤버 관련 API')
    .addTag('conversation', '대화 로그 관련 API')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
