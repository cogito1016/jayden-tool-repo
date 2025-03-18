# jayden-tool-nest

## 초기 설정

1. 환경변수 설정

```bash
cp env/.env.example env/.env.production
# env/.env.production 파일을 열어서 실제 값으로 수정
```

2. MySQL 실행 (최초 1회)

```bash
docker compose --env-file env/.env.production -f docker-compose.db.yml up -d
```

3. MySQL 연결 확인

```bash
docker compose --env-file env/.env.production -f docker-compose.db.yml exec mysql mysql -uroot -p
```

## 어플리케이션 배포

1. 기존 컨테이너와 이미지 제거 (DB 제외)

```bash
docker compose down --rmi all
```

2. 다시 빌드 및 실행 (DB 제외)

```bash
docker compose --env-file env/.env.production up -d --build
```

```

이렇게 하면 `env/.env.production` 파일의 환경변수를 사용하여 MySQL이 실행됩니다.
```

## 로컬실행

- npm run api:local
