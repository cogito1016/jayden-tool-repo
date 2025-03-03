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

# Production stage
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy built assets and env folder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/env ./env

# Add environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start script for each application
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]