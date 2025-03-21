/**
 * 유닉스 타임스탬프를 Date 객체로 변환
 * @param unixTimestamp 숫자 또는 문자열 형태의 유닉스 타임스탬프
 * @returns JavaScript Date 객체
 */
export function unixTimestampToDate(unixTimestamp: number | string): Date {
  const timestamp =
    typeof unixTimestamp === 'string'
      ? parseFloat(unixTimestamp)
      : unixTimestamp;

  // 슬랙 타임스탬프는 소수점이 있는 초 단위이므로 1000 곱해서 밀리초로 변환
  return new Date(timestamp * 1000);
}

/**
 * Date 객체를 한국 시간 문자열로 변환 (YYYY-MM-DD HH:MM:SS)
 * @param date Date 객체
 * @returns 한국 시간 형식의 문자열
 */
export function formatToKoreanDateTime(date: Date): string {
  return date
    .toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/\. /g, '-')
    .replace(/\./g, '');
}

/**
 * 슬랙 타임스탬프 문자열을 한국 시간 형식 문자열로 변환
 * @param slackTs 슬랙 타임스탬프 (예: "1742398188.782369")
 * @returns 한국 시간 형식 문자열
 */
export function slackTsToKoreanTime(slackTs: string): string {
  const date = unixTimestampToDate(slackTs);
  return formatToKoreanDateTime(date);
}
