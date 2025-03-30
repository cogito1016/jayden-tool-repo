import { config } from 'dotenv';
import * as path from 'path';
import { validate } from './env.validation';

// 환경변수 로드
const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : '.env.local';

console.log(`🚀 Application starting in ${env} mode`);
console.log(`📁 Using environment file: ${envFile}`);

// 프로젝트 루트 디렉토리 찾기 (laboratory 디렉토리)
const projectRoot = path.resolve(process.cwd()); // 프로젝트 루트 디렉토리 찾기
console.log(`📂 Project root directory: ${projectRoot}`);

// 환경변수 파일 로드
const envPath = path.resolve(projectRoot, 'env', envFile);
console.log(`📄 Loading environment file from: ${envPath}`);

const result = config({
  path: envPath,
});

if (result.error) {
  console.error(`❌ Error loading environment file: ${result.error.message}`);
} else {
  console.log('✅ Environment file loaded successfully');
}

// 설정 객체 생성
const configObject = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: parseInt(process.env.DB_PORT || '3306', 10),
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
  REMINDER_BOT_ID: process.env.REMINDER_BOT_ID,
  SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  SLACK_CONVERSATION_ID: process.env.SLACK_CONVERSATION_ID,
  SLACK_TEST_CONVERSATION_ID: process.env.SLACK_TEST_CONVERSATION_ID,
  AI_API_KEY: process.env.AI_API_KEY,
};

// 디버깅을 위한 환경변수 출력
console.log('🔍 Environment variables loaded:');
Object.keys(configObject).forEach((key) => {
  console.log(
    `${key}: ${configObject[key] ? '✅' : '❌'} = ${configObject[key]}`,
  );
});

// 타입추론을 위해 환경변수 중 하나라도 undefined인 경우 종료
if (Object.values(configObject).some((value) => value === undefined)) {
  console.error('❌ Environment variables are missing');
  process.exit(1);
}

// 환경 변수 유효성 검사
validate(configObject);

// 환경 정보 export
export const environment = {
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  nodeEnv: env,
  database: {
    host: configObject.DB_HOST,
    port: configObject.DB_PORT,
    username: configObject.DB_USERNAME,
    password: configObject.DB_PASSWORD,
    database: configObject.DB_DATABASE,
  },
  reminder: {
    botId: configObject.REMINDER_BOT_ID,
    token: configObject.SLACK_BOT_TOKEN,
    conversationId: configObject.SLACK_CONVERSATION_ID,
    testConversationId: configObject.SLACK_TEST_CONVERSATION_ID,
  },
  ai: {
    apiKey: configObject.AI_API_KEY,
  },
};

// configuration 함수를 default export로 변경
export default () => environment;
