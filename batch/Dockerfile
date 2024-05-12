# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

# Want to help us make this template better? Share your feedback here: https://forms.gle/ybq9Krt8jtBL3iCk7

ARG NODE_VERSION=20.12.2

FROM node:${NODE_VERSION}-alpine

# Use production node environment by default. 
# compose.yml에 설정되어있으므로 주석
# ENV NODE_ENV production

WORKDIR /usr/src/app

# Run the application as a non-root user.
# 권한으로인한 접근문제가 발생하므로 주석
# USER node

# Copy the rest of the source files into the image.
COPY . .

RUN npm install

# Expose the port that the application listens on. 
EXPOSE 3000

# Run the application.
CMD npm run start:prod
