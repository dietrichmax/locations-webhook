FROM node:21-alpine AS base

RUN mkdir -p /opt/app

WORKDIR /opt/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

# Add health check script
COPY healthCheck.js /opt/app/healthCheck.js

# Health check
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node /opt/app/healthCheck.js || exit 1

CMD [ "npm", "run", "start"]
