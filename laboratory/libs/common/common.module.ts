import { Module } from '@nestjs/common';

/**
 * 애플리케이션 전체에서 사용하는 공통 유틸리티와 상수를 제공하는 모듈입니다.
 * 이 모듈은 서비스를 제공하지 않고 단순히 유틸리티 함수와 상수를 export합니다.
 */
@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class CommonModule {}
