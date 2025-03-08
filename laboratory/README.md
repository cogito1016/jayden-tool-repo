# jayden-tool-nest

## 초기 설정

1. 환경변수 설정

```bash
cp .env.example .env.production
# .env 파일을 열어서 실제 값으로 수정
```

2. MySQL 실행 (최초 1회)

```bash
docker compose -f docker-compose.db.yml up -d
```

3. MySQL 연결 확인

```bash
docker compose -f docker-compose.db.yml exec mysql mysql -uroot -p
```

## 어플리케이션 배포

1. 기존 컨테이너와 이미지 제거 (DB 제외)

```bash
docker compose down --rmi all
```

2. 다시 빌드 및 실행 (DB 제외)

```bash
docker compose up -d --build
```

## 유용한 명령어

### MySQL 관련

```bash
# MySQL 로그 확인
docker compose -f docker-compose.db.yml logs -f mysql

# MySQL 백업
docker compose -f docker-compose.db.yml exec mysql mysqldump -u root -p laboratory > backup.sql

# MySQL 복원
docker compose -f docker-compose.db.yml exec -T mysql mysql -u root -p laboratory < backup.sql
```

### 어플리케이션 관련

```bash
# 로그 확인
docker compose logs -f

# 특정 서비스 재시작
docker compose restart api
```
