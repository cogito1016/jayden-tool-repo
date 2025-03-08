#!/bin/sh

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