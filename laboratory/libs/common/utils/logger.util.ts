import { Logger } from '@nestjs/common';

/**
 * 로깅 유틸리티 클래스
 * 애플리케이션 전반에서 일관된 로깅을 제공합니다.
 */
export class LoggerUtil {
  private static readonly SEPARATOR = ' | ';
  private readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  /**
   * 정보 레벨 로그를 기록합니다.
   * @param message 로그 메시지
   * @param metadata 추가 메타데이터 객체
   */
  info(message: string, metadata?: Record<string, any>): void {
    this.logger.log(this.formatMessage(message, metadata));
  }

  /**
   * 에러 레벨 로그를 기록합니다.
   * @param message 에러 메시지
   * @param trace 스택 트레이스
   * @param metadata 추가 메타데이터 객체
   */
  error(message: string, trace?: string, metadata?: Record<string, any>): void {
    this.logger.error(this.formatMessage(message, metadata), trace);
  }

  /**
   * 경고 레벨 로그를 기록합니다.
   * @param message 경고 메시지
   * @param metadata 추가 메타데이터 객체
   */
  warn(message: string, metadata?: Record<string, any>): void {
    this.logger.warn(this.formatMessage(message, metadata));
  }

  /**
   * 디버그 레벨 로그를 기록합니다.
   * @param message 디버그 메시지
   * @param metadata 추가 메타데이터 객체
   */
  debug(message: string, metadata?: Record<string, any>): void {
    this.logger.debug(this.formatMessage(message, metadata));
  }

  /**
   * 로그 메시지를 포맷팅합니다.
   * @param message 원본 메시지
   * @param metadata 메타데이터 객체
   * @returns 포맷팅된 로그 메시지
   */
  private formatMessage(
    message: string,
    metadata?: Record<string, any>,
  ): string {
    if (!metadata) {
      return message;
    }

    const metadataStr = Object.entries(metadata)
      .map(([key, value]) => `${key}=${this.formatValue(value)}`)
      .join(LoggerUtil.SEPARATOR);

    return `${message}${LoggerUtil.SEPARATOR}${metadataStr}`;
  }

  /**
   * 값을 로깅에 적합한 문자열로 변환합니다.
   * @param value 변환할 값
   * @returns 문자열로 변환된 값
   */
  private formatValue(value: any): string {
    if (value === null || value === undefined) {
      return 'null';
    }

    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch {
        return '[Object]';
      }
    }

    return String(value);
  }
}
