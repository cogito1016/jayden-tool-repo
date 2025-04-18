# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Copy source code and env folder
COPY apps ./apps
COPY libs ./libs
COPY env ./env

# Install dependencies and build
RUN npm ci
RUN npm run build:jobs
RUN npm run build:laboratory
RUN npm run build:api

# Production stage
FROM node:20-alpine

# 타임존 설정을 위한 패키지 설치 및 설정
RUN apk add --no-cache tzdata
ENV TZ=Asia/Seoul

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and env folder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/env ./env

# Add environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV API_PORT=3001
ENV JOBS_PORT=3002
ENV LABORATORY_PORT=3002

# Start script for each application
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]