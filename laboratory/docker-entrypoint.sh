#!/bin/sh

# 환경변수 파일 로드
if [ -f "/app/env/.env.production" ]; then
  echo "Loading production environment variables..."
  export $(cat /app/env/.env.production | xargs)
else
  echo "Warning: .env.production file not found"
fi

# $APP_NAME 환경변수에 따라 다른 앱 실행
case "$APP_NAME" in
  "jobs")
    echo "Starting jobs application..."
    node dist/apps/jobs/main.js
    ;;
  "laboratory")
    echo "Starting laboratory application..."
    node dist/apps/laboratory/main.js
    ;;
  "api")
    echo "Starting api application..."
    node dist/apps/api/main.js
    ;;
  *)
    echo "Please specify APP_NAME environment variable (jobs or laboratory or api)"
    exit 1
    ;;
esac